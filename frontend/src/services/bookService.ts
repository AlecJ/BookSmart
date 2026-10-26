import type { BookType } from "../types";
import { api } from "./api";

export const bookService = {
	getBooks: async (limit: number, offset: number): Promise<BookType[]> => {
		const { data } = await api.get("/read", { params: { limit, offset } });
		return data;
	},

	searchBooks: async (query: string): Promise<BookType[]> => {
		const { data } = await api.get("/search", { params: { q: query } });
		return data;
	},

	getOrCreateSearchBook: async (bookId: string): Promise<BookType> => {
		const { data } = await api.get(`/search/${bookId}`);
		return data;
	},

	addBookToLibrary: async (book: BookType): Promise<BookType> => {
		const { data } = await api.post("/read/addBook", null, {
			params: { book_id: book.id },
		});
		return data;
	},

	getUserBookData: async (bookId: string): Promise<BookType> => {
		const { data } = await api.get(`/read/book/${bookId}`);
		return data;
	},

	getOrGenerateChapterQuestions: async (
		chapterId: string,
	): Promise<import("../types").BookChapterType> => {
		const { data } = await api.get(`/read/chapter/${chapterId}/questions`, {
			timeout: 30000,
		});
		return data;
	},

	getUserResponse: async (
		questionId: string,
	): Promise<import("../types").UserResponseType> => {
		const { data } = await api.get(`/read/question/${questionId}`);
		return data;
	},

	submitUserResponse: async (
		questionId: string,
		response: string,
	): Promise<import("../types").UserResponseType> => {
		const { data } = await api.post(`/read/question/${questionId}`, {
			response_text: response,
		});
		return data;
	},
};
