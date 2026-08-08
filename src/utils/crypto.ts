import crypto from "node:crypto";
import { env } from '../config';

const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(env.OAUTH_ENCRYPTION_KEY, "hex"), iv);

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64"),
    ].join(".");
}

export function decrypt(encryptedText: string): string {
    const [ivBase64, authTagBase64, encryptedBase64] =
        encryptedText.split(".");

    if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
        throw new Error("Invalid encrypted value");
    }

    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");
    const encrypted = Buffer.from(encryptedBase64, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(env.OAUTH_ENCRYPTION_KEY, "hex"), iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
