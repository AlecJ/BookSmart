import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Loading, Spinner } from "../components/Loading";
import { PageMessage } from "../components/PageMessage";
import { RichText } from "../components/RichText";
import { StatusMark } from "../components/StatusMark";
import { useBooksCtx } from "../contexts/BookContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";
import type { BookQuestionType } from "../types";

const MAX_RESPONSE_LENGTH = 1000;
// Grades are 2 = pass, 1 = partial pass, 0 = fail; the heading states the verdict.
const FEEDBACK_HEADINGS: Record<0 | 1 | 2, string> = {
	2: "Great answer",
	1: "Partly there",
	0: "Not quite",
};

export function QuestionPage() {
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
	const bookChapter = selectedBook?.chapters?.find((item) => item.id === chapterId);
	const chapter = bookChapter || (
		selectedChapter?.id === chapterId ? selectedChapter : undefined
	);
	const questions = chapter?.questions || [];
	const questionIndex = questions.findIndex((item) => item.id === questionId);
	const question = questions[questionIndex];
	const nextQuestion = questions[questionIndex + 1];
	const [loading, setLoading] = useState(true);
	const [loadingResponse, setLoadingResponse] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);
	const [error, setError] = useState("");
	useDocumentTitle(chapter ? `${chapter.title}, question ${questionIndex + 1}` : undefined);

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
		if (question) setSelectedQuestion(question);
	}, [question, setSelectedQuestion]);

	// Keyed on the ID rather than the question object: the object is replaced
	// when its status updates after an answer, which must not reload (and
	// briefly clear) the response and feedback being shown.
	const hasQuestion = !!question;
	useEffect(() => {
		if (!hasQuestion) return;
		setShowFeedback(false);
		setError("");
		setLoadingResponse(true);
		void getUserResponse(questionId)
			// A graded answer opens straight to its feedback.
			.then((response) => {
				if (response && response.feedback_grade !== null) setShowFeedback(true);
			})
			.catch((responseError: unknown) => {
				setError(getApiErrorMessage(responseError, "Your saved response could not be loaded."));
			})
			.finally(() => setLoadingResponse(false));
	}, [hasQuestion, questionId, getUserResponse]);

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
	const chapterPath = `/read/${bookId}/chapters/${chapterId}`;
	return (
		<section className="question-page">
			<div className="question-panel">
				<span className="eyebrow">
					Question {questionIndex + 1} of {questions.length}
				</span>
				<h1><RichText text={activeQuestion.question_text} /></h1>
				{loadingResponse ? (
					// Shown instead of the form so a graded answer doesn't flash the
					// form before switching to its feedback.
					<Loading label="Loading your answer..." />
				) : showFeedback && feedback ? (
					<div className="feedback-panel">
						<div className="feedback-heading">
							<div>
								<span className="eyebrow">Your feedback</span>
								<h2>{FEEDBACK_HEADINGS[feedback.feedback_grade]}</h2>
							</div>
							<StatusMark status={feedback.feedback_grade} kind="question" />
						</div>
						<blockquote className="submitted-answer">
							<span className="eyebrow">Your answer</span>
							<p>{feedback.response_text}</p>
						</blockquote>
						<p className="feedback-text">
							<RichText text={feedback.feedback_text || "Your response has been saved."} />
						</p>
						<div className="feedback-actions">
							<button className="button secondary-button" onClick={() => setShowFeedback(false)} type="button">
								Revise answer
							</button>
							{nextQuestion ? (
								<Link className="button primary-button" to={`${chapterPath}/question/${nextQuestion.id}`}>
									Next question <span aria-hidden="true">→</span>
								</Link>
							) : (
								<Link className="button primary-button" to={chapterPath}>
									Back to chapter
								</Link>
							)}
						</div>
					</div>
				) : (
					<form className="response-form" onSubmit={handleSubmit}>
						<label htmlFor="response">Your response</label>
						<textarea
							id="response"
							maxLength={MAX_RESPONSE_LENGTH}
							placeholder="Write your response here..."
							// Read-only while grading: edits then would be silently ignored.
							readOnly={isSubmitting}
							value={userResponse}
							onChange={(event) => setUserResponse(event.target.value)}
							rows={8}
						/>
						<div className="response-meta">
							<span>{userResponse.length}/{MAX_RESPONSE_LENGTH}</span>
							{feedback && (
								<button className="text-link" type="button" onClick={() => setShowFeedback(true)}>
									View previous feedback
								</button>
							)}
						</div>
						{error && <p className="form-error" role="alert">{error}</p>}
						<button className="button primary-button" disabled={isSubmitting || !userResponse.trim()} aria-busy={isSubmitting}>
							{isSubmitting && <Spinner small />}
							{isSubmitting ? "Checking your answer..." : "Submit response"}
						</button>
					</form>
				)}
			</div>
		</section>
	);
}
