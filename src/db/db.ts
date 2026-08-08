import { JSONFilePreset } from "lowdb/node";
import type { UserCredentials } from "../types";


const defaultData = {
  userCredentials: [] as UserCredentials[],
};

export const db = await JSONFilePreset("db.json", defaultData);
