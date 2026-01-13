import { BookType } from "@/types";
import { api } from "./api";

export const bookService = {
	getBooks: async () => {
		const { data } = await api.get("/read");
		return data;
	},

	searchBooks: async (query: string) => {
		const { data } = await api.get("/search", {
			params: { q: query },
		});
		return data;
	},

	getOrCreateSearchBook: async (bookId: string) => {
		const { data } = await api.get(`/search/${bookId}`);
		return data;
	},

	addBookToLibrary: async (book: BookType) => {
		const response = await api.post("/read/add", null, {
			params: { book_id: book.id },
		});
		return response.data;
	},

	getBookById: async (id: string) => {},

	getBookChapters: async (bookId: string) => {},

	getChapterById: async (chapterId: string) => {},

	getChapterQuestions: async (chapterId: string) => {},
};
