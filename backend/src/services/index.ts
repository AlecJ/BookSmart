import type { ExternalServices } from "../types.js";
import { findChapterList } from "./chapters.js";
import { fetchGoogleBook, searchGoogleBooks } from "./google-books.js";
import { evaluateAnswer, generateChapterQuestions } from "./openai.js";

export const externalServices: ExternalServices = {
	searchBooks: searchGoogleBooks,
	fetchBook: fetchGoogleBook,
	findChapterList,
	generateChapterQuestions,
	evaluateResponse: evaluateAnswer,
};
