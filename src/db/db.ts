import { JSONFilePreset } from "lowdb/node";


type UserCredentials = {
    access_token: string
    refresh_token: string
    scope: string
    token_type: "Bearer"
    refresh_token_expires_in: number
    expiry_date: number
}


const defaultData = {
  userCredentials: [] as UserCredentials[],
};

export const db = await JSONFilePreset("db.json", defaultData);
