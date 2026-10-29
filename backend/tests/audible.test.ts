import { afterEach, describe, expect, it, vi } from "vitest";
import { getAudibleChapterTitles } from "../src/services/audible.js";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status });

function stubFetch(routes: Record<string, () => Response>) {
	const fetchMock = vi.fn(async (input: string | URL) => {
		const url = String(input);
		const key = Object.keys(routes).find((prefix) => url.includes(prefix));
		if (!key) throw new Error(`Unexpected request: ${url}`);
		return routes[key]!();
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("Audible chapter titles", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("ignores podcasts and returns no chapters when there is no audiobook", async () => {
		// The Catcher in the Rye: the only catalog match is a podcast.
		const fetchMock = stubFetch({
			"catalog/products": () =>
				json({ products: [{ asin: "PODCAST", content_delivery_type: "PodcastParent" }] }),
		});

		await expect(getAudibleChapterTitles("The Catcher in the Rye", "J. D. Salinger"))
			.resolves.toEqual([]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("tries the next audiobook when one has no chapter data", async () => {
		stubFetch({
			"catalog/products": () =>
				json({
					products: [
						{ asin: "PODCAST", content_delivery_type: "PodcastParent" },
						{ asin: "UNAVAILABLE", content_delivery_type: "SinglePartBook" },
						{ asin: "BOOK", content_delivery_type: "MultiPartBook" },
					],
				}),
			"books/UNAVAILABLE/chapters": () => json({ error: { code: "REGION_UNAVAILABLE" } }, 404),
			"books/BOOK/chapters": () =>
				json({ chapters: [{ title: "An Unexpected Party" }, { title: "Roast Mutton" }] }),
		});

		await expect(getAudibleChapterTitles("The Hobbit", "J.R.R. Tolkien"))
			.resolves.toEqual(["An Unexpected Party", "Roast Mutton"]);
	});

	it("still fails when Audible itself is unavailable", async () => {
		stubFetch({ "catalog/products": () => json({}, 503) });

		await expect(getAudibleChapterTitles("The Hobbit", "J.R.R. Tolkien"))
			.rejects.toMatchObject({ status: 502 });
	});
});
