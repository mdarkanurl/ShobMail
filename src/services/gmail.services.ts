import { db } from "../db";
import { encrypt, oauth2Client } from "../utils";


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
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}
