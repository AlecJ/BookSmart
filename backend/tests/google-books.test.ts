import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { searchGoogleBooks as SearchGoogleBooks } from "../src/services/google-books.js";

const volume = {
	id: "google-book-1",
	volumeInfo: { title: "The Castle", authors: ["Franz Kafka"] },
};
const ok = () => new Response(JSON.stringify({ items: [volume] }), { status: 200 });
const unavailable = () => new Response("{}", { status: 503 });

describe("Google Books retries", () => {
	let searchGoogleBooks: typeof SearchGoogleBooks;

	beforeAll(async () => {
		// config reads the key at import time.
		vi.stubEnv("GOOGLE_API_KEY", "test-key");
		({ searchGoogleBooks } = await import("../src/services/google-books.js"));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("retries once after a failed call", async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(unavailable()).mockResolvedValueOnce(ok());
		vi.stubGlobal("fetch", fetchMock);

		const results = await searchGoogleBooks("castle");
		expect(results.map((book) => book.title)).toEqual(["The Castle"]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("retries once after a network error", async () => {
		const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(ok());
		vi.stubGlobal("fetch", fetchMock);

		await expect(searchGoogleBooks("castle")).resolves.toHaveLength(1);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("gives up after the second failure", async () => {
		const fetchMock = vi.fn().mockImplementation(async () => unavailable());
		vi.stubGlobal("fetch", fetchMock);

		await expect(searchGoogleBooks("castle")).rejects.toMatchObject({
			status: 503,
			message: "Unable to retrieve your results. Please try again.",
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("keeps line breaks from description HTML", async () => {
		const html = "<b>CELEBRATING 75 YEARS, 1951 - 2026</b><br>The &quot;brilliant&quot; novel<p>Second paragraph.</p>";
		vi.stubGlobal("fetch", vi.fn(async () =>
			new Response(JSON.stringify({ items: [{ ...volume, volumeInfo: { ...volume.volumeInfo, description: html } }] })),
		));

		const [book] = await searchGoogleBooks("castle");
		expect(book?.description).toBe(
			'CELEBRATING 75 YEARS, 1951 - 2026\nThe "brilliant" novel\nSecond paragraph.',
		);
	});

	it("does not retry a successful call", async () => {
		const fetchMock = vi.fn().mockImplementation(async () => ok());
		vi.stubGlobal("fetch", fetchMock);

		await searchGoogleBooks("castle");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
