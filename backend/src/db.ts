import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { config, getDatabaseConfig } from "./config.js";

const { Pool } = pg;

export const pool = new Pool(getDatabaseConfig());

// Without a listener, an idle client error (e.g. the server closing an idle
// connection) is thrown as an unhandled 'error' event and crashes the process.
pool.on("error", (error) => {
	console.error("Unexpected database pool error:", error);
});

export async function migrate(database: pg.Pool = pool): Promise<void> {
	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	const schemaPath = path.resolve(currentDirectory, "../schema.sql");
	const schema = await readFile(schemaPath, "utf8");
	await database.query(schema);
}

export type Queryable = Pick<pg.Pool, "query">;
