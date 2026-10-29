import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

interface SettingSeed {
	key: string;
	value: string;
	data_type: string;
}

interface BookSeed {
	google_book_id: string;
	title: string;
	author: string;
	description: string;
	image_url: string;
}

async function readSeed<T>(filename: string): Promise<T[]> {
	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	const seedPath = path.resolve(currentDirectory, "../seeds", filename);
	return JSON.parse(await readFile(seedPath, "utf8")) as T[];
}

async function seedSettings(): Promise<void> {
	for (const setting of await readSeed<SettingSeed>("settings.json")) {
		await pool.query(
			`INSERT INTO settings (key, value, data_type)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (key) DO NOTHING`,
			[setting.key, setting.value, setting.data_type],
		);
	}
}

async function seedBooks(): Promise<void> {
	for (const book of await readSeed<BookSeed>("books.json")) {
		await pool.query(
			`INSERT INTO book
			 (id, google_book_id, title, author, description, image_url)
			 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
			 ON CONFLICT DO NOTHING`,
			[
				book.google_book_id,
				book.title,
				book.author,
				book.description,
				book.image_url,
			],
		);
	}
}

const action = process.argv[2];
try {
	if (action === "settings") await seedSettings();
	else if (action === "books") await seedBooks();
	else throw new Error("Specify either 'settings' or 'books'.");
} catch (error) {
	console.error("Database seeding failed:", error);
	process.exitCode = 1;
} finally {
	await pool.end();
}
