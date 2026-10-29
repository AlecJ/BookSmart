import { describe, expect, it, vi } from "vitest";
import { findChapterList } from "../src/services/chapters.js";
import { agreedChapterTitles } from "../src/services/open-library.js";

const fails = async (): Promise<string[]> => {
	throw new Error("source unavailable");
};
const none = async (): Promise<string[]> => [];

describe("chapter list fallback chain", () => {
	it("uses the first source that has a list", async () => {
		const openAi = vi.fn(async () => ["Chapter 1", "Chapter 2"]);
		const list = await findChapterList("The Hobbit", "J.R.R. Tolkien", [
			["audible", none],
			["openlibrary", async () => ["An Unexpected Party", "Roast Mutton", "A Short Rest"]],
			["openai", openAi],
		]);
		expect(list).toEqual({
			source: "openlibrary",
			titles: ["An Unexpected Party", "Roast Mutton", "A Short Rest"],
		});
		expect(openAi).not.toHaveBeenCalled();
	});

	it("skips a failing source when a later one has a list", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		await expect(
			findChapterList("Book", "Author", [
				["audible", fails],
				["openai", async () => ["Chapter 1", "Chapter 2"]],
			]),
		).resolves.toEqual({ source: "openai", titles: ["Chapter 1", "Chapter 2"] });
	});

	it("reports no list when every source answers that it has none", async () => {
		await expect(
			findChapterList("Book", "Author", [["audible", none], ["openai", none]]),
		).resolves.toEqual({ source: null, titles: [] });
	});

	it("throws instead of reporting no list when a source failed", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		await expect(
			findChapterList("Book", "Author", [["audible", fails], ["openai", none]]),
		).rejects.toThrow("source unavailable");
	});
});

describe("Open Library contents", () => {
	const toc = (...titles: string[]) => titles.map((title) => ({ title }));
	const english = [{ key: "/languages/eng" }];

	it("accepts titles that editions agree on, without front matter", () => {
		const titles = agreedChapterTitles([
			{ languages: english, table_of_contents: toc("List of Illustrations", "An Unexpected Party", "Roast Mutton", "A Short Rest") },
			{ languages: english, table_of_contents: toc("An unexpected party", "Roast mutton", "A short rest") },
			{ languages: [{ key: "/languages/ger" }], table_of_contents: toc("Ein unerwartetes Fest", "Hammelbraten", "Eine kurze Rast") },
		]);
		expect(titles).toEqual(["An Unexpected Party", "Roast Mutton", "A Short Rest"]);
	});

	it("rejects a list that only one edition has", () => {
		expect(
			agreedChapterTitles([
				{ languages: english, table_of_contents: toc("pt. 1.", "The novel --", "Intention and genesis") },
			]),
		).toEqual([]);
	});
});
