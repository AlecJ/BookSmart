import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { bookTitle } from "../components/BookCover";
import { Loading } from "../components/Loading";
import { PageMessage } from "../components/PageMessage";
import { useBooksCtx } from "../contexts/BookContext";
import { getApiErrorMessage } from "../services/api";

export function ReadBookLayout() {
	// Includes the nested routes' params, so the trail can show the chapter.
	const { bookId = "", chapterId, questionId } = useParams();
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
	// On failure, don't fall back to a copy of the book cached from search: it
	// isn't the user's library entry and has no chapters.
	if (error || !selectedBook || selectedBook.id !== bookId) {
		return <PageMessage title="Book unavailable" message={error || "This book could not be found in your library."} />;
	}

	const chapter = chapterId
		? selectedBook.chapters?.find((item) => item.id === chapterId)
		: undefined;
	const bookPath = `/read/${bookId}`;
	return (
		<div className="read-shell">
			<nav className="breadcrumbs" aria-label="Breadcrumb">
				<ol>
					<li><Link to="/">Library</Link></li>
					<li>
						{chapter ? (
							<Link to={bookPath}>{bookTitle(selectedBook)}</Link>
						) : (
							<span aria-current="page">{bookTitle(selectedBook)}</span>
						)}
					</li>
					{chapter && (
						<li>
							{questionId ? (
								<Link to={`${bookPath}/chapters/${chapter.id}`}>{chapter.title}</Link>
							) : (
								<span aria-current="page">{chapter.title}</span>
							)}
						</li>
					)}
				</ol>
			</nav>
			<Outlet />
		</div>
	);
}
