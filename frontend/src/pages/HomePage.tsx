import { Link } from "react-router-dom";
import { BookCover, bookTitle } from "../components/BookCover";
import { Loading } from "../components/Loading";
import { PageMessage } from "../components/PageMessage";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { BookType } from "../types";

const LIBRARY_PREVIEW_SIZE = 10;

function BookCard({ book }: { book: BookType }) {
	return (
		<Link className="book-card" to={`/read/${book.id}`}>
			<BookCover book={book} />
			<span className="book-card-title">{bookTitle(book)}</span>
			<span className="book-card-author">{book.author}</span>
		</Link>
	);
}

export function HomePage() {
	const { books, booksLoading, booksError, hasMoreBooks } = useBooksCtx();
	useDocumentTitle("My library");

	if (booksLoading && books.length === 0) return <Loading label="Loading your library..." />;
	if (booksError && books.length === 0) {
		return <PageMessage title="Your library couldn't load" message={booksError} />;
	}
	const [current] = books;
	if (!current) {
		return (
			<section className="empty-library">
				<span className="eyebrow">A smarter way to read</span>
				<h1>Make every chapter count.</h1>
				<p>Find a book to add to your library and build your understanding as you read.</p>
				<Link className="button primary-button" to="/search">Discover books</Link>
			</section>
		);
	}

	const showViewAll = books.length > LIBRARY_PREVIEW_SIZE || hasMoreBooks;
	return (
		<div className="home-layout">
			<section className="continue-panel" aria-labelledby="continue-heading">
				<Link className="continue-cover" to={`/read/${current.id}`} tabIndex={-1} aria-hidden="true">
					<BookCover book={current} />
				</Link>
				<div className="continue-copy">
					<span className="eyebrow" id="continue-heading">Pick up where you left off</span>
					<h1>{bookTitle(current)}</h1>
					<p className="book-author">by {current.author}</p>
					{current.description && <p className="continue-description">{current.description}</p>}
					<Link className="button primary-button" to={`/read/${current.id}`}>
						Continue reading
					</Link>
				</div>
			</section>
			<section className="library-section" aria-labelledby="library-heading">
				<div className="section-heading">
					<div>
						<span className="eyebrow">Your collection</span>
						<h2 id="library-heading">Your library</h2>
					</div>
					{showViewAll && (
						<Link className="text-link" to="/profile">View all <span aria-hidden="true">→</span></Link>
					)}
				</div>
				<div className="book-grid">
					{books.slice(0, LIBRARY_PREVIEW_SIZE).map((book) => <BookCard key={book.id} book={book} />)}
					<Link className="book-card add-book-card" to="/search">
						<span className="add-book-icon" aria-hidden="true">+</span>
						<span>Find another book</span>
					</Link>
				</div>
			</section>
		</div>
	);
}
