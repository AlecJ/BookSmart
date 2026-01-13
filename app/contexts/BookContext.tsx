import { BookType } from "@/types";
import React, { createContext, useEffect, useState } from "react";
import { bookService } from "../services/bookService";
import { useAuth } from "./AuthContext";

interface BookContextType {
	selectedBook?: BookType;
	books: BookType[];
	searchBookResults: BookType[];
	getUserBooks: () => Promise<void>;
	searchBooks: (query: string) => Promise<void>;
	viewSearchResultBook?: (bookId: string) => Promise<void>;
	addBookToLibrary: (book: BookType) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactElement }) {
	const [selectedBook, setSelectedBook] = useState<BookType | undefined>(
		undefined
	);
	const [books, setBooks] = useState<BookType[]>([]);
	const [searchBookResults, setSearchBooks] = useState<BookType[]>([]);
	const { isLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		// Only fetch books after auth is initialized and user is authenticated
		if (!isLoading && isAuthenticated) {
			getUserBooks();
		}
	}, [isLoading, isAuthenticated]);

	const getUserBooks = async () => {
		try {
			const userBooks = await bookService.getBooks();
			setBooks(userBooks);
		} catch (error: any) {
			console.error("Failed to retrieve user books:", error);
			throw new Error(
				error.response?.data?.detail || "Failed to retrieve user books."
			);
		}
	};

	const searchBooks = async (query: string) => {
		try {
			const results = await bookService.searchBooks(query);
			setSearchBooks(results);
		} catch (error: any) {
			console.error("Book search failed:", error);
			throw new Error(
				error.response?.data?.detail || "Book search failed."
			);
		}
	};

	const viewSearchResultBook = async (bookId: string) => {
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
	};

	const addBookToLibrary = async (book: BookType) => {
		try {
			const userBooks = await bookService.addBookToLibrary(book);
			setBooks(userBooks);
		} catch (error: any) {
			console.error("Failed to add book to library:", error);
			throw new Error(
				error.response?.data?.detail || "Failed to add book to library."
			);
		}
	};

	return (
		<BookContext.Provider
			value={{
				selectedBook,
				books,
				searchBookResults,
				getUserBooks,
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
