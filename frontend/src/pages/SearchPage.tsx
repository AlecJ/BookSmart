import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookCover, bookTitle } from "../components/BookCover";
import { Loading } from "../components/Loading";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function SearchPage() {
	const { searchBookResults, isSearching, searchError, searchBooks } = useBooksCtx();
	const [searchParams] = useSearchParams();
	const query = (searchParams.get("q") || "").trim();
	useDocumentTitle(query ? `Search: ${query}` : "Discover books");

	useEffect(() => {
		if (query) void searchBooks(query);
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

	let results;
	if (isSearching) {
		results = <Loading label="Searching books..." />;
	} else if (searchError) {
		results = (
			<div className="empty-state" role="alert">
				<p>{searchError}</p>
			</div>
		);
	} else if (searchBookResults.length === 0) {
		results = (
			<div className="empty-state">
				<h2>No books found</h2>
				<p>Try a different title or author.</p>
			</div>
		);
	} else {
		results = (
			<div className="book-list">
				{searchBookResults.map((book) => (
					<Link
						className="book-row search-result"
						key={book.google_book_id}
						to={`/search/${encodeURIComponent(book.google_book_id)}`}
					>
						<BookCover book={book} />
						<span className="book-row-details">
							<strong>{bookTitle(book)}</strong>
							<span>by {book.author || "Unknown author"}</span>
							{book.description && <span className="search-description">{book.description}</span>}
						</span>
						<span className="row-arrow" aria-hidden="true">→</span>
					</Link>
				))}
			</div>
		);
	}

	return (
		<section className="content-page">
			<div className="page-heading">
				<span className="eyebrow">Search results</span>
				<h1>Books matching “{query}”</h1>
			</div>
			{results}
		</section>
	);
}
