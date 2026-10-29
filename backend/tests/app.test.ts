import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataType, newDb } from "pg-mem";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import type { Queryable } from "../src/db.js";
import type { ExternalServices } from "../src/types.js";

const api = "/api/v1";

describe("Express reader journey", () => {
	const memoryDb = newDb();
	memoryDb.public.registerFunction({
		name: "gen_random_uuid",
		returns: DataType.uuid,
		implementation: randomUUID,
	});
	const PgPool = memoryDb.adapters.createPg().Pool;
	const database = new PgPool() as unknown as Queryable;
	const services: ExternalServices = {
		searchBooks: vi.fn(async () => [
			{
				google_book_id: "google-book-1",
				title: "The Castle",
				author: "Franz Kafka",
				description: "A novel about bureaucracy.",
				image_url: "https://example.test/cover.jpg",
			},
		]),
		fetchBook: vi.fn(async (googleBookId) => ({
			google_book_id: googleBookId,
			title: "The Castle",
			author: "Franz Kafka",
			description: "A novel about bureaucracy.",
			image_url: "https://example.test/cover.jpg",
		})),
		findChapterList: vi.fn(async () => ({
			source: "audible" as const,
			titles: ["Arrival", "Chapter 2", "Chapter 10", "Epilogue"],
		})),
		generateChapterQuestions: vi.fn(async () => "- What does K. seek?\n- Who is Barnabas?"),
		evaluateResponse: vi.fn(async () => ({
			feedback_text: "This answer demonstrates understanding.",
			feedback_grade: 2,
		})),
	};
	const app = createApp({ database, services });

	// Once per file: pg-mem cannot re-run CREATE TABLE IF NOT EXISTS on an existing table.
	beforeAll(async () => {
		const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
		const schema = await readFile(
			path.resolve(currentDirectory, "../schema.sql"),
			"utf8",
		);
		await database.query(schema);
		// Tables created by the former Alembic backend have no default here.
		await database.query(
			"ALTER TABLE userbooklink ALTER COLUMN last_updated DROP DEFAULT",
		);
	});

	it("searches, adds a book, generates a prompt, and submits an answer", async () => {
		expect((await request(app).get(`${api}/health`)).body).toEqual({ status: "ok" });

		const registration = await request(app)
			.post(`${api}/users/register`)
			.send({ email: "reader@example.test", password: "long-enough-password" })
			.expect(200);
		const authorization = `Bearer ${registration.body.access_token}`;

		const login = await request(app)
			.post(`${api}/login/access-token`)
			.type("form")
			.send({ username: "Reader@Example.test", password: "long-enough-password" })
			.expect(200);
		expect(login.body.token_type).toBe("bearer");
		await request(app).post(`${api}/login/access-token`).expect(422);
		await request(app)
			.post(`${api}/users/register`)
			.set("Content-Type", "application/json")
			.send("{not json")
			.expect(400);

		// Search and book details are requested without a token: they're public.
		const search = await request(app)
			.get(`${api}/search`)
			.query({ q: "The Castle" })
			.expect(200);
		expect(search.body).toHaveLength(1);
		expect(services.searchBooks).toHaveBeenCalledWith("The Castle");

		const details = await request(app)
			.get(`${api}/search/google-book-1`)
			.expect(200);
		expect(services.fetchBook).toHaveBeenCalledWith("google-book-1");

		// Browsers' axios client sends a literal JSON `null` body here.
		await request(app)
			.post(`${api}/read/addBook`)
			.query({ book_id: details.body.id })
			.set("Authorization", authorization)
			.set("Content-Type", "application/json")
			.send("null")
			.expect(200);
		expect(
			(await request(app).get(`${api}/read/`).set("Authorization", authorization))
				.body,
		).toHaveLength(1);

		const book = await request(app)
			.get(`${api}/read/book/${details.body.id}`)
			.set("Authorization", authorization)
			.expect(200);
		expect(book.body.chapters.map((chapter: { title: string }) => chapter.title)).toEqual([
			"Arrival",
			"Chapter 2",
			"Chapter 10",
			"Epilogue",
		]);
		expect(book.body.chapter_source).toBe("audible");
		expect(services.findChapterList).toHaveBeenCalledWith(
			"The Castle",
			"Franz Kafka",
		);
		const reloaded = await request(app)
			.get(`${api}/read/book/${details.body.id}`)
			.set("Authorization", authorization)
			.expect(200);
		expect(reloaded.body.chapters).toEqual(book.body.chapters);
		expect(services.findChapterList).toHaveBeenCalledTimes(1);

		const chapterId: string = book.body.chapters[0].id;
		await request(app)
			.get(`${api}/admin/make-question`)
			.query({ chapter_id: chapterId })
			.expect(401);
		const madeQuestion = await request(app)
			.get(`${api}/admin/make-question`)
			.query({ chapter_id: chapterId })
			.set("Authorization", authorization)
			.expect(200);
		expect(madeQuestion.body.response).toContain("What does K. seek?");
		const chapter = await request(app)
			.get(`${api}/read/chapter/${chapterId}/questions`)
			.set("Authorization", authorization)
			.expect(200);
		expect(chapter.body.questions).toHaveLength(2);
		expect(services.generateChapterQuestions).toHaveBeenCalled();

		const questionId: string = chapter.body.questions[0].id;
		const answer = await request(app)
			.post(`${api}/read/question/${questionId}`)
			.set("Authorization", authorization)
			.send({ response_text: "K. is trying to reach the Castle." })
			.expect(200);
		expect(answer.body).toMatchObject({
			response_text: "K. is trying to reach the Castle.",
			feedback_text: "This answer demonstrates understanding.",
			feedback_grade: 2,
		});
		expect(services.evaluateResponse).toHaveBeenCalledWith(
			database,
			expect.objectContaining({ title: "The Castle" }),
			expect.objectContaining({ title: "Arrival" }),
			expect.objectContaining({ id: questionId }),
			"K. is trying to reach the Castle.",
		);

		const savedAnswer = await request(app)
			.get(`${api}/read/question/${questionId}`)
			.set("Authorization", authorization)
			.expect(200);
		expect(savedAnswer.body.id).toBe(answer.body.id);

		// Removing the book empties the library but keeps the user's answers.
		await request(app)
			.delete(`${api}/read/book/${details.body.id}`)
			.set("Authorization", authorization)
			.expect(204);
		expect(
			(await request(app).get(`${api}/read/`).set("Authorization", authorization)).body,
		).toEqual([]);
		await request(app)
			.get(`${api}/read/book/${details.body.id}`)
			.set("Authorization", authorization)
			.expect(404);
		await request(app)
			.delete(`${api}/read/book/${details.body.id}`)
			.set("Authorization", authorization)
			.expect(404);
		await request(app)
			.get(`${api}/read/question/${questionId}`)
			.set("Authorization", authorization)
			.expect(200);
	});

	it("remembers when no source has a chapter list", async () => {
		const registration = await request(app)
			.post(`${api}/users/register`)
			.send({ email: "second@example.test", password: "long-enough-password" })
			.expect(200);
		const authorization = `Bearer ${registration.body.access_token}`;
		const created = await request(app)
			.post(`${api}/admin/add-book`)
			.send({ title: "The Catcher in the Rye", author: "J. D. Salinger", description: "" })
			.expect(200);
		await request(app)
			.post(`${api}/read/addBook`)
			.query({ book_id: created.body.id })
			.set("Authorization", authorization)
			.expect(200);

		vi.mocked(services.findChapterList).mockClear();
		vi.mocked(services.findChapterList).mockResolvedValue({ source: null, titles: [] });
		for (let visit = 0; visit < 2; visit += 1) {
			const book = await request(app)
				.get(`${api}/read/book/${created.body.id}`)
				.set("Authorization", authorization)
				.expect(200);
			expect(book.body.chapters).toEqual([]);
			expect(book.body.chapter_source).toBeNull();
			expect(book.body).not.toHaveProperty("chapter_lookup_at");
		}
		expect(services.findChapterList).toHaveBeenCalledTimes(1);
	});
});
