import { Image } from "expo-image";

/**
 * Preload images into the cache
 * @param imageUrls Array of image URLs to preload
 */
export async function preloadImages(imageUrls: string[]): Promise<void> {
	try {
		const validUrls = imageUrls.filter((url) => url && url.trim() !== "");
		const results = await Promise.allSettled(
			validUrls.map((url) =>
				Image.prefetch(url, {
					cachePolicy: "disk", // Prioritize disk cache for persistence
				})
			)
		);

		// Log any failed preloads
		const failed = results.filter((r) => r.status === "rejected");
		if (failed.length > 0) {
			console.warn(`Failed to preload ${failed.length} images`);
		}
	} catch (error) {
		console.warn("Error preloading images:", error);
	}
}

/**
 * Clear the entire image cache
 */
export async function clearImageCache(): Promise<void> {
	try {
		await Image.clearDiskCache();
		await Image.clearMemoryCache();
	} catch (error) {
		console.warn("Error clearing image cache:", error);
	}
}

/**
 * Get the size of the disk cache
 */
export async function getCacheSize(): Promise<number> {
	try {
		const size = await Image.getCacheSize();
		return size;
	} catch (error) {
		console.warn("Error getting cache size:", error);
		return 0;
	}
}
