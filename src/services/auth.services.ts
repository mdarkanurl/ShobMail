import jwt from "jsonwebtoken";
import { CustomError, JwtUtils } from "../utils";

export class AuthServices {
    private readonly jwtUtils = new JwtUtils();

    async refreshToken(
        token: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const payload = this.jwtUtils
                .verifyJwtToken(token) as { userId: string };

            const accessToken = this.jwtUtils.generateJwtToken({ userId: payload.userId }, 60 * 15);
            const newRefreshToken = this.jwtUtils.generateJwtToken({ userId: payload.userId }, 60 * 60 * 24 * 30);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            if(error instanceof jwt.JsonWebTokenError) throw new CustomError("Invalid token", 400);
            if(error instanceof jwt.TokenExpiredError) throw new CustomError("Expired token", 400);
            throw error;
        }
    }
}
