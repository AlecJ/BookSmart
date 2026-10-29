import type { BookType } from "../types";
import { api } from "./api";

export const bookService = {
	getBooks: async (limit: number, offset: number): Promise<BookType[]> => {
		const { data } = await api.get("/read", { params: { limit, offset } });
		return data;
	},

	searchBooks: async (query: string): Promise<BookType[]> => {
		// The API retries Google once, so allow for two upstream attempts.
		const { data } = await api.get("/search", { params: { q: query }, timeout: 25000 });
		return data;
	},

	getOrCreateSearchBook: async (bookId: string): Promise<BookType> => {
		const { data } = await api.get(`/search/${encodeURIComponent(bookId)}`);
		return data;
	},

	addBookToLibrary: async (book: BookType): Promise<BookType> => {
		const { data } = await api.post("/read/addBook", undefined, {
			params: { book_id: book.id },
		});
		return data;
	},

	removeBookFromLibrary: async (bookId: string): Promise<void> => {
		await api.delete(`/read/book/${encodeURIComponent(bookId)}`);
	},

	getUserBookData: async (bookId: string): Promise<BookType> => {
		// The first visit may look the chapter list up in several sources,
		// ending with an OpenAI call.
		const { data } = await api.get(`/read/book/${encodeURIComponent(bookId)}`, {
			timeout: 60000,
		});
		return data;
	},

	getOrGenerateChapterQuestions: async (
		chapterId: string,
	): Promise<import("../types").BookChapterType> => {
		const { data } = await api.get(`/read/chapter/${encodeURIComponent(chapterId)}/questions`, {
			timeout: 30000,
		});
		return data;
	},

	getUserResponse: async (
		questionId: string,
	): Promise<import("../types").UserResponseType> => {
		const { data } = await api.get(`/read/question/${encodeURIComponent(questionId)}`);
		return data;
	},

	submitUserResponse: async (
		questionId: string,
		response: string,
	): Promise<import("../types").UserResponseType> => {
		const { data } = await api.post(`/read/question/${encodeURIComponent(questionId)}`, {
			response_text: response,
		});
		return data;
	},
};
