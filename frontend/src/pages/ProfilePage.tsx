import { useState } from "react";
import { Link } from "react-router-dom";
import { BookCover, bookTitle } from "../components/BookCover";
import { Spinner } from "../components/Loading";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";
import type { BookType } from "../types";

export function ProfilePage() {
	const {
		books,
		booksError,
		hasMoreBooks,
		isLoadingMoreBooks,
		loadMoreBooks,
		removeBookFromLibrary,
	} = useBooksCtx();
	const [loadError, setLoadError] = useState("");
	const [removingId, setRemovingId] = useState<string>();
	useDocumentTitle("Reading history");

	const handleLoadMore = async () => {
		setLoadError("");
		try {
			await loadMoreBooks();
		} catch (error) {
			setLoadError(getApiErrorMessage(error, "More books could not be loaded."));
		}
	};

	const handleRemove = async (book: BookType) => {
		if (!window.confirm(`Remove “${bookTitle(book)}” from your library?`)) return;
		setLoadError("");
		setRemovingId(book.id);
		try {
			await removeBookFromLibrary(book.id);
		} catch (error) {
			setLoadError(getApiErrorMessage(error, "The book could not be removed."));
		} finally {
			setRemovingId(undefined);
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
				<div className="book-list">
					{books.map((book) => (
						// The remove button sits beside the link, not inside it:
						// interactive elements can't be nested.
						<div className="book-row-item" key={book.id}>
							<Link className="book-row" to={`/read/${book.id}`}>
								<BookCover book={book} />
								<span className="book-row-details">
									<strong>{bookTitle(book)}</strong>
									<span>by {book.author}</span>
								</span>
							</Link>
							<button
								className="remove-book-button"
								type="button"
								aria-label={`Remove ${bookTitle(book)} from your library`}
								title="Remove from library"
								disabled={removingId === book.id}
								aria-busy={removingId === book.id}
								onClick={() => void handleRemove(book)}
							>
								{removingId === book.id ? <Spinner small /> : <span aria-hidden="true">×</span>}
							</button>
						</div>
					))}
				</div>
			)}
			{hasMoreBooks && books.length > 0 && (
				<button className="button secondary-button load-more" onClick={() => void handleLoadMore()} disabled={isLoadingMoreBooks} aria-busy={isLoadingMoreBooks}>
					{isLoadingMoreBooks && <Spinner small />}
					{isLoadingMoreBooks ? "Loading..." : "Load more"}
				</button>
			)}
		</section>
	);
}
