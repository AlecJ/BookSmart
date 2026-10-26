import axios from "axios";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
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
	getChapter: (chapterId: string) => BookChapterType | undefined;
	getOrGenerateChapterQuestions: (chapterId: string) => Promise<void>;
	getChapterQuestion: (questionId: string) => BookQuestionType | undefined;
	searchBookResults: BookType[];
	isSearching: boolean;
	searchError: string;
	searchBooks: (query: string) => Promise<void>;
	viewSearchResultBook: (bookId: string) => Promise<BookType>;
	bookDetailsError: string;
	addBookToLibrary: (book: BookType) => Promise<BookType>;
	userResponse: string;
	setUserResponse: (response: string) => void;
	feedback?: UserResponseType;
	getUserResponse: (questionId: string) => Promise<void>;
	submitUserResponse: (response: string) => Promise<void>;
}

const BookContext = createContext<BookContextValue | undefined>(undefined);

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
	const [bookDetailsError, setBookDetailsError] = useState("");
	const [userResponse, setUserResponse] = useState("");
	const [feedback, setFeedback] = useState<UserResponseType>();

	const getUserBooks = useCallback(async () => {
		if (!isAuthenticated) {
			setBooks([]);
			return;
		}
		setBooksLoading(true);
		setBooksError("");
		try {
			const result = await bookService.getBooks(10, 0);
			setBooks(result);
			setBooksOffset(result.length);
			setHasMoreBooks(result.length === 10);
		} catch (error) {
			const message = getApiErrorMessage(error, "Failed to retrieve books.");
			setBooksError(message);
			throw new Error(message);
		} finally {
			setBooksLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			void getUserBooks().catch((error: unknown) =>
				console.error("Failed to load library:", error),
			);
		}
	}, [isLoading, isAuthenticated, getUserBooks]);

	const loadMoreBooks = useCallback(async () => {
		if (!isAuthenticated || !hasMoreBooks || isLoadingMoreBooks) return;
		setIsLoadingMoreBooks(true);
		try {
			const result = await bookService.getBooks(10, booksOffset);
			setBooks((current) => [...current, ...result]);
			setBooksOffset((current) => current + result.length);
			setHasMoreBooks(result.length === 10);
		} finally {
			setIsLoadingMoreBooks(false);
		}
	}, [booksOffset, hasMoreBooks, isAuthenticated, isLoadingMoreBooks]);

	const getUserBookData = useCallback(async (bookId: string) => {
		const book = await bookService.getUserBookData(bookId);
		setSelectedBook(book);
		return book;
	}, []);

	const getChapter = useCallback(
		(chapterId: string) =>
			selectedBook?.chapters?.find(
				(chapter) => String(chapter.id) === chapterId,
			),
		[selectedBook],
	);

	const getOrGenerateChapterQuestions = useCallback(
		async (chapterId: string) => {
			let lastError: unknown;
			for (let attempt = 0; attempt < 3; attempt += 1) {
				try {
					const chapter =
						await bookService.getOrGenerateChapterQuestions(chapterId);
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
					return;
				} catch (error) {
					lastError = error;
					if (attempt < 2) {
						await new Promise((resolve) => window.setTimeout(resolve, 1500));
					}
				}
			}
			throw new Error(
				getApiErrorMessage(lastError, "Failed to load chapter questions."),
			);
		},
		[],
	);

	const getChapterQuestion = useCallback(
		(questionId: string) =>
			selectedChapter?.questions?.find(
				(question) => String(question.id) === questionId,
			),
		[selectedChapter],
	);

	const searchBooks = useCallback(async (query: string) => {
		setIsSearching(true);
		setSearchError("");
		try {
			setSearchBookResults(await bookService.searchBooks(query));
		} catch (error) {
			setSearchBookResults([]);
			setSearchError(getApiErrorMessage(error, "Book search failed."));
		} finally {
			setIsSearching(false);
		}
	}, []);

	const viewSearchResultBook = useCallback(async (bookId: string) => {
		setBookDetailsError("");
		try {
			const book = await bookService.getOrCreateSearchBook(bookId);
			setSelectedBook(book);
			return book;
		} catch (error) {
			const message = getApiErrorMessage(error, "Failed to retrieve book details.");
			setBookDetailsError(message);
			throw new Error(message);
		}
	}, []);

	const addBookToLibrary = useCallback(async (book: BookType) => {
		const newBook = await bookService.addBookToLibrary(book);
		setBooks((current) => [newBook, ...current]);
		return newBook;
	}, []);

	const getUserResponse = useCallback(async (questionId: string) => {
		setUserResponse("");
		setFeedback(undefined);
		try {
			const response = await bookService.getUserResponse(questionId);
			setUserResponse(response?.response_text || "");
			setFeedback(response);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) return;
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
			setSelectedChapter((chapter) =>
				chapter
					? {
							...chapter,
							questions: chapter.questions?.map((question) =>
								question.id === selectedQuestion.id
									? { ...question, status: result.feedback_grade }
									: question,
							),
						}
					: chapter,
			);
		},
		[selectedQuestion],
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
			getChapter,
			getOrGenerateChapterQuestions,
			getChapterQuestion,
			searchBookResults,
			isSearching,
			searchError,
			searchBooks,
			viewSearchResultBook,
			bookDetailsError,
			addBookToLibrary,
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
			getChapter,
			getOrGenerateChapterQuestions,
			getChapterQuestion,
			searchBookResults,
			isSearching,
			searchError,
			searchBooks,
			viewSearchResultBook,
			bookDetailsError,
			addBookToLibrary,
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
