import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookCover, bookTitle } from "../components/BookCover";
import { ExpandableText } from "../components/ExpandableText";
import { Loading, Spinner } from "../components/Loading";
import { PageMessage } from "../components/PageMessage";
import { useAuth } from "../contexts/AuthContext";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";
import type { BookType } from "../types";

export function SearchBookDetailsPage() {
	const { bookId = "" } = useParams();
	const { books, viewSearchResultBook, addBookToLibrary } = useBooksCtx();
	const { isAuthenticated } = useAuth();
	const [book, setBook] = useState<BookType>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [adding, setAdding] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const isInLibrary = !!book && books.some((item) => item.id === book.id);
	useDocumentTitle(book ? bookTitle(book) : undefined);

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError("");
		void viewSearchResultBook(bookId)
			.then((result) => { if (active) setBook(result); })
			.catch((loadError: unknown) => {
				if (active) setError(getApiErrorMessage(loadError, "Book details could not be loaded."));
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [bookId, viewSearchResultBook]);

	const handleAdd = async () => {
		if (!book) return;
		if (isInLibrary) {
			navigate(`/read/${book.id}`);
			return;
		}
		setAdding(true);
		setError("");
		try {
			const savedBook = await addBookToLibrary(book);
			navigate(`/read/${savedBook.id}`);
		} catch (addError) {
			// Only the first page of the library is loaded, so the book may already
			// be there without appearing in `books`.
			if (
				axios.isAxiosError<{ detail?: string }>(addError) &&
				addError.response?.data?.detail === "Book already in user's library"
			) {
				navigate(`/read/${book.id}`);
				return;
			}
			setError(getApiErrorMessage(addError, "Failed to add this book to your library."));
		} finally {
			setAdding(false);
		}
	};

	if (loading) return <Loading label="Loading book details..." />;
	if (!book) return <PageMessage title="Book unavailable" message={error || "Book details could not be loaded."} />;
	return (
		<section className="book-detail">
			<BookCover book={book} className="detail-cover" />
			<div className="book-detail-copy">
				<span className="eyebrow">Book details</span>
				<h1>{bookTitle(book)}</h1>
				<p className="book-author">by {book.author || "Unknown author"}</p>
				<div className="book-actions">
					{isAuthenticated ? (
						<button className="button primary-button" onClick={() => void handleAdd()} disabled={adding} aria-busy={adding}>
							{adding && <Spinner small />}
							{adding ? "Adding..." : isInLibrary ? "Open book" : "Add to library"}
						</button>
					) : (
						<Link className="button primary-button" to="/login" state={{ from: location }}>Sign in to add to library</Link>
					)}
				</div>
				{error && <p className="form-error" role="alert">{error}</p>}
				<ExpandableText
					className="book-description"
					text={book.description || "No description is available for this book."}
				/>
			</div>
		</section>
	);
}
