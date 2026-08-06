import { oauth2Client } from "../utils";


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
            const { tokens } = await oauth2Client.getToken(token as string);

            // Save tokens in DB
            console.log(tokens)
        } catch (error) {
            throw error;
        }
    }
}
