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
}
