import { google } from "googleapis";
import { env } from '../config';

export const oauth2Client = new google.auth.OAuth2(
    env.CLIENT_ID,
    env.CLIENT_SECRET,
    "http://localhost:3000/api/auth/google/callback"
);
