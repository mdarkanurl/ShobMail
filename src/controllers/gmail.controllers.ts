import type { Context } from "hono";
import { GmailServices } from "../services";

export class GmailControllers {
    private gmailServices;

    constructor() {
        this.gmailServices = new GmailServices();
    }

    connect(c: Context) {
        try {
            const response = this.gmailServices.connect();

            return c.json({
                success: true,
                message: "Redirect the users to this url",
                data: response
            });
        } catch (error) {
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}

