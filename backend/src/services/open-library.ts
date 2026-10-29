import { HttpError } from "../errors.js";

// Open Library's tables of contents are volunteer-entered per edition and
// noisy: other languages, front matter, publisher blurbs and catalog
// fragments. A list is only accepted when at least two editions agree on its
// titles, which keeps one bad entry from becoming the book's chapters.
const MIN_AGREEING_EDITIONS = 2;
const MIN_CHAPTERS = 3;
const MAX_TITLE_LENGTH = 120;
const EDITIONS_TO_SCAN = 500;
const FRONT_AND_BACK_MATTER = new Set([
	"about the author",
	"acknowledgements",
	"acknowledgments",
	"afterword",
	"appendix",
	"bibliography",
	"chronology",
	"contents",
	"copyright",
	"dedication",
	"epigraph",
	"explanatory notes",
	"foreword",
	"further reading",
	"glossary",
	"illustrations",
	"index",
	"introduction",
	"list of illustrations",
	"note on the text",
	"notes",
	"preface",
	"title page",
]);

interface TocEntry {
	title?: string;
	label?: string;
}

interface Edition {
	languages?: Array<{ key?: string }>;
	table_of_contents?: TocEntry[];
}

/** Returns agreed chapter titles from Open Library, or [] if there are none. */
export async function getOpenLibraryChapterTitles(
	title: string,
	author: string,
): Promise<string[]> {
	const workKey = await findWorkKey(title, author);
	if (!workKey) return [];
	const editions = await openLibraryJson<{ entries?: Edition[] }>(
		`https://openlibrary.org${workKey}/editions.json?limit=${EDITIONS_TO_SCAN}`,
	);
	return agreedChapterTitles(editions.entries || []);
}

async function findWorkKey(title: string, author: string): Promise<string | undefined> {
	const url = new URL("https://openlibrary.org/search.json");
	url.searchParams.set("title", title);
	if (author) url.searchParams.set("author", author);
	url.searchParams.set("fields", "key");
	url.searchParams.set("limit", "1");
	const result = await openLibraryJson<{ docs?: Array<{ key?: string }> }>(url);
	return result.docs?.[0]?.key;
}

async function openLibraryJson<T>(url: string | URL): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			// Open Library asks API clients to identify themselves.
			headers: { "User-Agent": "BookSmart/1.0" },
			signal: AbortSignal.timeout(10000),
		});
	} catch {
		throw new HttpError(503, "Unable to reach Open Library.");
	}
	if (!response.ok) throw new HttpError(502, "Error fetching Open Library data.");
	return (await response.json()) as T;
}

function normalize(text: string): string {
	return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Picks the English edition list whose titles the most other editions share. */
export function agreedChapterTitles(editions: Edition[]): string[] {
	const candidates = editions
		.filter((edition) => {
			const languages = (edition.languages || []).map((language) => language.key);
			return languages.length === 0 || languages.includes("/languages/eng");
		})
		.map((edition) =>
			(edition.table_of_contents || [])
				.map((entry) => (entry.title || entry.label || "").trim())
				.filter((text) =>
					text &&
					text.length <= MAX_TITLE_LENGTH &&
					!FRONT_AND_BACK_MATTER.has(normalize(text)),
				),
		)
		.filter((titles) => titles.length >= MIN_CHAPTERS);

	// How many editions list each (normalized) title.
	const support = new Map<string, number>();
	for (const titles of candidates) {
		for (const key of new Set(titles.map(normalize))) {
			support.set(key, (support.get(key) || 0) + 1);
		}
	}

	let best: string[] = [];
	for (const titles of candidates) {
		const agreed = titles.filter(
			(text) => (support.get(normalize(text)) || 0) >= MIN_AGREEING_EDITIONS,
		);
		if (agreed.length > best.length) best = agreed;
	}
	return best.length >= MIN_CHAPTERS ? best : [];
}
