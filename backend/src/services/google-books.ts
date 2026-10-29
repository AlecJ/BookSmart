import { config } from "../config.js";
import { HttpError } from "../errors.js";
import type { BookMetadata } from "../types.js";

interface GoogleBook {
	id?: string;
	volumeInfo?: {
		title?: string;
		authors?: string[];
		description?: string;
		imageLinks?: Record<string, string>;
	};
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	ndash: "–",
	mdash: "—",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
	hellip: "…",
};

// Single pass so "&amp;lt;" decodes to "&lt;", not "<".
function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
		if (code[0] === "#") {
			const point =
				code[1] === "x" || code[1] === "X"
					? parseInt(code.slice(2), 16)
					: parseInt(code.slice(1), 10);
			return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
		}
		return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
	});
}

// Google's descriptions are HTML. Line breaks and block ends become newlines
// (the frontend preserves them); dropping them outright ran sentences together.
function htmlToText(html: string): string {
	return decodeEntities(
		html
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/?(p|div|li|h[1-6])\b[^>]*>/gi, "\n")
			.replace(/<[^>]*>/g, ""),
	)
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function toImageUrl(url: string): string {
	const httpsUrl = url.replace(/^http:/, "https:").replace(/&edge=curl/g, "");
	// Keep Google's zoom level when present; larger image links use higher zooms.
	if (httpsUrl.includes("zoom=")) return httpsUrl;
	return `${httpsUrl}${httpsUrl.includes("?") ? "&" : "?"}zoom=1`;
}

function toBookMetadata(googleBook: GoogleBook): BookMetadata {
	const volume = googleBook.volumeInfo || {};
	const imageUrl =
		volume.imageLinks?.large ||
		volume.imageLinks?.medium ||
		volume.imageLinks?.small ||
		volume.imageLinks?.thumbnail ||
		"";

	return {
		google_book_id: googleBook.id || "",
		title: volume.title || "Untitled",
		author: (volume.authors || []).join(", "),
		description: htmlToText(volume.description || ""),
		image_url: imageUrl ? toImageUrl(imageUrl) : "",
	};
}

// Google Books intermittently fails (5xx "Service temporarily unavailable",
// rate limits, dropped connections); a single quick retry usually succeeds.
const RETRY_DELAY_MS = 300;

async function googleRequest(url: URL): Promise<Response> {
	try {
		const response = await googleFetch(url);
		if (response.status !== 429 && response.status < 500) return response;
		console.warn(`Google Books request failed with ${response.status}; retrying once.`);
	} catch (error) {
		console.warn("Google Books request failed; retrying once:", error);
	}
	await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
	return googleFetch(url);
}

async function googleFetch(url: URL): Promise<Response> {
	try {
		return await fetch(url, { signal: AbortSignal.timeout(10000) });
	} catch (error) {
		if (error instanceof Error && error.name === "TimeoutError") {
			throw new HttpError(504, "Google Books API timed out. Please try again.");
		}
		throw new HttpError(
			503,
			"Unable to reach Google Books API. Please try again later.",
		);
	}
}

function requireGoogleKey(): string {
	if (!config.googleApiKey) {
		throw new HttpError(500, "Google Books API is not configured.");
	}
	return config.googleApiKey;
}

export async function searchGoogleBooks(query: string): Promise<BookMetadata[]> {
	const url = new URL("https://www.googleapis.com/books/v1/volumes");
	url.searchParams.set("q", query);
	url.searchParams.set("key", requireGoogleKey());
	url.searchParams.set("maxResults", "10");

	const response = await googleRequest(url);
	if (response.status === 403) throw new HttpError(502, "Invalid Google API key.");
	if (response.status === 429) {
		throw new HttpError(429, "Google Books API rate limit exceeded. Please try again shortly.");
	}
	if (!response.ok) {
		console.error(
			`Google Books search failed with ${response.status}:`,
			(await response.text()).slice(0, 500),
		);
		if (response.status >= 500) {
			throw new HttpError(503, "Unable to retrieve your results. Please try again.");
		}
		throw new HttpError(502, "Error fetching data from Google Books API.");
	}

	const body = (await response.json()) as { items?: GoogleBook[] };
	const deduplicated = new Map<string, BookMetadata>();
	for (const item of body.items || []) {
		const book = toBookMetadata(item);
		const key = `${book.title.trim().toLowerCase().replaceAll(" ", "")}${book.author
			.trim()
			.toLowerCase()
			.replaceAll(" ", "")
			.replaceAll(".", "")}`;
		if (!deduplicated.has(key)) deduplicated.set(key, book);
	}
	return [...deduplicated.values()];
}

export async function fetchGoogleBook(
	googleBookId: string,
): Promise<BookMetadata> {
	const url = new URL(
		`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBookId)}`,
	);
	url.searchParams.set("key", requireGoogleKey());
	const response = await googleRequest(url);
	if (response.status === 429) {
		throw new HttpError(429, "Google Books API rate limit exceeded. Please try again shortly.");
	}
	if (!response.ok) {
		throw new HttpError(404, "Book not found in Google Books API.");
	}
	return toBookMetadata((await response.json()) as GoogleBook);
}
