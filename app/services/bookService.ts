import { Book } from "@/types";
import { api } from "./api";

export const bookService = {
	getBooks: async () => {
		const { data } = await api.get("/read");
		return data;
	},

	addBookToLibrary: async (book: Book) => {
		const response = await api.post("/read/add/", { book_id: book.id });
		return response.data;
	},

	getBookById: async (id: string) => {},

	getBookChapters: async (bookId: string) => {},

	getChapterById: async (chapterId: string) => {},

	getChapterQuestions: async (chapterId: string) => {},
};
