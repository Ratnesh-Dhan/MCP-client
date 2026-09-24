import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("./data/jinah.db");
export const db = drizzle(sqlite);
