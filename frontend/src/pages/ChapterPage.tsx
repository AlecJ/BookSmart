import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/Loading";
import { PageMessage } from "../components/PageMessage";
import { RichText } from "../components/RichText";
import { StatusMark } from "../components/StatusMark";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";

export function ChapterPage() {
	const { bookId = "", chapterId = "" } = useParams();
	const {
		selectedBook: book,
		selectedChapter,
		setSelectedChapter,
		getOrGenerateChapterQuestions,
	} = useBooksCtx();
	const chapter = useMemo(
		() => book?.chapters?.find((item) => item.id === chapterId),
		[book, chapterId],
	);
	const [loadingQuestions, setLoadingQuestions] = useState(false);
	const [error, setError] = useState("");
	useDocumentTitle(chapter?.title);

	useEffect(() => {
		if (!chapter) return;
		setSelectedChapter(chapter);
		if (chapter.questions?.length) {
			// A previous run's request may have been cancelled by this re-run
			// (its result changed `chapter`), so clear its loading state here.
			setLoadingQuestions(false);
			return;
		}
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

	let content;
	if (loadingQuestions) {
		content = <Loading label="Preparing chapter questions..." />;
	} else if (error) {
		content = <PageMessage title="Questions unavailable" message={error} />;
	} else {
		content = (
			<ol className="question-list">
				{(currentChapter.questions || []).map((question, index) => (
					<li key={question.id}>
						<Link
							className="chapter-link question-link"
							to={`/read/${bookId}/chapters/${chapterId}/question/${question.id}`}
						>
							<span>
								<small>Question {index + 1}</small>
								<span><RichText text={question.question_text} /></span>
							</span>
							<StatusMark status={question.status} kind="question" />
						</Link>
					</li>
				))}
			</ol>
		);
	}

	return (
		<section className="chapter-page">
			<span className="eyebrow">Chapter questions</span>
			<h1>{chapter.title}</h1>
			<p className="muted">Answer a few questions to reflect on what you have read.</p>
			{content}
		</section>
	);
}
