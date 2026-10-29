import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { generateChapterTitles as GenerateChapterTitles } from "../src/services/openai.js";

const create = vi.fn();
vi.mock("openai", () => ({
	default: class {
		responses = { create };
	},
}));

const answer = (confidence: string, count: number) => ({
	output_text: JSON.stringify({
		confidence,
		chapters: Array.from({ length: count }, (_, index) => `Chapter ${index + 1}`),
	}),
});

describe("OpenAI chapter lists", () => {
	let generateChapterTitles: typeof GenerateChapterTitles;

	beforeAll(async () => {
		// config reads the key at import time.
		vi.stubEnv("OPENAI_API_KEY", "test-key");
		({ generateChapterTitles } = await import("../src/services/openai.js"));
	});

	beforeEach(() => {
		create.mockReset();
		vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	it("accepts two high-confidence answers that agree", async () => {
		create.mockResolvedValue(answer("high", 26));
		const titles = await generateChapterTitles("The Catcher in the Rye", "J. D. Salinger");
		expect(titles).toHaveLength(26);
		expect(create).toHaveBeenCalledTimes(2);
	});

	it("rejects answers that disagree on the chapter count", async () => {
		create.mockResolvedValueOnce(answer("high", 26)).mockResolvedValueOnce(answer("high", 24));
		await expect(generateChapterTitles("The Catcher in the Rye", "J. D. Salinger")).resolves.toEqual([]);
	});

	it("rejects answers below high confidence", async () => {
		create.mockResolvedValue(answer("medium", 42));
		await expect(generateChapterTitles("Pride and Prejudice", "Jane Austen")).resolves.toEqual([]);
	});
});
