import jwt from 'jsonwebtoken';
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { JwtUtils } from "../utils";

const jwtUtils = new JwtUtils();

export function isAuthenticated() {
    return createMiddleware(async (c, next) => {
        try {
            const accesstoken = getCookie(c, "access_token");

            if (!accesstoken) return c.json({
                success: false,
                message: "Unauthenticated"
            }, 401);

            // verify the token and get the payload
            let payload;
            try {
                payload = jwtUtils.verifyJwtToken(accesstoken) as { userId: string };
            } catch (error) {
                if(error instanceof jwt.JsonWebTokenError) return c.json({
                    success: false,
                    message: "Invalid token"
                }, 400);
                if(error instanceof jwt.TokenExpiredError) return c.json({
                    success: false,
                    message: "Expired token"
                }, 400);
            }

            c.set("jwtPayload", payload);
            return next();
        } catch (error) {
            
        }
    })
}
