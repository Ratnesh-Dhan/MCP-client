import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database("./data/jinah.db");
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite);

migrate(db, {
  migrationsFolder: "./src/db/migrations",
});
