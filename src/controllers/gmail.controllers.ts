import type { Context } from "hono";
import { GmailServices } from "../services";
import { CustomError } from "../utils";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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

    async callback(c: Context) {
        try {
            const token = c.req.query("code");
            if(!token) return;

            await this.gmailServices.callback(token);
            return c.json({
                success: true,
                message: "You've successfully connected your gmail",
            });
        } catch (error) {
            if(error instanceof CustomError) return c.json({
                success: false,
                message: error.message
            }, error.statusCode as ContentfulStatusCode);
            
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}

