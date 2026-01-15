import { BookChapterType, BookQuestionType, BookType } from "@/types";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { bookService } from "../services/bookService";
import { preloadImages } from "../utils/imageCache";
import { useAuth } from "./AuthContext";

interface BookContextType {
	selectedBook?: BookType;
	selectedChapter?: BookChapterType;
	setSelectedChapter: (chapter: BookChapterType | undefined) => void;
	selectedQuestion?: BookQuestionType;
	setSelectedQuestion: (question: BookQuestionType | undefined) => void;
	books: BookType[];
	searchBookResults: BookType[];
	getUserBooks: () => Promise<void>;
	getUserBookData: (bookId: string) => Promise<void>;
	getChapter: (chapterTitle: string) => BookChapterType | undefined;
	searchBooks: (query: string) => Promise<void>;
	viewSearchResultBook?: (bookId: string) => Promise<void>;
	addBookToLibrary: (book: BookType) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactElement }) {
	const [selectedBook, setSelectedBook] = useState<BookType | undefined>(
		undefined
	);
	const [selectedChapter, setSelectedChapter] = useState<
		BookChapterType | undefined
	>(undefined);
	const [selectedQuestion, setSelectedQuestion] = useState<
		BookQuestionType | undefined
	>(undefined);
	const [books, setBooks] = useState<BookType[]>([]);
	const [searchBookResults, setSearchBooks] = useState<BookType[]>([]);
	const { isLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		// Only fetch books after auth is initialized and user is authenticated
		if (!isLoading && isAuthenticated) {
			getUserBooks();
		}
	}, [isLoading, isAuthenticated]);

	const getUserBooks = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			const userBooks = await bookService.getBooks();

			// Preload book cover images into cache BEFORE setting state
			const imageUrls = userBooks
				.map((book) => book.image_url)
				.filter(Boolean);
			if (imageUrls.length > 0) {
				await preloadImages(imageUrls);
			}

			setBooks(userBooks);
		} catch (error: any) {
			console.error("Failed to retrieve user books:", error);
			throw new Error(
				error.response?.data?.detail || "Failed to retrieve user books."
			);
		}
	}, [isAuthenticated]);

	const getUserBookData = useCallback(
		async (bookId: string) => {
			if (!isAuthenticated) return;
			try {
				const bookData = await bookService.getUserBookData(bookId);
				setSelectedBook(bookData);
			} catch (error: any) {
				console.error("Failed to retrieve book data:", error);
				throw new Error(
					error.response?.data?.detail ||
						"Failed to retrieve book data."
				);
			}
		},
		[isAuthenticated]
	);

	const searchBooks = useCallback(async (query: string) => {
		try {
			const results = await bookService.searchBooks(query);

			// Preload search result images into cache BEFORE setting state
			const imageUrls = results
				.map((book) => book.image_url)
				.filter(Boolean);
			if (imageUrls.length > 0) {
				await preloadImages(imageUrls);
			}

			setSearchBooks(results);
		} catch (error: any) {
			console.error("Book search failed:", error);
			throw new Error(
				error.response?.data?.detail || "Book search failed."
			);
		}
	}, []);

	const viewSearchResultBook = useCallback(async (bookId: string) => {
		try {
			const book = await bookService.getOrCreateSearchBook(bookId);
			setSelectedBook(book);
		} catch (error: any) {
			console.error("Failed to retrieve book details:", error);
			throw new Error(
				error.response?.data?.detail ||
					"Failed to retrieve book details."
			);
		}
	}, []);

	const addBookToLibrary = useCallback(
		async (book: BookType) => {
			if (!isAuthenticated) return;
			try {
				const newBook = await bookService.addBookToLibrary(book);
				setBooks((prevBooks) => [newBook, ...prevBooks]);
			} catch (error: any) {
				console.error("Failed to add book to library:", error);
				throw new Error(
					error.response?.data?.detail ||
						"Failed to add book to library."
				);
			}
		},
		[isAuthenticated]
	);

	const getChapter = (chapterId: string) => {
		if (!selectedBook) return;

		return (selectedBook?.chapters || []).find(
			(chapter) => String(chapter.id) === chapterId
		);
	};

	return (
		<BookContext.Provider
			value={{
				selectedBook,
				selectedChapter,
				setSelectedChapter,
				selectedQuestion,
				setSelectedQuestion,
				books,
				searchBookResults,
				getUserBookData,
				getUserBooks,
				getChapter,
				searchBooks,
				viewSearchResultBook,
				addBookToLibrary,
			}}
		>
			{children}
		</BookContext.Provider>
	);
}

export function useBooksCtx() {
	const context = React.useContext(BookContext);
	if (context === undefined) {
		throw new Error("useBooksCtx must be used within a BookProvider");
	}
	return context;
}
