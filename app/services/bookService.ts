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
		const { data } = await api.post("/read/addBook", null, {
			params: { book_id: book.id },
		});
		return data;
	},

	getUserBookData: async (bookId: string) => {
		const { data } = await api.get(`/read/book/${bookId}`);
		return data;
	},

	getOrGenerateChapterQuestions: async (chapterId: string) => {
		const { data } = await api.get(`/read/chapter/${chapterId}/questions`);
		return data;
	},

	getUserResponse: async (questionId: string) => {
		const { data } = await api.get(`/read/question/${questionId}`);
		return data;
	},

	submitUserResponse: async (questionId: string, userResponse: string) => {
		const payload = { response_text: userResponse };
		const { data } = await api.post(
			`/read/question/${questionId}`,
			payload
		);
		return data;
	},

	getBookChapters: async (bookId: string) => {},

	getChapterById: async (chapterId: string) => {},

	getChapterQuestions: async (chapterId: string) => {},
};
