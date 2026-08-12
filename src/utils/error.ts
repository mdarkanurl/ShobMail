import type { ClientErrorStatusCode, ServerErrorStatusCode } from "hono/utils/http-status";

export class CustomError extends Error {
    constructor(message: string, public statusCode: ClientErrorStatusCode | ServerErrorStatusCode) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}
