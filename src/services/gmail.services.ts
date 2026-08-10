import { db } from "../db";
import { google } from "googleapis";
import { encrypt, oauth2Client } from "../utils";
import type { gmail_v1, Auth } from 'googleapis';
import { convert } from "html-to-text";
import type { GmailData } from "../types";


export class GmailServices {

    connect() {
       try {
            return oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: [
                    "https://www.googleapis.com/auth/gmail.readonly"
                ],
                prompt: "consent"
            });
       } catch (error) {
            throw error;
       }
    }

    async callback(token: string) {
        try {
            const { tokens } = await oauth2Client.getToken(token);
            const savedTokens = tokens as any;

            // Save tokens in DB
            db.data.userCredentials.push({
                access_token: encrypt(tokens.access_token!),
                refresh_token: encrypt(tokens.refresh_token!),
                scope: tokens.scope!,
                token_type: tokens.token_type!,
                refresh_token_expires_in: savedTokens.refresh_token_expires_in,
                expiry_date: tokens.expiry_date!
            });

            await db.write();

            // read email and send those to queue
            void this.syncGmail(tokens).catch(err => console.error('gmail sync failed', err));
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    private async syncGmail(tokens: Auth.Credentials) {
        oauth2Client.setCredentials(tokens);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const { data } = await gmail.users.messages.list({ userId: 'me', maxResults: 500 });
        if (!data.messages?.length) return;

        const CONCURRENCY = 10;
        const parsedMessages: GmailData[] = [];

        for (let i = 0; i < data.messages.length; i += CONCURRENCY) {
            const batch = data.messages.slice(i, i + CONCURRENCY);
            const results = await Promise.allSettled(
                batch.map(m => gmail.users.messages.get({ userId: 'me', id: m.id!, format: 'full' }))
            );

            for (const result of results) {
                if (result.status !== 'fulfilled') continue;
                const msg = result.value.data;
                parsedMessages.push({
                    id: msg.id,
                    threadId: msg.threadId,
                    snippet: this.stripInvisibleChars(msg.snippet ?? ''),
                    from: this.getHeader(msg.payload?.headers, 'From'),
                    to: this.getHeader(msg.payload?.headers, 'To'),
                    subject: this.getHeader(msg.payload?.headers, 'Subject'),
                    date: this.getHeader(msg.payload?.headers, 'Date'),
                    body: this.stripInvisibleChars(this.getCleanBody(msg.payload)),
                });
            }
        }

        db.data.gmailData.push(...parsedMessages);
        await db.write();
    }

    private decodeBase64Url(data: string): string {
        return Buffer.from(data, 'base64url').toString('utf-8');
    }

    private getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
        return headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
    }

    private extractBody(payload: gmail_v1.Schema$MessagePart | undefined): { text: string; mimeType: string } {
        if (!payload) return {
            text: '',
            mimeType: 'text/plain'
        };

        if (payload.body?.data) {
            return {
                text: this.decodeBase64Url(payload.body.data),
                mimeType: payload.mimeType ?? 'text/plain'
            };
        }

        if (payload.parts?.length) {
            const plain = payload.parts.find(p => p.mimeType === 'text/plain');
            if (plain?.body?.data) {
                return { text: this.decodeBase64Url(plain.body.data), mimeType: 'text/plain' };
            }

            const html = payload.parts.find(p => p.mimeType === 'text/html');
            if (html?.body?.data) {
                return { text: this.decodeBase64Url(html.body.data), mimeType: 'text/html' };
            }

            for (const part of payload.parts) {
                const nested = this.extractBody(part);
                if (nested.text) return nested;
            }
        }

        return { text: '', mimeType: 'text/plain' };
    }

    private htmlToPlainText(html: string): string {
        return convert(html, {
            wordwrap: false,
            selectors: [
                { selector: 'a', format: 'skip' },
                { selector: 'img', format: 'skip' },
                { selector: 'style', format: 'skip' },
                { selector: 'script', format: 'skip' },
            ],
        }).trim();
    }

    private getCleanBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
        const { text, mimeType } = this.extractBody(payload);
        if (mimeType === 'text/html') {
            return this.htmlToPlainText(text);
        }
        return text;
    }

    private stripInvisibleChars(text: string): string {
        return text.replace(/[\u034F\u200B-\u200D\uFEFF]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
}
