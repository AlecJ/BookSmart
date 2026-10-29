import type { Request } from "express";
import type { Queryable } from "./db.js";

export interface UserRow {
	id: string;
	email: string;
	hashed_password: string;
}

export interface BookRow {
	id: string;
	google_book_id: string | null;
	title: string;
	author: string;
	description: string;
	image_url: string;
	chapter_source: ChapterSource | null;
	chapter_lookup_at: Date | null;
}

export type ChapterSource = "audible" | "openlibrary" | "openai";

export interface ChapterList {
	source: ChapterSource | null;
	titles: string[];
}

export interface ChapterRow {
	id: string;
	book_id: string;
	title: string;
}

export interface QuestionRow {
	id: string;
	chapter_id: string;
	question_text: string;
}

export interface ResponseRow {
	id: string;
	user_id: string;
	question_id: string;
	response_text: string;
	feedback_text: string | null;
	feedback_grade: number | null;
}

export interface BookChapterPublic extends ChapterRow {
	status: number | null;
	questions: Array<QuestionRow & { status: number | null }>;
}

export interface BookWithChapters extends BookRow {
	chapters: BookChapterPublic[];
}

export interface ExternalServices {
	searchBooks: (query: string) => Promise<BookMetadata[]>;
	fetchBook: (googleBookId: string) => Promise<BookMetadata>;
	findChapterList: (title: string, author: string) => Promise<ChapterList>;
	generateChapterQuestions: (
		database: Queryable,
		chapterId: string,
		book: BookRow,
		chapter: ChapterRow,
	) => Promise<string>;
	evaluateResponse: (
		database: Queryable,
		book: BookRow,
		chapter: ChapterRow,
		question: QuestionRow,
		response: string,
	) => Promise<{ feedback_text: string; feedback_grade: number }>;
}

export interface BookMetadata {
	google_book_id: string;
	title: string;
	author: string;
	description: string;
	image_url: string;
}

export interface AppDependencies {
	database: Queryable;
	services: ExternalServices;
}

export interface AuthenticatedRequest extends Request {
	user?: Pick<UserRow, "id" | "email">;
}
