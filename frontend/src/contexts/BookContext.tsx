import axios from "axios";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";
import {
	type BookChapterType,
	type BookQuestionType,
	type BookType,
	type UserResponseType,
} from "../types";
import { bookService } from "../services/bookService";
import { getApiErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";

interface BookContextValue {
	books: BookType[];
	booksLoading: boolean;
	booksError: string;
	hasMoreBooks: boolean;
	isLoadingMoreBooks: boolean;
	loadMoreBooks: () => Promise<void>;
	getUserBooks: () => Promise<void>;
	selectedBook?: BookType;
	selectedChapter?: BookChapterType;
	setSelectedChapter: (chapter: BookChapterType | undefined) => void;
	selectedQuestion?: BookQuestionType;
	setSelectedQuestion: (question: BookQuestionType | undefined) => void;
	getUserBookData: (bookId: string) => Promise<BookType>;
	getOrGenerateChapterQuestions: (chapterId: string) => Promise<void>;
	searchBookResults: BookType[];
	isSearching: boolean;
	searchError: string;
	searchBooks: (query: string) => Promise<void>;
	viewSearchResultBook: (bookId: string) => Promise<BookType>;
	addBookToLibrary: (book: BookType) => Promise<BookType>;
	removeBookFromLibrary: (bookId: string) => Promise<void>;
	userResponse: string;
	setUserResponse: (response: string) => void;
	feedback?: UserResponseType;
	// Resolves to the saved answer, or undefined if there is none (or a newer
	// request has replaced this one).
	getUserResponse: (questionId: string) => Promise<UserResponseType | undefined>;
	submitUserResponse: (response: string) => Promise<void>;
}

const BookContext = createContext<BookContextValue | undefined>(undefined);
const PAGE_SIZE = 10;

// Retry only failures that might succeed later (network errors, timeouts and
// server errors), not client errors such as a missing chapter.
function isRetryable(error: unknown): boolean {
	if (!axios.isAxiosError(error)) return false;
	return !error.response || error.response.status >= 500;
}

export function BookProvider({ children }: { children: ReactNode }) {
	const { isLoading, isAuthenticated } = useAuth();
	const [books, setBooks] = useState<BookType[]>([]);
	const [booksLoading, setBooksLoading] = useState(false);
	const [booksError, setBooksError] = useState("");
	const [booksOffset, setBooksOffset] = useState(0);
	const [hasMoreBooks, setHasMoreBooks] = useState(true);
	const [isLoadingMoreBooks, setIsLoadingMoreBooks] = useState(false);
	const [selectedBook, setSelectedBook] = useState<BookType>();
	const [selectedChapter, setSelectedChapter] = useState<BookChapterType>();
	const [selectedQuestion, setSelectedQuestion] = useState<BookQuestionType>();
	const [searchBookResults, setSearchBookResults] = useState<BookType[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState("");
	const [userResponse, setUserResponse] = useState("");
	const [feedback, setFeedback] = useState<UserResponseType>();
	// Only the most recent request may update state, so a slow earlier
	// response can't overwrite a newer one.
	const latestSearch = useRef("");
	const latestResponseQuestion = useRef("");

	const getUserBooks = useCallback(async () => {
		if (!isAuthenticated) {
			setBooks([]);
			return;
		}
		setBooksLoading(true);
		setBooksError("");
		try {
			const result = await bookService.getBooks(PAGE_SIZE, 0);
			setBooks(result);
			setBooksOffset(result.length);
			setHasMoreBooks(result.length === PAGE_SIZE);
		} catch (error) {
			const message = getApiErrorMessage(error, "Failed to retrieve books.");
			setBooksError(message);
			throw new Error(message);
		} finally {
			setBooksLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (isLoading) return;
		if (isAuthenticated) {
			void getUserBooks().catch((error: unknown) =>
				console.error("Failed to load library:", error),
			);
			return;
		}
		// Signed out: drop the previous user's library and reading state.
		setBooks([]);
		setBooksError("");
		setBooksOffset(0);
		setHasMoreBooks(true);
		setSelectedBook(undefined);
		setSelectedChapter(undefined);
		setSelectedQuestion(undefined);
		setUserResponse("");
		setFeedback(undefined);
	}, [isLoading, isAuthenticated, getUserBooks]);

	const loadMoreBooks = useCallback(async () => {
		if (!isAuthenticated || !hasMoreBooks || isLoadingMoreBooks) return;
		setIsLoadingMoreBooks(true);
		try {
			const result = await bookService.getBooks(PAGE_SIZE, booksOffset);
			setBooks((current) => [...current, ...result]);
			setBooksOffset((current) => current + result.length);
			setHasMoreBooks(result.length === PAGE_SIZE);
		} finally {
			setIsLoadingMoreBooks(false);
		}
	}, [booksOffset, hasMoreBooks, isAuthenticated, isLoadingMoreBooks]);

	const getUserBookData = useCallback(async (bookId: string) => {
		const book = await bookService.getUserBookData(bookId);
		setSelectedBook(book);
		return book;
	}, []);

	// Keeps the selected chapter and its copy inside the selected book in sync,
	// since the chapter and question pages read from the book.
	const applyChapter = useCallback((chapter: BookChapterType) => {
		setSelectedChapter(chapter);
		setSelectedBook((current) =>
			current
				? {
						...current,
						chapters: current.chapters?.map((item) =>
							item.id === chapter.id ? chapter : item,
						),
					}
				: current,
		);
	}, []);

	const getOrGenerateChapterQuestions = useCallback(
		async (chapterId: string) => {
			let lastError: unknown;
			for (let attempt = 0; attempt < 3; attempt += 1) {
				try {
					applyChapter(
						await bookService.getOrGenerateChapterQuestions(chapterId),
					);
					return;
				} catch (error) {
					lastError = error;
					if (!isRetryable(error)) break;
					if (attempt < 2) {
						await new Promise((resolve) => window.setTimeout(resolve, 1500));
					}
				}
			}
			throw new Error(
				getApiErrorMessage(lastError, "Failed to load chapter questions."),
			);
		},
		[applyChapter],
	);

	const searchBooks = useCallback(async (query: string) => {
		latestSearch.current = query;
		setIsSearching(true);
		setSearchError("");
		try {
			const results = await bookService.searchBooks(query);
			if (latestSearch.current === query) setSearchBookResults(results);
		} catch (error) {
			if (latestSearch.current !== query) return;
			console.error("Book search failed:", error);
			setSearchBookResults([]);
			setSearchError("Unable to retrieve your results. Please try again.");
		} finally {
			if (latestSearch.current === query) setIsSearching(false);
		}
	}, []);

	const viewSearchResultBook = useCallback(async (bookId: string) => {
		const book = await bookService.getOrCreateSearchBook(bookId);
		setSelectedBook(book);
		return book;
	}, []);

	const addBookToLibrary = useCallback(async (book: BookType) => {
		const newBook = await bookService.addBookToLibrary(book);
		setBooks((current) => [newBook, ...current]);
		// The new book is first in the server's ordering, so later pages shift by one.
		setBooksOffset((current) => current + 1);
		return newBook;
	}, []);

	const removeBookFromLibrary = useCallback(async (bookId: string) => {
		await bookService.removeBookFromLibrary(bookId);
		setBooks((current) => current.filter((book) => book.id !== bookId));
		// One fewer book precedes the next page on the server.
		setBooksOffset((current) => Math.max(0, current - 1));
		// The cached copy carries this user's chapters; drop it so re-opening
		// the book goes through the server's library check.
		setSelectedBook((current) => (current?.id === bookId ? undefined : current));
	}, []);

	const getUserResponse = useCallback(async (questionId: string) => {
		latestResponseQuestion.current = questionId;
		setUserResponse("");
		setFeedback(undefined);
		try {
			const response = await bookService.getUserResponse(questionId);
			if (latestResponseQuestion.current !== questionId) return undefined;
			setUserResponse(response?.response_text || "");
			setFeedback(response);
			return response;
		} catch (error) {
			if (latestResponseQuestion.current !== questionId) return undefined;
			if (axios.isAxiosError(error) && error.response?.status === 404) return undefined;
			throw error;
		}
	}, []);

	const submitUserResponse = useCallback(
		async (response: string) => {
			if (!selectedQuestion) {
				throw new Error("Select a question before submitting a response.");
			}
			const result = await bookService.submitUserResponse(
				String(selectedQuestion.id),
				response,
			);
			setFeedback(result);
			setUserResponse(response);
			const markAnswered = (chapter: BookChapterType): BookChapterType => ({
				...chapter,
				questions: chapter.questions?.map((question) =>
					question.id === selectedQuestion.id
						? { ...question, status: result.feedback_grade }
						: question,
				),
			});
			setSelectedChapter((chapter) => chapter && markAnswered(chapter));
			setSelectedBook((book) =>
				book
					? {
							...book,
							chapters: book.chapters?.map((chapter) =>
								chapter.id === selectedQuestion.chapter_id
									? markAnswered(chapter)
									: chapter,
							),
						}
					: book,
			);
			// The server computes the chapter's overall status; refresh it so the
			// book page reflects this answer. The question status is already set.
			void bookService
				.getOrGenerateChapterQuestions(selectedQuestion.chapter_id)
				.then(applyChapter)
				.catch((error: unknown) =>
					console.error("Failed to refresh chapter status:", error),
				);
		},
		[applyChapter, selectedQuestion],
	);

	const value = useMemo(
		() => ({
			books,
			booksLoading,
			booksError,
			hasMoreBooks,
			isLoadingMoreBooks,
			loadMoreBooks,
			getUserBooks,
			selectedBook,
			selectedChapter,
			setSelectedChapter,
			selectedQuestion,
			setSelectedQuestion,
			getUserBookData,
			getOrGenerateChapterQuestions,
			searchBookResults,
			isSearching,
			searchError,
			searchBooks,
			viewSearchResultBook,
			addBookToLibrary,
			removeBookFromLibrary,
			userResponse,
			setUserResponse,
			feedback,
			getUserResponse,
			submitUserResponse,
		}),
		[
			books,
			booksLoading,
			booksError,
			hasMoreBooks,
			isLoadingMoreBooks,
			loadMoreBooks,
			getUserBooks,
			selectedBook,
			selectedChapter,
			selectedQuestion,
			getUserBookData,
			getOrGenerateChapterQuestions,
			searchBookResults,
			isSearching,
			searchError,
			searchBooks,
			viewSearchResultBook,
			addBookToLibrary,
			removeBookFromLibrary,
			userResponse,
			feedback,
			getUserResponse,
			submitUserResponse,
		],
	);

	return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

export function useBooksCtx() {
	const context = useContext(BookContext);
	if (!context) {
		throw new Error("useBooksCtx must be used within a BookProvider");
	}
	return context;
}
