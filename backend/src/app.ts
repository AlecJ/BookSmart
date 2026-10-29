import bcrypt from "bcryptjs";
import cors from "cors";
import express, {
	type ErrorRequestHandler,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "./config.js";
import { pool, type Queryable } from "./db.js";
import { HttpError } from "./errors.js";
import { externalServices } from "./services/index.js";
import type {
	AuthenticatedRequest,
	BookMetadata,
	BookRow,
	BookWithChapters,
	ChapterRow,
	ChapterSource,
	ExternalServices,
	QuestionRow,
	ResponseRow,
	UserRow,
} from "./types.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const idSchema = z.string().regex(UUID_PATTERN, "Invalid UUID");
const registerSchema = z.object({
	email: z.string().email().max(255),
	password: z.string().min(8).max(128),
});
const loginSchema = z.object({
	username: z.string(),
	password: z.string(),
});
const CHAPTER_COLUMNS = "id, title, book_id";
const bookSchema = z.object({
	title: z.string().min(1),
	author: z.string(),
	description: z.string(),
	google_book_id: z.string().nullable().optional(),
	image_url: z.string().optional().default(""),
});
const chapterSchema = z.object({ title: z.string().min(1) });
const questionSchema = z.object({ question_text: z.string().min(1) });
const answerSchema = z.object({ response_text: z.string().max(1000) });

function validationError(issues: z.ZodIssue[]): HttpError {
	return new HttpError(
		422,
		issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", "),
	);
}

function validate<T>(schema: z.ZodType<T>, value: unknown): T {
	const result = schema.safeParse(value);
	if (!result.success) throw validationError(result.error.issues);
	return result.data;
}

function tokenFor(user: UserRow): string {
	return jwt.sign({ sub: user.id }, config.secretKey, {
		algorithm: "HS256",
		expiresIn: config.tokenExpiryMinutes * 60,
	});
}

function tokenResponse(user: UserRow) {
	return { access_token: tokenFor(user), token_type: "bearer" };
}

function setUser(request: Request, user: AuthenticatedRequest["user"]) {
	(request as AuthenticatedRequest).user = user;
}

function getUser(request: Request): NonNullable<AuthenticatedRequest["user"]> {
	const user = (request as AuthenticatedRequest).user;
	if (!user) throw new HttpError(401, "Not authenticated");
	return user;
}

async function requireUser(
	request: Request,
	database: Queryable,
): Promise<NonNullable<AuthenticatedRequest["user"]>> {
	const header = request.header("authorization");
	const match = header?.match(/^Bearer\s+(.+)$/i);
	if (!match) throw new HttpError(401, "Not authenticated");

	let userId: string;
	try {
		const token = match[1];
		if (!token) throw new Error("Missing bearer token");
		const payload = jwt.verify(token, config.secretKey, {
			algorithms: ["HS256"],
		});
		if (typeof payload === "string" || !payload.sub) throw new Error("Invalid subject");
		userId = idSchema.parse(payload.sub);
	} catch {
		throw new HttpError(403, "Could not validate credentials");
	}
	const user = await database.query<Pick<UserRow, "id" | "email">>(
		'SELECT id, email FROM "user" WHERE id = $1',
		[userId],
	);
	if (!user.rows[0]) throw new HttpError(404, "User not found");
	return user.rows[0];
}

function authenticated(
	database: Queryable,
	handler: (request: AuthenticatedRequest, response: Response) => unknown,
) {
	return async (request: Request, response: Response, next: NextFunction) => {
		try {
			const user = await requireUser(request, database);
			setUser(request, user);
			await handler(request as AuthenticatedRequest, response);
		} catch (error) {
			next(error);
		}
	};
}

// Books with no chapter list are looked up again after this long, in case a
// source has added one.
const CHAPTER_LOOKUP_RETRY_MS = 7 * 24 * 60 * 60 * 1000;

function isChapterLookupDue(book: BookRow): boolean {
	return (
		!book.chapter_lookup_at ||
		Date.now() - new Date(book.chapter_lookup_at).getTime() > CHAPTER_LOOKUP_RETRY_MS
	);
}

function mapBook({ chapter_lookup_at: _lookupAt, ...book }: BookRow) {
	return {
		...book,
		prettyName: book.title,
		name: book.title,
		progress: 0,
	};
}

async function findBookById(database: Queryable, id: string) {
	const result = await database.query<BookRow>("SELECT * FROM book WHERE id = $1", [id]);
	return result.rows[0];
}

async function findBookByGoogleId(database: Queryable, googleId: string) {
	const result = await database.query<BookRow>(
		"SELECT * FROM book WHERE google_book_id = $1",
		[googleId],
	);
	return result.rows[0];
}

async function findBookByTitleAuthor(
	database: Queryable,
	title: string,
	author: string,
) {
	const result = await database.query<BookRow>(
		"SELECT * FROM book WHERE title = $1 AND author = $2",
		[title, author],
	);
	return result.rows[0];
}

async function saveBook(database: Queryable, book: BookMetadata) {
	const foundByGoogleId = await findBookByGoogleId(database, book.google_book_id);
	if (foundByGoogleId) return foundByGoogleId;
	const foundByTitleAuthor = await findBookByTitleAuthor(
		database,
		book.title,
		book.author,
	);
	if (foundByTitleAuthor) return foundByTitleAuthor;

	// A concurrent request may insert the same book between the lookups above
	// and this insert, so fall back to the row it created.
	const result = await database.query<BookRow>(
		`INSERT INTO book (id, google_book_id, title, author, description, image_url)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
		 ON CONFLICT DO NOTHING
		 RETURNING *`,
		[
			book.google_book_id,
			book.title,
			book.author,
			book.description,
			book.image_url,
		],
	);
	return (
		result.rows[0] ??
		(await findBookByGoogleId(database, book.google_book_id)) ??
		(await findBookByTitleAuthor(database, book.title, book.author))
	);
}

async function findChapter(database: Queryable, chapterId: string) {
	const result = await database.query<ChapterRow>(
		`SELECT ${CHAPTER_COLUMNS} FROM bookchapter WHERE id = $1`,
		[chapterId],
	);
	return result.rows[0];
}

async function findQuestion(database: Queryable, questionId: string) {
	const result = await database.query<QuestionRow>(
		"SELECT * FROM chapterquestion WHERE id = $1",
		[questionId],
	);
	return result.rows[0];
}

async function chapterPublic(
	database: Queryable,
	userId: string,
	chapter: ChapterRow,
): Promise<BookWithChapters["chapters"][number]> {
	const results = await database.query<
		QuestionRow & { feedback_grade: number | null }
	>(
		`SELECT cq.id, cq.chapter_id, cq.question_text, ur.feedback_grade
		 FROM chapterquestion cq
		 LEFT JOIN userresponse ur
		   ON ur.question_id = cq.id AND ur.user_id = $2
		 WHERE cq.chapter_id = $1`,
		[chapter.id, userId],
	);

	const questions = results.rows.map(({ feedback_grade, ...question }) => ({
		...question,
		status: feedback_grade,
	}));
	let chapterStatus: number | null = null;
	for (const question of questions) {
		if (question.status !== null) {
			chapterStatus =
				chapterStatus === null
					? question.status
					: Math.min(chapterStatus, question.status);
		} else if (chapterStatus !== null) {
			chapterStatus = Math.min(chapterStatus, 1);
		}
	}
	return { ...chapter, status: chapterStatus, questions };
}

function questionLines(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
		.filter(Boolean);
}

function externalDefaults(overrides?: Partial<ExternalServices>): ExternalServices {
	return { ...externalServices, ...overrides };
}

// Shares one in-flight task per key so concurrent requests (e.g. React
// StrictMode double effects) don't both generate and insert the same rows.
function singleFlight<T>() {
	const pending = new Map<string, Promise<T>>();
	return (key: string, task: () => Promise<T>): Promise<T> => {
		let promise = pending.get(key);
		if (!promise) {
			promise = task().finally(() => pending.delete(key));
			pending.set(key, promise);
		}
		return promise;
	};
}

export function createApp(options: {
	database: Queryable;
	services?: Partial<ExternalServices>;
}): express.Express {
	const { database } = options;
	const services = externalDefaults(options.services);
	const app = express();
	const origins = new Set(config.corsOrigins);
	const chapterGeneration = singleFlight<{
		chapters: ChapterRow[];
		source: ChapterSource | null;
	}>();
	const questionGeneration = singleFlight<void>();

	app.disable("x-powered-by");
	app.use(
		cors({
			credentials: true,
			origin(origin, callback) {
				// Disallowed origins get no CORS headers (the browser blocks them)
				// rather than an error response for every request.
				callback(null, !origin || origins.has(origin.replace(/\/+$/, "")));
			},
		}),
	);
	// Non-strict so a literal `null` body (sent by some clients for bodiless
	// POSTs such as addBook) parses instead of failing, as it did with FastAPI.
	app.use(express.json({ limit: "1mb", strict: false }));
	app.use(express.urlencoded({ extended: false }));
	app.use((request, response, next) => {
		const start = Date.now();
		response.on("finish", () => {
			console.info(
				// originalUrl: `path` is relative to the router by the time this runs.
				`${request.method} ${request.originalUrl.split("?")[0]} ${response.statusCode} ${Date.now() - start}ms`,
			);
		});
		next();
	});

	const api = express.Router();
	app.use(config.apiPrefix, api);

	api.get("/health", (_request, response) => response.json({ status: "ok" }));

	api.post("/users/register", async (request, response, next) => {
		try {
			const input = validate(registerSchema, request.body);
			const email = input.email.trim().toLowerCase();
			const existing = await database.query<UserRow>(
				'SELECT * FROM "user" WHERE LOWER(email) = $1',
				[email],
			);
			if (existing.rows[0]) {
				throw new HttpError(400, "The user with this email already exists in the system.");
			}
			const result = await database.query<UserRow>(
				`INSERT INTO "user" (id, email, hashed_password)
				 VALUES (gen_random_uuid(), $1, $2)
				 RETURNING *`,
				[email, await bcrypt.hash(input.password, 12)],
			);
			const user = result.rows[0];
			if (!user) throw new Error("User insert did not return a row");
			response.json(tokenResponse(user));
		} catch (error) {
			next(error);
		}
	});

	api.post("/login/access-token", async (request, response, next) => {
		try {
			const input = validate(loginSchema, request.body);
			const email = input.username.trim().toLowerCase();
			const password = input.password;
			// Accounts created by the former backend may have mixed-case emails.
			const result = await database.query<UserRow>(
				'SELECT * FROM "user" WHERE LOWER(email) = $1',
				[email],
			);
			const user = result.rows[0];
			if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
				throw new HttpError(400, "Incorrect email or password");
			}
			response.json(tokenResponse(user));
		} catch (error) {
			next(error);
		}
	});

	// Search is public so visitors can browse books before signing in.
	api.get("/search", async (request, response, next) => {
		try {
			const query = String(request.query.q || "").trim();
			if (!query) throw new HttpError(422, "q: Field required");
			response.json(await services.searchBooks(query));
		} catch (error) {
			next(error);
		}
	});

	api.get("/search/:googleBookId", async (request, response, next) => {
		try {
			const googleId = request.params.googleBookId;
			const existing = await findBookByGoogleId(database, googleId);
			const book =
				existing || (await saveBook(database, await services.fetchBook(googleId)));
			if (!book) throw new Error("Book insert did not return a row");
			response.json(mapBook(book));
		} catch (error) {
			next(error);
		}
	});

	api.get("/read/", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const limit = Number(request.query.limit ?? 10);
		const offset = Number(request.query.offset ?? 0);
		if (
			!Number.isInteger(limit) ||
			limit < 0 ||
			!Number.isInteger(offset) ||
			offset < 0
		) {
			throw new HttpError(422, "limit and offset must be non-negative integers");
		}
		const result = await database.query<BookRow>(
			`SELECT b.* FROM userbooklink ubl
			 JOIN book b ON b.id = ubl.book_id
			 WHERE ubl.user_id = $1
			 ORDER BY ubl.last_updated DESC
			 LIMIT $2 OFFSET $3`,
			[user.id, limit, offset],
		);
		response.json(result.rows.map(mapBook));
	}));

	api.get("/read/book/:bookId", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const bookId = validate(idSchema, request.params.bookId);
		const access = await database.query(
			"SELECT 1 FROM userbooklink WHERE user_id = $1 AND book_id = $2",
			[user.id, bookId],
		);
		if (!access.rowCount) {
			throw new HttpError(404, "Book not found in user's library");
		}
		const book = await findBookById(database, bookId);
		if (!book) throw new HttpError(404, "Book not found");

		let chapters = (
			await database.query<ChapterRow>(
				`SELECT ${CHAPTER_COLUMNS} FROM bookchapter WHERE book_id = $1 ORDER BY sort_order`,
				[bookId],
			)
		).rows;
		let chapterSource = book.chapter_source;
		if (chapters.length === 0 && isChapterLookupDue(book)) {
			({ chapters, source: chapterSource } = await chapterGeneration(book.id, async () => {
				const list = await services.findChapterList(book.title, book.author);
				const created: ChapterRow[] = [];
				for (const title of list.titles) {
					const result = await database.query<ChapterRow>(
						`INSERT INTO bookchapter (id, title, book_id)
						 VALUES (gen_random_uuid(), $1, $2) RETURNING ${CHAPTER_COLUMNS}`,
						[title, book.id],
					);
					if (result.rows[0]) created.push(result.rows[0]);
				}
				// Recorded even when nothing was found, so the sources (one of them
				// an OpenAI call) aren't queried again on every visit.
				await database.query(
					"UPDATE book SET chapter_source = $1, chapter_lookup_at = CURRENT_TIMESTAMP WHERE id = $2",
					[list.source, book.id],
				);
				return { chapters: created, source: list.source };
			}));
		}
		const chapterResults = await Promise.all(
			chapters.map((chapter) => chapterPublic(database, user.id, chapter)),
		);
		response.json({
			...mapBook(book),
			chapter_source: chapterSource,
			chapters: chapterResults,
		});
	}));

	api.post("/read/addBook", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const bookId = validate(idSchema, request.query.book_id);
		const userExists = await database.query(
			'SELECT id FROM "user" WHERE id = $1',
			[user.id],
		);
		if (!userExists.rowCount) throw new HttpError(404, "User not found");
		const book = await findBookById(database, bookId);
		if (!book) throw new HttpError(404, "Book not found");
		const existing = await database.query(
			"SELECT 1 FROM userbooklink WHERE user_id = $1 AND book_id = $2",
			[user.id, bookId],
		);
		if (existing.rowCount) {
			throw new HttpError(400, "Book already in user's library");
		}
		// last_updated is set explicitly: tables created by the former backend
		// have no column default for it.
		await database.query(
			`INSERT INTO userbooklink (user_id, book_id, last_updated)
			 VALUES ($1, $2, CURRENT_TIMESTAMP)`,
			[user.id, bookId],
		);
		response.json(mapBook(book));
	}));

	// Removes the book from the user's library only. Their answers are kept, so
	// re-adding the book restores their progress.
	api.delete("/read/book/:bookId", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const bookId = validate(idSchema, request.params.bookId);
		const removed = await database.query(
			"DELETE FROM userbooklink WHERE user_id = $1 AND book_id = $2",
			[user.id, bookId],
		);
		if (!removed.rowCount) {
			throw new HttpError(404, "Book not found in user's library");
		}
		response.status(204).end();
	}));

	api.get("/read/chapter/:chapterId/questions", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const chapterId = validate(idSchema, request.params.chapterId);
		const chapter = await findChapter(database, chapterId);
		if (!chapter) throw new HttpError(404, "Chapter not found");
		const existing = await database.query(
			"SELECT 1 FROM chapterquestion WHERE chapter_id = $1 LIMIT 1",
			[chapterId],
		);
		if (!existing.rowCount) {
			const book = await findBookById(database, chapter.book_id);
			if (!book) throw new HttpError(404, "Book not found");
			await questionGeneration(chapterId, async () => {
				const generated = await services.generateChapterQuestions(
					database,
					chapterId,
					book,
					chapter,
				);
				for (const text of questionLines(generated)) {
					await database.query(
						`INSERT INTO chapterquestion (id, question_text, chapter_id)
						 VALUES (gen_random_uuid(), $1, $2)`,
						[text, chapterId],
					);
				}
			});
		}
		const chapterWithStatus = await chapterPublic(database, user.id, chapter);
		response.json(chapterWithStatus);
	}));

	api.get("/read/question/:questionId", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const questionId = validate(idSchema, request.params.questionId);
		const result = await database.query<ResponseRow>(
			"SELECT * FROM userresponse WHERE user_id = $1 AND question_id = $2",
			[user.id, questionId],
		);
		if (!result.rows[0]) throw new HttpError(404, "User response not found");
		response.json(result.rows[0]);
	}));

	api.post("/read/question/:questionId", authenticated(database, async (request, response) => {
		const user = getUser(request);
		const questionId = validate(idSchema, request.params.questionId);
		const input = validate(answerSchema, request.body);
		const question = await findQuestion(database, questionId);
		if (!question) throw new HttpError(404, "Question not found");
		const chapter = await findChapter(database, question.chapter_id);
		if (!chapter) throw new HttpError(404, "Chapter not found");
		const book = await findBookById(database, chapter.book_id);
		if (!book) throw new HttpError(404, "Book not found");
		const feedback = await services.evaluateResponse(
			database,
			book,
			chapter,
			question,
			input.response_text,
		);
		if (![0, 1, 2].includes(feedback.feedback_grade)) {
			throw new HttpError(502, "Feedback service returned an invalid grade.");
		}
		await database.query(
			"DELETE FROM userresponse WHERE user_id = $1 AND question_id = $2",
			[user.id, questionId],
		);
		const result = await database.query<ResponseRow>(
			`INSERT INTO userresponse
			 (id, user_id, question_id, response_text, feedback_text, feedback_grade)
			 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
			 RETURNING *`,
			[
				user.id,
				questionId,
				input.response_text,
				feedback.feedback_text,
				feedback.feedback_grade,
			],
		);
		response.json(result.rows[0]);
	}));

	// Requires a signed-in user because each call spends OpenAI credits.
	api.get("/admin/make-question", authenticated(database, async (request, response) => {
		const chapterId = validate(idSchema, request.query.chapter_id);
		const chapter = await findChapter(database, chapterId);
		if (!chapter) throw new HttpError(404, "Chapter not found");
		const book = await findBookById(database, chapter.book_id);
		if (!book) throw new HttpError(404, "Book not found");
		const result = await services.generateChapterQuestions(
			database,
			chapterId,
			book,
			chapter,
		);
		response.json({ response: result });
	}));

	api.post("/admin/add-book", async (request, response, next) => {
		try {
			const input = validate(bookSchema, request.body);
			if (await findBookByTitleAuthor(database, input.title, input.author)) {
				throw new HttpError(400, "Book with this title and author already exists.");
			}
			const result = await database.query<BookRow>(
				`INSERT INTO book (id, google_book_id, title, author, description, image_url)
				 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *`,
				[
					input.google_book_id ?? null,
					input.title,
					input.author,
					input.description,
					input.image_url,
				],
			);
			response.json(result.rows[0]);
		} catch (error) {
			next(error);
		}
	});

	api.post("/admin/add-chapter", async (request, response, next) => {
		try {
			const input = validate(chapterSchema, request.body);
			const bookId = validate(idSchema, request.query.book_id);
			if (!(await findBookById(database, bookId))) {
				throw new HttpError(400, "Chapter could not be added. Ensure the book exists.");
			}
			const result = await database.query<ChapterRow>(
				`INSERT INTO bookchapter (id, title, book_id)
				 VALUES (gen_random_uuid(), $1, $2) RETURNING ${CHAPTER_COLUMNS}`,
				[input.title, bookId],
			);
			response.json(result.rows[0]);
		} catch (error) {
			next(error);
		}
	});

	api.post("/admin/add-chapter-question", async (request, response, next) => {
		try {
			const input = validate(questionSchema, request.body);
			const chapterId = validate(idSchema, request.query.chapter_id);
			if (!(await findChapter(database, chapterId))) {
				throw new HttpError(400, "Question could not be added. Ensure the chapter exists.");
			}
			const duplicate = await database.query(
				"SELECT 1 FROM chapterquestion WHERE question_text = $1",
				[input.question_text],
			);
			if (duplicate.rowCount) {
				throw new HttpError(400, "Question with this text already exists.");
			}
			const result = await database.query<QuestionRow>(
				`INSERT INTO chapterquestion (id, question_text, chapter_id)
				 VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
				[input.question_text, chapterId],
			);
			response.json(result.rows[0]);
		} catch (error) {
			next(error);
		}
	});

	api.use((_request, _response, next) => next(new HttpError(404, "Not Found")));

	const errors: ErrorRequestHandler = (error, _request, response, _next) => {
		if (error instanceof HttpError) {
			response.status(error.status).json({ detail: error.message });
			return;
		}
		// Body parser failures (malformed JSON, oversized payloads) are client errors.
		const clientError = error as { status?: number; expose?: boolean; message?: string };
		if (clientError.expose && clientError.status && clientError.status < 500) {
			response.status(clientError.status).json({ detail: clientError.message });
			return;
		}
		const pgError = error as { code?: string };
		if (pgError.code === "23505") {
			response.status(400).json({ detail: "A record with these values already exists." });
			return;
		}
		if (pgError.code === "23503") {
			response.status(400).json({ detail: "A related record does not exist." });
			return;
		}
		console.error("Unhandled API error:", error);
		response.status(500).json({ detail: "Internal server error" });
	};
	app.use(errors);
	return app;
}

export const app = createApp({ database: pool });
