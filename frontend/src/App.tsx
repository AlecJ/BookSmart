import {
	useEffect,
	useMemo,
	useState,
} from "react";
import type { FormEvent, ReactNode } from "react";
import {
	Link,
	Navigate,
	Outlet,
	Route,
	Routes,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import placeholderCover from "../assets/images/book-cover-placeholder.png";
import { useAuth } from "./contexts/AuthContext";
import { useBooksCtx } from "./contexts/BookContext";
import { getApiErrorMessage } from "./services/api";
import type { BookChapterType, BookQuestionType, BookType } from "./types";

function Loading({ label = "Loading..." }: { label?: string }) {
	return (
		<div className="loading-state" role="status">
			<span className="spinner" aria-hidden="true" />
			<span>{label}</span>
		</div>
	);
}

function AppHeader() {
	const { isAuthenticated, logout } = useAuth();
	const [query, setQuery] = useState("");
	const navigate = useNavigate();

	const submitSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const search = query.trim();
		if (!search) return;
		navigate(`/search?q=${encodeURIComponent(search)}`);
	};

	return (
		<header className="site-header">
			<div className="header-content">
				<Link className="brand" to={isAuthenticated ? "/" : "/search"}>
					<span className="brand-mark" aria-hidden="true">B</span>
					<span>BookSmart</span>
				</Link>
				<form className="header-search" onSubmit={submitSearch} role="search">
					<span aria-hidden="true">⌕</span>
					<input
						aria-label="Search books"
						placeholder="Search for books..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<button aria-label="Submit book search" type="submit">Search</button>
				</form>
				<nav className="header-nav" aria-label="Main navigation">
					{isAuthenticated ? (
						<>
							<Link to="/">My library</Link>
							<Link to="/profile">Profile</Link>
							<button className="link-button" onClick={logout} type="button">
								Log out
							</button>
						</>
					) : (
						<>
							<Link to="/login">Sign in</Link>
							<Link className="nav-cta" to="/register">Create account</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}

function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth();
	if (isLoading) return <Loading />;
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AuthRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	if (isLoading) return <Loading />;
	return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function BookCover({
	book,
	className = "",
}: {
	book: BookType;
	className?: string;
}) {
	return (
		<img
			className={`book-cover ${className}`}
			src={book.image_url || placeholderCover}
			alt={`Cover of ${book.prettyName || book.title}`}
			onError={(event) => {
				event.currentTarget.src = placeholderCover;
			}}
		/>
	);
}

function BookCard({
	book,
	featured = false,
}: {
	book: BookType;
	featured?: boolean;
}) {
	return (
		<Link className={`book-card${featured ? " featured-book" : ""}`} to={`/read/${book.id}`}>
			<BookCover book={book} />
			{featured && book.progress ? (
				<div className="progress-track" aria-label={`${Math.round(book.progress * 100)}% read`}>
					<span style={{ width: `${Math.min(100, book.progress * 100)}%` }} />
				</div>
			) : null}
			{featured ? <span className="continue-label">Continue reading <span aria-hidden="true">→</span></span> : null}
		</Link>
	);
}

function HomePage() {
	const { books, booksLoading, booksError } = useBooksCtx();

	if (booksLoading && books.length === 0) return <Loading label="Loading your library..." />;
	if (booksError && books.length === 0) {
		return <PageMessage title="Your library couldn't load" message={booksError} />;
	}
	if (books.length === 0) {
		return (
			<section className="empty-library">
				<span className="eyebrow">A smarter way to read</span>
				<h1>Make every chapter count.</h1>
				<p>Find a book to add to your library and build your understanding as you read.</p>
				<Link className="button primary-button" to="/search">Discover books</Link>
			</section>
		);
	}

	return (
		<div className="home-layout">
			<section className="continue-section">
				<div className="section-heading">
					<div>
						<span className="eyebrow">Pick up where you left off</span>
						<h1>Continue reading</h1>
					</div>
				</div>
				<BookCard book={books[0]} featured />
				<div className="featured-book-copy">
					<h2>{books[0].prettyName || books[0].title}</h2>
					<p>by {books[0].author}</p>
					<Link to={`/read/${books[0].id}`}>Open book <span aria-hidden="true">→</span></Link>
				</div>
			</section>
			<section className="library-section">
				<div className="section-heading">
					<div>
						<span className="eyebrow">Your collection</span>
						<h2>Your library</h2>
					</div>
					<Link className="text-link" to="/profile">Reading history <span aria-hidden="true">→</span></Link>
				</div>
				<div className="book-grid">
					{books.slice(1, 7).map((book) => <BookCard key={book.id} book={book} />)}
				</div>
				{books.length === 1 && <p className="muted">Search for more books to grow your library.</p>}
			</section>
		</div>
	);
}

function AuthPage({ isRegister = false }: { isRegister?: boolean }) {
	const { login, register } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		if (isRegister && password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setIsSubmitting(true);
		try {
			if (isRegister) await register(email, password);
			else await login(email, password);
			navigate("/", { replace: true });
		} catch (submitError) {
			setError(getApiErrorMessage(
				submitError,
				isRegister ? "Registration failed." : "Incorrect email or password.",
			));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="auth-page">
			<div className="auth-card">
				<span className="eyebrow">{isRegister ? "Start your reading journey" : "Welcome back"}</span>
				<h1>{isRegister ? "Create your account" : "Sign in to BookSmart"}</h1>
				<p className="muted">{isRegister ? "Save your books and keep track of your progress." : "Your library is waiting for you."}</p>
				<form className="auth-form" onSubmit={submit}>
					{error && <p className="form-error" role="alert">{error}</p>}
					<label>
						Email
						<input
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</label>
					<label>
						Password
						<input
							type="password"
							autoComplete={isRegister ? "new-password" : "current-password"}
							required
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</label>
					{isRegister && (
						<label>
							Confirm password
							<input
								type="password"
								autoComplete="new-password"
								required
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
							/>
						</label>
					)}
					<button className="button primary-button full-width" disabled={isSubmitting}>
						{isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
					</button>
				</form>
				<p className="auth-switch">
					{isRegister ? "Already have an account?" : "New to BookSmart?"}{" "}
					<Link to={isRegister ? "/login" : "/register"}>
						{isRegister ? "Sign in" : "Create an account"}
					</Link>
				</p>
			</div>
		</section>
	);
}

function ProfilePage() {
	const { books, booksError, hasMoreBooks, isLoadingMoreBooks, loadMoreBooks } = useBooksCtx();
	const [loadError, setLoadError] = useState("");
	const handleLoadMore = async () => {
		setLoadError("");
		try {
			await loadMoreBooks();
		} catch (error) {
			setLoadError(getApiErrorMessage(error, "More books could not be loaded."));
		}
	};
	return (
		<section className="content-page">
			<div className="page-heading">
				<span className="eyebrow">Your account</span>
				<h1>Your reading history</h1>
				<p>Every book you have added to your BookSmart library.</p>
			</div>
			{booksError && <p className="form-error" role="alert">{booksError}</p>}
			{loadError && <p className="form-error" role="alert">{loadError}</p>}
			{books.length === 0 ? (
				<div className="empty-state">
					<h2>No books yet</h2>
					<p>Search for a book and add it to your library to get started.</p>
					<Link className="button primary-button" to="/search">Find a book</Link>
				</div>
			) : (
				<div className="reading-list">
					{books.map((book) => (
						<Link className="reading-row" key={book.id} to={`/read/${book.id}`}>
							<BookCover book={book} />
							<span className="reading-row-details">
								<strong>{book.prettyName || book.title}</strong>
								<span>by {book.author}</span>
							</span>
							<span className="row-arrow" aria-hidden="true">→</span>
						</Link>
					))}
				</div>
			)}
			{hasMoreBooks && books.length > 0 && (
				<button className="button secondary-button load-more" onClick={() => void handleLoadMore()} disabled={isLoadingMoreBooks}>
					{isLoadingMoreBooks ? "Loading..." : "Load more"}
				</button>
			)}
		</section>
	);
}

function SearchPage() {
	const { searchBookResults, isSearching, searchError, searchBooks } = useBooksCtx();
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") || "";
	useEffect(() => {
		if (query.trim()) void searchBooks(query);
	}, [query, searchBooks]);

	if (!query) {
		return (
			<section className="content-page">
				<div className="page-heading">
					<span className="eyebrow">Find your next read</span>
					<h1>Discover books</h1>
					<p>Search by title or author using the search bar above.</p>
				</div>
			</section>
		);
	}
	return (
		<section className="content-page">
			<div className="page-heading">
				<span className="eyebrow">Search results</span>
				<h1>Books matching “{query}”</h1>
			</div>
			{isSearching ? <Loading label="Searching books..." /> :
				searchError ? <PageMessage title="Search failed" message={searchError} /> :
					searchBookResults.length === 0 ? <div className="empty-state"><h2>No books found</h2><p>Try a different title or author.</p></div> :
						<div className="search-results">
							{searchBookResults.map((book) => (
								<Link className="search-result" key={book.google_book_id} to={`/search/${encodeURIComponent(book.google_book_id)}`}>
									<BookCover book={book} />
									<span className="search-result-info">
										<strong>{book.prettyName || book.title}</strong>
										<span>by {book.author}</span>
										<span className="search-description">{book.description}</span>
									</span>
									<span className="row-arrow" aria-hidden="true">→</span>
								</Link>
							))}
						</div>
			}
		</section>
	);
}

function SearchBookDetailsPage() {
	const { bookId = "" } = useParams();
	const { books, viewSearchResultBook, addBookToLibrary, bookDetailsError } = useBooksCtx();
	const { isAuthenticated } = useAuth();
	const [book, setBook] = useState<BookType>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [adding, setAdding] = useState(false);
	const navigate = useNavigate();
	const isInLibrary = !!book && books.some((item) => item.google_book_id === book.google_book_id);

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError("");
		void viewSearchResultBook(bookId)
			.then((result) => { if (active) setBook(result); })
			.catch((loadError: unknown) => {
				if (active) setError(getApiErrorMessage(loadError, bookDetailsError || "Book details could not be loaded."));
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [bookId, viewSearchResultBook]);

	const handleAdd = async () => {
		if (!book) return;
		if (isInLibrary) {
			const existing = books.find((item) => item.google_book_id === book.google_book_id);
			if (existing) navigate(`/read/${existing.id}`);
			return;
		}
		setAdding(true);
		setError("");
		try {
			const savedBook = await addBookToLibrary(book);
			navigate(`/read/${savedBook.id}`);
		} catch (addError) {
			setError(getApiErrorMessage(addError, "Failed to add this book to your library."));
		} finally {
			setAdding(false);
		}
	};

	if (loading) return <Loading label="Loading book details..." />;
	if (!book) return <PageMessage title="Book unavailable" message={error || bookDetailsError} />;
	return (
		<section className="book-detail content-page">
			<BookCover book={book} className="detail-cover" />
			<div className="book-detail-copy">
				<span className="eyebrow">Book details</span>
				<h1>{book.prettyName || book.title}</h1>
				<p className="book-author">by {book.author}</p>
				<p className="book-description">{book.description || "No description is available for this book."}</p>
				{error && <p className="form-error" role="alert">{error}</p>}
				{isAuthenticated ? (
					<button className="button primary-button" onClick={() => void handleAdd()} disabled={adding}>
						{adding ? "Adding..." : isInLibrary ? "Open book" : "Add to library"}
					</button>
				) : (
					<Link className="button primary-button" to="/login">Sign in to add to library</Link>
				)}
			</div>
		</section>
	);
}

function ReadBookLayout() {
	const { bookId = "" } = useParams();
	const { selectedBook, getUserBookData } = useBooksCtx();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		if (selectedBook?.id === bookId && selectedBook.chapters !== undefined) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setError("");
		void getUserBookData(bookId)
			.catch((loadError: unknown) => {
				if (active) setError(getApiErrorMessage(loadError, "This book could not be loaded."));
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [bookId, getUserBookData, selectedBook?.id]);

	if (loading) return <Loading label="Loading your book..." />;
	if (!selectedBook || selectedBook.id !== bookId) {
		return <PageMessage title="Book unavailable" message={error || "This book could not be found in your library."} />;
	}
	return (
		<div className="read-shell">
			<nav className="breadcrumbs" aria-label="Breadcrumb">
				<Link to="/">Library</Link><span>/</span>
				<span>{selectedBook.prettyName || selectedBook.title}</span>
			</nav>
			<Outlet />
		</div>
	);
}

function ReadBookPage() {
	const { selectedBook: book } = useBooksCtx();
	if (!book) return <Loading />;
	return (
		<section className="read-book-page">
			<div className="read-book-header">
				<BookCover book={book} className="read-cover" />
				<div className="read-book-intro">
					<span className="eyebrow">Your book</span>
					<h1>{book.prettyName || book.title}</h1>
					<p className="book-author">by {book.author}</p>
					<p className="book-description">{book.description}</p>
				</div>
			</div>
			<div className="section-heading chapter-heading">
				<div><span className="eyebrow">Keep building your understanding</span><h2>Chapters</h2></div>
			</div>
			<div className="chapter-grid">
				{(book.chapters || []).map((chapter) => (
					<ChapterLink key={chapter.id} chapter={chapter} to={`/read/${book.id}/chapters/${chapter.id}`} />
				))}
				{!book.chapters?.length && <p className="muted">No chapters are available for this book yet.</p>}
			</div>
		</section>
	);
}

function StatusMark({ status }: { status?: number | null }) {
	if (status === 2) return <span className="status-mark status-complete" aria-label="Complete">✓</span>;
	if (status === 1) return <span className="status-mark status-partial" aria-label="In progress">✓</span>;
	if (status === 0) return <span className="status-mark status-failed" aria-label="Needs more work">×</span>;
	return <span className="status-mark status-empty" aria-label="Not started">○</span>;
}

function ChapterLink({
	chapter,
	to,
}: {
	chapter: BookChapterType;
	to: string;
}) {
	return (
		<Link className="chapter-link" to={to}>
			<span>{chapter.title}</span><StatusMark status={chapter.status} />
		</Link>
	);
}

function ChapterPage() {
	const { bookId = "", chapterId = "" } = useParams();
	const {
		selectedBook: book,
		selectedChapter,
		setSelectedChapter,
		getOrGenerateChapterQuestions,
	} = useBooksCtx();
	const chapter = useMemo(
		() => book?.chapters?.find((item) => String(item.id) === chapterId),
		[book, chapterId],
	);
	const [loadingQuestions, setLoadingQuestions] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!chapter) return;
		setSelectedChapter(chapter);
		if (chapter.questions?.length) return;
		let active = true;
		setLoadingQuestions(true);
		setError("");
		void getOrGenerateChapterQuestions(chapterId)
			.catch((requestError: unknown) => {
				if (active) setError(getApiErrorMessage(requestError, "Questions could not be loaded."));
			})
			.finally(() => { if (active) setLoadingQuestions(false); });
		return () => { active = false; };
	}, [chapter, chapterId, getOrGenerateChapterQuestions, setSelectedChapter]);

	if (!chapter) return <PageMessage title="Chapter unavailable" message="This chapter could not be found." />;
	const currentChapter = selectedChapter?.id === chapter.id ? selectedChapter : chapter;
	return (
		<section className="content-page chapter-page">
			<Link className="back-link" to={`/read/${bookId}`}>← Back to book</Link>
			<span className="eyebrow">Chapter questions</span>
			<h1>{chapter.title}</h1>
			<p className="muted">Answer a few questions to reflect on what you have read.</p>
			{loadingQuestions ? <Loading label="Preparing chapter questions..." /> :
				error ? <PageMessage title="Questions unavailable" message={error} /> :
					<div className="question-list">
						{(currentChapter.questions || []).map((question, index) => (
							<Link
								className="chapter-link question-link"
								key={question.id}
								to={`/read/${bookId}/chapters/${chapterId}/question/${question.id}`}
							>
								<span><small>Question {index + 1}</small>{question.question_text}</span>
								<StatusMark status={question.status} />
							</Link>
						))}
					</div>
			}
		</section>
	);
}

function QuestionPage() {
	const { bookId = "", chapterId = "", questionId = "" } = useParams();
	const {
		selectedBook,
		selectedChapter,
		setSelectedChapter,
		selectedQuestion,
		setSelectedQuestion,
		getOrGenerateChapterQuestions,
		userResponse,
		setUserResponse,
		feedback,
		getUserResponse,
		submitUserResponse,
	} = useBooksCtx();
	const bookChapter = selectedBook?.chapters?.find((item) => String(item.id) === chapterId);
	const chapter = bookChapter || (
		selectedChapter?.id.toString() === chapterId ? selectedChapter : undefined
	);
	const question = chapter?.questions?.find((item) => String(item.id) === questionId);
	const [loading, setLoading] = useState(true);
	const [loadingResponse, setLoadingResponse] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!bookChapter) return;
		setSelectedChapter(bookChapter);
		if (bookChapter.questions?.length) {
			setLoading(false);
			return;
		}
		let active = true;
		setLoading(true);
		void getOrGenerateChapterQuestions(chapterId)
			.catch((loadError: unknown) => {
				if (active) setError(getApiErrorMessage(loadError, "Question could not be loaded."));
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [bookChapter, chapterId, getOrGenerateChapterQuestions, setSelectedChapter]);

	useEffect(() => {
		if (!question) return;
		setSelectedQuestion(question);
		setLoadingResponse(true);
		void getUserResponse(questionId)
			.catch((responseError: unknown) => {
				setError(getApiErrorMessage(responseError, "Your saved response could not be loaded."));
			})
			.finally(() => setLoadingResponse(false));
	}, [question, questionId, getUserResponse, setSelectedQuestion]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!userResponse.trim()) {
			setError("Please enter a response before submitting.");
			return;
		}
		setError("");
		setIsSubmitting(true);
		try {
			await submitUserResponse(userResponse.trim());
			setShowFeedback(true);
		} catch (submitError) {
			setError(getApiErrorMessage(submitError, "Your response could not be submitted."));
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!bookChapter) {
		return <PageMessage title="Chapter unavailable" message="This chapter could not be found." />;
	}
	if (!loading && !question) {
		return <PageMessage title="Question unavailable" message={error || "This question could not be found."} />;
	}
	if (loading || !question) {
		return error ? <PageMessage title="Question unavailable" message={error} /> : <Loading label="Loading question..." />;
	}
	const activeQuestion: BookQuestionType = selectedQuestion?.id === question.id ? selectedQuestion : question;
	return (
		<section className="question-page content-page">
			<Link className="back-link" to={`/read/${bookId}/chapters/${chapterId}`}>← Back to chapter</Link>
			<div className="question-panel">
				<span className="eyebrow">{chapter?.title || "Chapter question"}</span>
				<h1>{activeQuestion.question_text}</h1>
				{showFeedback && feedback ? (
					<div className="feedback-panel">
						<div className="feedback-heading">
							<div><span className="eyebrow">Your feedback</span><h2>Keep it up</h2></div>
							<StatusMark status={feedback.feedback_grade} />
						</div>
						<p>{feedback.feedback_text || "Your response has been saved."}</p>
						<button className="button secondary-button" onClick={() => setShowFeedback(false)} type="button">Back to response</button>
					</div>
				) : (
					<form className="response-form" onSubmit={handleSubmit}>
						<label htmlFor="response">Your response</label>
						<textarea
							id="response"
							maxLength={1000}
							placeholder="Write your response here..."
							value={userResponse}
							onChange={(event) => setUserResponse(event.target.value)}
							rows={8}
						/>
						<div className="response-meta"><span>{userResponse.length}/1000</span>
							{feedback && <button className="text-link" type="button" onClick={() => setShowFeedback(true)}>View previous feedback</button>}
						</div>
						{error && <p className="form-error" role="alert">{error}</p>}
						<button className="button primary-button" disabled={isSubmitting || loadingResponse || !userResponse.trim()}>
							{isSubmitting ? "Submitting..." : "Submit response"}
						</button>
					</form>
				)}
			</div>
		</section>
	);
}

function PageMessage({ title, message }: { title: string; message: string }) {
	return (
		<section className="empty-state" role="status">
			<h1>{title}</h1>
			<p>{message}</p>
			<Link className="text-link" to="/">Return to your library</Link>
		</section>
	);
}

function NotFoundPage() {
	return <PageMessage title="Page not found" message="The page you are looking for does not exist." />;
}

export default function App() {
	return (
		<div className="app-shell">
			<AppHeader />
			<main className="main-content">
				<Routes>
					<Route path="/login" element={<AuthRoute><AuthPage /></AuthRoute>} />
					<Route path="/register" element={<AuthRoute><AuthPage isRegister /></AuthRoute>} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/search/:bookId" element={<SearchBookDetailsPage />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/read/:bookId" element={<ReadBookLayout />}>
							<Route index element={<ReadBookPage />} />
							<Route path="chapters/:chapterId" element={<ChapterPage />} />
							<Route path="chapters/:chapterId/question/:questionId" element={<QuestionPage />} />
						</Route>
					</Route>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</main>
			<footer className="site-footer">
				<span>BookSmart</span><span>Read thoughtfully. Remember more.</span>
			</footer>
		</div>
	);
}
