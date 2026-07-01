import {
	BookChapterType,
	BookQuestionType,
	BookType,
	UserResponseType,
} from "@/types";
import { router } from "expo-router";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { bookService } from "../services/bookService";
import { preloadImages } from "../utils/imageCache";
import { useAuth } from "./AuthContext";

interface BookContextType {
	isLoadingBookData: boolean;
	selectedBook?: BookType;
	selectedChapter?: BookChapterType;
	setSelectedChapter: (chapter: BookChapterType | undefined) => void;
	selectedQuestion?: BookQuestionType;
	setSelectedQuestion: (question: BookQuestionType | undefined) => void;
	userResponse: string;
	setUserResponse: (userResponse: string) => void;
	feedback: UserResponseType | undefined;
	setFeedback: (feedback: UserResponseType | undefined) => void;
	books: BookType[];
	hasMoreBooks: boolean;
	isLoadingMoreBooks: boolean;
	loadMoreBooks: () => Promise<void>;
	searchBookResults: BookType[];
	getUserBooks: () => Promise<void>;
	getUserBookData: (bookId: string) => Promise<void>;
	getChapter: (chapterTitle: string) => BookChapterType | undefined;
	getOrGenerateChapterQuestions: (chapterId: string) => Promise<void>;
	getChapterQuestion: (questionId: string) => BookQuestionType | undefined;
	searchBooks: (query: string) => Promise<void>;
	isSearching?: boolean;
	viewSearchResultBook?: (bookId: string) => Promise<void>;
	addBookToLibrary: (book: BookType) => Promise<void>;
	getUserResponse: (questionId: string) => Promise<void>;
	submitUserResponse: (response: string) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactElement }) {
	const [isLoadingBookData, setIsLoadingBookData] = useState(false);
	const [selectedBook, setSelectedBook] = useState<BookType | undefined>(
		undefined,
	);
	const [selectedChapter, setSelectedChapter] = useState<
		BookChapterType | undefined
	>(undefined);
	const [selectedQuestion, setSelectedQuestion] = useState<
		BookQuestionType | undefined
	>(undefined);
	const [userResponse, setUserResponse] = useState<string>("");
	const [feedback, setFeedback] = useState<UserResponseType | undefined>(
		undefined,
	);
	const [books, setBooks] = useState<BookType[]>([]);
	const [booksOffset, setBooksOffset] = useState(0);
	const [hasMoreBooks, setHasMoreBooks] = useState(true);
	const [isLoadingMoreBooks, setIsLoadingMoreBooks] = useState(false);
	const [searchBookResults, setSearchBooks] = useState<BookType[]>([]);
	const [isSearching, setIsSeraching] = useState<boolean>(false);
	const { isLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		// Only fetch books after auth is initialized and user is authenticated
		if (!isLoading && isAuthenticated) {
			getUserBooks();
		}
	}, [isLoading, isAuthenticated]);

	const getUserBooks = useCallback(
		async (limit = 10, offset = 0, append = false) => {
			if (!isAuthenticated) return;
			try {
				if (append) setIsLoadingMoreBooks(true);
				const userBooks = await bookService.getBooks(limit, offset);

				// Preload book cover images into cache BEFORE setting state
				const imageUrls = userBooks
					.map((book: BookType) => book.image_url)
					.filter(Boolean);
				if (imageUrls.length > 0) {
					await preloadImages(imageUrls);
				}

				setBooks((prev) =>
					append ? [...prev, ...userBooks] : userBooks,
				);
				setBooksOffset(offset + userBooks.length);
				setHasMoreBooks(userBooks.length === limit);
			} catch (error: any) {
				console.error("Failed to retrieve user books:", error);
				throw new Error(
					error.response?.data?.detail ||
						"Failed to retrieve user books.",
				);
			} finally {
				if (append) setIsLoadingMoreBooks(false);
			}
		},
		[isAuthenticated],
	);

	const loadMoreBooks = useCallback(async () => {
		if (!hasMoreBooks || isLoadingMoreBooks) return;
		await getUserBooks(10, booksOffset, true);
	}, [hasMoreBooks, isLoadingMoreBooks, booksOffset, getUserBooks]);

	const getUserBookData = useCallback(
		async (bookId: string) => {
			if (!isAuthenticated) return;
			try {
				const bookData = await bookService.getUserBookData(bookId);
				setSelectedBook(bookData);
			} catch (error: any) {
				console.error("Failed to retrieve book data:", error);
				router.replace("/+not-found");
			}
		},
		[isAuthenticated],
	);

	const searchBooks = useCallback(async (query: string) => {
		try {
			setIsSeraching(true);
			const results = await bookService.searchBooks(query);

			// Preload search result images into cache BEFORE setting state
			const imageUrls = results
				.map((book: BookType) => book.image_url)
				.filter(Boolean);
			if (imageUrls.length > 0) {
				await preloadImages(imageUrls);
			}

			setSearchBooks(results);
			setIsSeraching(false);
		} catch (error: any) {
			console.error("Book search failed:", error);
			throw new Error(
				error.response?.data?.detail || "Book search failed.",
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
					"Failed to retrieve book details.",
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
						"Failed to add book to library.",
				);
			}
		},
		[isAuthenticated],
	);

	const getChapter = (chapterId: string) => {
		if (!selectedBook) return;

		return (selectedBook?.chapters || []).find(
			(chapter) => String(chapter.id) === chapterId,
		);
	};

	const getOrGenerateChapterQuestions = useCallback(
		async (chapterId: string, retries = 3) => {
			for (let attempt = 0; attempt < retries; attempt++) {
				try {
					const chapter =
						await bookService.getOrGenerateChapterQuestions(
							chapterId,
						);
					setSelectedChapter(chapter);
					return;
				} catch (error: any) {
					console.error(
						"Failed to retrieve chapter questions:",
						error,
					);
					await new Promise((res) => setTimeout(res, 2500));
				}
			}
			router.replace("/+not-found");
		},
		[],
	);

	const getChapterQuestion = (questionId: string) => {
		if (!selectedChapter) return;

		return (selectedChapter?.questions || []).find(
			(question) => String(question.id) === questionId,
		);
	};

	const getUserResponse = useCallback(async (questionId: string) => {
		try {
			setIsLoadingBookData(true);
			// NOT RETURNING feedback_grade
			const userResponse = await bookService.getUserResponse(questionId);
			setUserResponse(userResponse?.response_text || "");
			setFeedback(userResponse);
		} catch (error: any) {
			setUserResponse("");
			setFeedback(undefined);
		} finally {
			setIsLoadingBookData(false);
		}
	}, []);

	const submitUserResponse = useCallback(
		// TODO turn into submitOrGet
		// add retry logic
		async (userResponse: string) => {
			setFeedback(undefined);

			try {
				const newUserResponse = await bookService.submitUserResponse(
					selectedQuestion?.id,
					userResponse,
				);
				setFeedback(newUserResponse);

				// Update the question status based on feedback grade
				const newStatus = newUserResponse.feedback_grade;

				// Update the question in the chapter's questions array
				if (selectedChapter && selectedQuestion) {
					const updatedQuestions = selectedChapter.questions?.map(
						(q) =>
							q.id === selectedQuestion.id
								? { ...q, status: newStatus }
								: q,
					);
					setSelectedChapter({
						...selectedChapter,
						questions: updatedQuestions,
					});
				}
			} catch (error: any) {
				return;
			}
		},
		[isAuthenticated, selectedQuestion, selectedChapter],
	);

	return (
		<BookContext.Provider
			value={{
				isLoadingBookData,
				selectedBook,
				selectedChapter,
				setSelectedChapter,
				selectedQuestion,
				setSelectedQuestion,
				userResponse,
				setUserResponse,
				feedback,
				setFeedback,
				books,
				hasMoreBooks,
				isLoadingMoreBooks,
				loadMoreBooks,
				searchBookResults,
				getUserBookData,
				getUserBooks,
				getChapter,
				getOrGenerateChapterQuestions,
				getChapterQuestion,
				searchBooks,
				isSearching,
				viewSearchResultBook,
				addBookToLibrary,
				getUserResponse,
				submitUserResponse,
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
