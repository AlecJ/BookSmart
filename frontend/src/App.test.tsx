import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { AuthProvider } from "./contexts/AuthContext";
import { BookProvider } from "./contexts/BookContext";
import App from "./App";
import { server } from "./test/server";
import type { BookChapterType, BookType, UserResponseType } from "./types";

const apiUrl = "http://localhost:8000/api/v1";
const searchedBook: BookType = {
	id: "book-1",
	google_book_id: "google-book-1",
	title: "The Practical Reader",
	prettyName: "The Practical Reader",
	author: "A. Writer",
	description: "A book about thoughtful reading.",
	image_url: "",
};
const bookChapter: BookChapterType = {
	id: "1",
	book_id: "book-1",
	title: "Chapter One",
};
const generatedChapter: BookChapterType = {
	...bookChapter,
	questions: [
		{
			id: "10",
			chapter_id: "1",
			question_text: "What idea stands out in *this* chapter?",
		},
	],
};
const submittedResponse: UserResponseType = {
	id: "response-1",
	user_id: "user-1",
	question_id: "10",
	response_text: "The main idea is persistence.",
	feedback_text: "You identified the chapter's central idea.",
	feedback_grade: 2,
};
let requestedSteps: string[] = [];
let answered = false;

function renderApp(initialEntry = "/search") {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<AuthProvider>
				<BookProvider>
					<App />
				</BookProvider>
			</AuthProvider>
		</MemoryRouter>,
	);
}

describe("reader journey", () => {
	beforeEach(() => {
		window.localStorage.setItem("auth_token", "test-token");
		requestedSteps = [];
		answered = false;
		server.use(
			http.get(`${apiUrl}/read`, () => HttpResponse.json([])),
			http.get(`${apiUrl}/search`, ({ request }) => {
				requestedSteps.push("search");
				const query = new URL(request.url).searchParams.get("q");
				return query === "practical reader"
					? HttpResponse.json([searchedBook])
					: HttpResponse.json([]);
			}),
			http.get(`${apiUrl}/search/:googleBookId`, () => {
				requestedSteps.push("book-details");
				return HttpResponse.json(searchedBook);
			}),
			http.post(`${apiUrl}/read/addBook`, () => {
				requestedSteps.push("add-book");
				return HttpResponse.json(searchedBook);
			}),
			http.get(`${apiUrl}/read/book/:bookId`, () => {
				requestedSteps.push("library-book");
				return HttpResponse.json({ ...searchedBook, chapters: [bookChapter] });
			}),
			http.get(`${apiUrl}/read/chapter/:chapterId/questions`, () => {
				requestedSteps.push("chapter-questions");
				return HttpResponse.json(
					answered
						? {
								...generatedChapter,
								status: 2,
								questions: generatedChapter.questions?.map((question) => ({
									...question,
									status: 2,
								})),
							}
						: generatedChapter,
				);
			}),
			http.get(`${apiUrl}/read/question/:questionId`, () =>
				HttpResponse.json({ detail: "User response not found" }, { status: 404 }),
			),
			http.post(`${apiUrl}/read/question/:questionId`, () => {
				requestedSteps.push("submit-answer");
				answered = true;
				return HttpResponse.json(submittedResponse);
			}),
		);
	});

	it("searches for a book, adds it to the library, and submits an answer", async () => {
		const user = userEvent.setup();
		renderApp();

		const searchInput = await screen.findByRole("searchbox", {
			name: "Search books",
		});
		await user.type(searchInput, "practical reader");
		await user.click(screen.getByRole("button", { name: "Submit book search" }));

		const resultLink = await screen.findByRole("link", {
			name: /The Practical Reader/,
		});
		expect(resultLink).toBeInTheDocument();
		await user.click(resultLink);

		expect(
			await screen.findByRole("heading", { name: "The Practical Reader" }),
		).toBeInTheDocument();
		await user.click(
			screen.getByRole("button", { name: "Add to library" }),
		);

		await user.click(
			await screen.findByRole("link", { name: /Chapter One/ }),
		);
		await user.click(
			await screen.findByRole("link", {
				name: /What idea stands out in this chapter/,
			}),
		);

		const answer = await screen.findByRole("textbox", {
			name: "Your response",
		});
		await user.type(answer, "The main idea is persistence.");
		const submitAnswer = screen.getByRole("button", {
			name: "Submit response",
		});
		await waitFor(() => expect(submitAnswer).toBeEnabled());
		await user.click(submitAnswer);

		expect(
			await screen.findByText("You identified the chapter's central idea."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Great answer" }),
		).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Passed" })).toBeInTheDocument();
		// The submitted answer is shown alongside the feedback, and generated
		// Markdown emphasis renders as formatting rather than asterisks.
		expect(screen.getByText("The main idea is persistence.")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "What idea stands out in this chapter?" })
				.querySelector("em"),
		).toHaveTextContent("this");
		expect(requestedSteps).toEqual(
			expect.arrayContaining([
				"search",
				"book-details",
				"add-book",
				"library-book",
				"chapter-questions",
				"submit-answer",
			]),
		);
	});

	it("shows an answered question as complete after returning to the chapter", async () => {
		const user = userEvent.setup();
		renderApp("/read/book-1/chapters/1");

		await user.click(
			await screen.findByRole("link", {
				name: /What idea stands out in this chapter/,
			}),
		);
		await user.type(
			await screen.findByRole("textbox", { name: "Your response" }),
			"The main idea is persistence.",
		);
		const submitAnswer = screen.getByRole("button", { name: "Submit response" });
		await waitFor(() => expect(submitAnswer).toBeEnabled());
		await user.click(submitAnswer);
		await screen.findByText("You identified the chapter's central idea.");

		const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
		await user.click(within(breadcrumb).getByRole("link", { name: "Chapter One" }));
		const questionLink = await screen.findByRole("link", {
			name: /What idea stands out in this chapter/,
		});
		expect(within(questionLink).getByLabelText("Passed")).toBeInTheDocument();

		await user.click(
			within(screen.getByRole("navigation", { name: "Breadcrumb" }))
				.getByRole("link", { name: "The Practical Reader" }),
		);
		const chapterLink = await screen.findByRole("link", { name: /Chapter One/ });
		await waitFor(() =>
			expect(within(chapterLink).getByLabelText("Complete")).toBeInTheDocument(),
		);
	});

	it("returns to the book after signing in from its details page", async () => {
		window.localStorage.clear();
		server.use(
			http.post(`${apiUrl}/login/access-token`, () =>
				HttpResponse.json({ access_token: "new-token", token_type: "bearer" }),
			),
		);
		const user = userEvent.setup();
		renderApp("/search/google-book-1");

		await user.click(
			await screen.findByRole("link", { name: "Sign in to add to library" }),
		);
		await user.type(await screen.findByLabelText("Email"), "reader@example.test");
		await user.type(screen.getByLabelText("Password"), "long-enough-password");
		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(
			await screen.findByRole("button", { name: "Add to library" }),
		).toBeInTheDocument();
	});

	it("signs out when the session is rejected", async () => {
		server.use(
			http.get(`${apiUrl}/read/book/:bookId`, () =>
				HttpResponse.json({ detail: "Could not validate credentials" }, { status: 403 }),
			),
		);
		renderApp("/read/book-1");

		expect(
			await screen.findByRole("heading", { name: "Sign in to BookSmart" }),
		).toBeInTheDocument();
		expect(window.localStorage.getItem("auth_token")).toBeNull();
	});

	it("removes a book from the library on the profile page", async () => {
		let library = [searchedBook];
		const removed: string[] = [];
		server.use(
			http.get(`${apiUrl}/read`, () => HttpResponse.json(library)),
			http.delete(`${apiUrl}/read/book/:bookId`, ({ params }) => {
				removed.push(String(params.bookId));
				library = [];
				return new HttpResponse(null, { status: 204 });
			}),
		);
		const confirm = vi.spyOn(window, "confirm");
		const user = userEvent.setup();
		renderApp("/profile");

		const removeButton = await screen.findByRole("button", {
			name: "Remove The Practical Reader from your library",
		});

		// Cancelling the confirmation keeps the book.
		confirm.mockReturnValueOnce(false);
		await user.click(removeButton);
		expect(removed).toEqual([]);
		expect(screen.getByRole("link", { name: /The Practical Reader/ })).toBeInTheDocument();

		confirm.mockReturnValueOnce(true);
		await user.click(removeButton);
		expect(await screen.findByRole("heading", { name: "No books yet" })).toBeInTheDocument();
		expect(removed).toEqual(["book-1"]);
		confirm.mockRestore();
	});

	it("opens a graded question straight to its feedback", async () => {
		server.use(
			http.get(`${apiUrl}/read/question/:questionId`, () => HttpResponse.json(submittedResponse)),
		);
		renderApp("/read/book-1/chapters/1/question/10");

		expect(await screen.findByRole("heading", { name: "Great answer" })).toBeInTheDocument();
		expect(screen.getByText("You identified the chapter's central idea.")).toBeInTheDocument();
		expect(screen.queryByRole("textbox", { name: "Your response" })).not.toBeInTheDocument();

		// Revising shows the form with the saved answer filled in.
		await userEvent.setup().click(screen.getByRole("button", { name: "Revise answer" }));
		expect(screen.getByRole("textbox", { name: "Your response" })).toHaveValue(
			"The main idea is persistence.",
		);
	});

	it("states the verdict for a partial pass", async () => {
		server.use(
			http.post(`${apiUrl}/read/question/:questionId`, () =>
				HttpResponse.json({ ...submittedResponse, feedback_grade: 1 }),
			),
		);
		const user = userEvent.setup();
		renderApp("/read/book-1/chapters/1/question/10");

		await user.type(
			await screen.findByRole("textbox", { name: "Your response" }),
			"The main idea is persistence.",
		);
		const submitAnswer = screen.getByRole("button", { name: "Submit response" });
		await waitFor(() => expect(submitAnswer).toBeEnabled());
		await user.click(submitAnswer);

		expect(await screen.findByRole("heading", { name: "Partly there" })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Partially passed" })).toBeInTheDocument();
	});

	it("marks AI-generated chapter lists", async () => {
		server.use(
			http.get(`${apiUrl}/read/book/:bookId`, () =>
				HttpResponse.json({ ...searchedBook, chapter_source: "openai", chapters: [bookChapter] }),
			),
		);
		renderApp("/read/book-1");

		expect(await screen.findByText(/This chapter list was generated by AI/)).toBeInTheDocument();
	});

	it("shows a retry message when search fails", async () => {
		server.use(
			http.get(`${apiUrl}/search`, () =>
				HttpResponse.json({ detail: "Unable to retrieve your results. Please try again." }, { status: 503 }),
			),
		);
		renderApp("/search?q=practical%20reader");

		expect(
			await screen.findByText("Unable to retrieve your results. Please try again."),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
	});

	it("keeps the session when the API is unreachable at startup", async () => {
		server.use(http.get(`${apiUrl}/read`, () => HttpResponse.error()));
		renderApp("/");

		expect(await screen.findByText("Your library couldn't load")).toBeInTheDocument();
		expect(window.localStorage.getItem("auth_token")).toBe("test-token");
	});
});
