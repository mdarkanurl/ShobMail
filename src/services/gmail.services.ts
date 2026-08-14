import { db, gmailData, userCredentials, users } from "../db";
import { google } from "googleapis";
import { JwtUtils, CustomError, decrypt, encrypt, oauth2Client, syncMailQueue } from "../utils";
import type { gmail_v1, Auth } from 'googleapis';
import { convert } from "html-to-text";
import type { GmailData } from "../types";
import { DrizzleQueryError, eq, getColumns } from 'drizzle-orm';


export class GmailServices {
    private jwt;

    constructor() {
        this.jwt = new JwtUtils();
    }

    connect() {
       try {
            return oauth2Client.generateAuthUrl({
                access_type: "offline",
                prompt: "consent",
                scope: [
                    "https://www.googleapis.com/auth/gmail.readonly",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "openid",
                ],
            });
       } catch (error) {
            throw error;
       }
    }

    async callback(token: string) {
        try {
            const { tokens } = await oauth2Client.getToken(token);
            const savedTokens = tokens as any;

            oauth2Client.setCredentials(tokens);

            // Google OAuth2 API
            const oauth2 = google.oauth2({
                version: "v2",
                auth: oauth2Client,
            });

            // Get Google account information
            const { data } = await oauth2.userinfo.get();

            if (!data.email) throw new CustomError("Email is required", 400);

            // create user
            let user: { userId: string } | undefined;
            try {
                [user] = await db.insert(users).values({
                    email: data.email,
                    googleId: data.id,
                    name: data.name,
                    picture: data.picture,
                    verifiedEmail: data.verified_email
                }).returning({
                    userId: users.id
                });
            } catch (error) {
                if(error instanceof DrizzleQueryError &&
                    error.cause?.message.startsWith("duplicate key value violates unique constraint \"users_email_key\"")
                ) {
                    [user] = await db
                        .select({ userId: users.id })
                        .from(users);
                }
            }

            await db.insert(userCredentials).values({
                userId: user!.userId,
                accessToken: encrypt(tokens.access_token!),
                refreshToken: encrypt(tokens.refresh_token!),
                scope: tokens.scope!,
                tokenType: tokens.token_type!,
                refreshTokenExpiresIn: savedTokens.refresh_token_expires_in,
                expiryDate: tokens.expiry_date!
            });

            // generate jwt token and set it
            const accessToken = this.jwt.generateJwtToken({ userId: user!.userId }, 60 * 15);
            const refreshToken = this.jwt.generateJwtToken({ userId: user!.userId }, 60 * 60 * 24 * 30);

            // read the emails
            await syncMailQueue.add('syncMailQueue', { userId: user!.userId });

            return {
                accessToken,
                refreshToken
            }
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async syncGmail(UserId: string) {
        // get tokens from db
        const { id, userId, createdAt, updatedAt, ...tokensColumns } = getColumns(userCredentials);
        const [tokens] = await db
            .select(tokensColumns)
            .from(userCredentials)
            .where(eq(userCredentials.userId, UserId));

        if(!tokens) return;

        oauth2Client.setCredentials({
            ...tokens,
            access_token: decrypt(tokens.accessToken),
            refresh_token: decrypt(tokens.refreshToken)
        });
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

                if (!msg.id) return;

                parsedMessages.push({
                    userId: UserId,
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
        
        try {
            await db.insert(gmailData).values(parsedMessages);
        } catch (error) {
            if(error instanceof DrizzleQueryError &&
                    error.cause?.message.startsWith("duplicate key value violates unique constraint")
                ) return;
            // log the other errors
        }
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
