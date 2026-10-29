import { HttpError } from "../errors.js";

// Audible's catalog search also returns podcasts and other non-audiobook
// items; only these types have a chapter list for the book itself.
const AUDIOBOOK_TYPES = new Set(["SinglePartBook", "MultiPartBook"]);
// Matches to try when one has no chapter data (e.g. not available in the US).
const MAX_CANDIDATES = 3;

/**
 * Returns the book's chapter titles from its Audible audiobook, or an empty
 * list when no audiobook with chapter data exists (some books, such as
 * The Catcher in the Rye, have none). Network and service failures still
 * throw, so an outage isn't mistaken for a book without chapters.
 */
export async function getAudibleChapterTitles(
	title: string,
	author: string,
): Promise<string[]> {
	for (const asin of await findAudiobookAsins(title, author)) {
		const chapters = await fetchChapterTitles(asin);
		if (chapters.length) return chapters;
	}
	return [];
}

async function findAudiobookAsins(title: string, author: string): Promise<string[]> {
	const searchUrl = new URL("https://api.audible.com/1.0/catalog/products");
	searchUrl.searchParams.set("title", title);
	searchUrl.searchParams.set("author", author);
	searchUrl.searchParams.set("products_sort_by", "AvgRating");
	searchUrl.searchParams.set("num_results", "10");
	searchUrl.searchParams.set("response_groups", "product_attrs");

	let result: { products?: Array<{ asin?: string; content_delivery_type?: string }> };
	try {
		const response = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
		if (!response.ok) {
			throw new HttpError(502, "Error fetching Audible book data.");
		}
		result = await response.json();
	} catch (error) {
		if (error instanceof HttpError) throw error;
		throw new HttpError(503, "Unable to reach Audible API.");
	}
	return (result.products || [])
		.filter((product) => AUDIOBOOK_TYPES.has(product.content_delivery_type || ""))
		.map((product) => product.asin)
		.filter((asin): asin is string => !!asin)
		.slice(0, MAX_CANDIDATES);
}

async function fetchChapterTitles(asin: string): Promise<string[]> {
	try {
		const response = await fetch(
			`https://api.audnex.us/books/${encodeURIComponent(asin)}/chapters`,
			{ signal: AbortSignal.timeout(10000) },
		);
		// Audnex answers 404 when it has no chapter data for the item, including
		// items not sold in its region; try the next match instead of failing.
		if (response.status === 404) return [];
		if (!response.ok) throw new HttpError(502, "Error fetching Audible chapters.");
		const result = (await response.json()) as {
			chapters?: Array<{ title?: string }>;
		};
		return (result.chapters || [])
			.map((chapter) => chapter.title || "")
			.filter(Boolean);
	} catch (error) {
		if (error instanceof HttpError) throw error;
		throw new HttpError(503, "Unable to reach Audible API.");
	}
}
