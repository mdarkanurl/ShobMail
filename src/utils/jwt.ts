import jwt from "jsonwebtoken";
import { env } from "../config";

export class JwtUtils {
    private readonly jwt = jwt;

    generateJwtToken(payload: Object, expiresIn: number): string {
        return this.jwt.sign(payload, env.JWT_SECRET, { expiresIn });
    }

    verifyJwtToken(token: string) {
        return this.jwt.verify(token, env.JWT_SECRET);
    }
}
