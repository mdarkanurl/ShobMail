import type { Context } from "hono";
import { AuthServices } from "../services";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

export class AuthControllers {
    private readonly authServices = new AuthServices();

    async refreshToken(c: Context) {
        try {
            const token = getCookie(c, "refresh_token");

            if (!token) {
                return c.json({
                    success: false,
                    message: "Refresh token not found"
                }, 400);
            }

            const response = await this.authServices.refreshToken(token);

            setCookie(c, 'access_token', response.accessToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 60,
                expires: new Date(Date.now() + 30 * 60 * 1000),
                sameSite: 'Lax',
            });

            setCookie(c, 'refresh_token', response.refreshToken, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                sameSite: 'Lax',
            });

            return c.json({
                success: true,
                message: "Token refreshed successfully"
            });
        } catch (error) {
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }

    async logout(c: Context) {
        try {
            deleteCookie(c, 'access_token');
            deleteCookie(c, 'refresh_token');

            return c.json({
                success: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}
