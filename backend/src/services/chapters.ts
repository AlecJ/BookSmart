import type { ChapterList, ChapterSource } from "../types.js";
import { getAudibleChapterTitles } from "./audible.js";
import { generateChapterTitles } from "./openai.js";
import { getOpenLibraryChapterTitles } from "./open-library.js";

type ChapterLookup = (title: string, author: string) => Promise<string[]>;

// Tried in order. Audible's audiobook chapters are the most complete, Open
// Library's contents (when editions agree) are reliable but sparse, and the
// model covers well-known books with neither; its lists are marked as AI
// generated in the UI.
const SOURCES: Array<[ChapterSource, ChapterLookup]> = [
	["audible", getAudibleChapterTitles],
	["openlibrary", getOpenLibraryChapterTitles],
	["openai", generateChapterTitles],
];

/**
 * Returns the first chapter list any source has. A failing source is skipped,
 * but if none has a list and one failed, its error is thrown: an outage
 * shouldn't be recorded as "this book has no chapters".
 */
export async function findChapterList(
	title: string,
	author: string,
	sources: Array<[ChapterSource, ChapterLookup]> = SOURCES,
): Promise<ChapterList> {
	let firstError: unknown;
	for (const [source, lookup] of sources) {
		try {
			const titles = await lookup(title, author);
			if (titles.length) return { source, titles };
		} catch (error) {
			console.warn(`Chapter lookup via ${source} failed:`, error);
			firstError ??= error;
		}
	}
	if (firstError) throw firstError;
	return { source: null, titles: [] };
}
