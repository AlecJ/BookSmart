import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
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
	id: 1,
	book_id: "book-1",
	title: "Chapter One",
};
const generatedChapter: BookChapterType = {
	...bookChapter,
	questions: [
		{
			id: 10,
			chapter_id: "1",
			question_text: "What idea stands out in this chapter?",
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

function renderApp() {
	return render(
		<MemoryRouter initialEntries={["/search"]}>
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
				return HttpResponse.json(generatedChapter);
			}),
			http.get(`${apiUrl}/read/question/:questionId`, () =>
				HttpResponse.json({ detail: "User response not found" }, { status: 404 }),
			),
			http.post(`${apiUrl}/read/question/:questionId`, () => {
				requestedSteps.push("submit-answer");
				return HttpResponse.json(submittedResponse);
			}),
		);
	});

	it("searches for a book, adds it to the library, and submits an answer", async () => {
		const user = userEvent.setup();
		renderApp();

		const searchInput = await screen.findByRole("textbox", {
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
			screen.getByRole("heading", { name: "Keep it up" }),
		).toBeInTheDocument();
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
});
