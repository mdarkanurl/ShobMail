import { JSONFilePreset } from "lowdb/node";
import type { UserCredentials, GmailData } from "../types";


const defaultData = {
  userCredentials: [] as UserCredentials[],
  gmailData: [] as GmailData[]
};

export const db = await JSONFilePreset("db.json", defaultData);
