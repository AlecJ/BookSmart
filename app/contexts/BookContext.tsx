import { Book } from "@/types";
import React, { createContext, useEffect, useState } from "react";
import { bookService } from "../services/bookService";
import { useAuth } from "./AuthContext";

interface BookContextType {
	books: Book[];
	getBooks: () => Promise<void>;
	addBookToLibrary: (book: Book) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactElement }) {
	const [books, setBooks] = useState<Book[]>([]);
	const { isLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		// Only fetch books after auth is initialized and user is authenticated
		if (!isLoading && isAuthenticated) {
			getBooks();
		}
	}, [isLoading, isAuthenticated]);

	const getBooks = async () => {
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

	const addBookToLibrary = async (book: Book) => {};

	return (
		<BookContext.Provider
			value={{
				books,
				getBooks,
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
