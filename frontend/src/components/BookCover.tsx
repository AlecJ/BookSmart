import placeholderCover from "../../assets/images/book-cover-placeholder.png";
import type { BookType } from "../types";

export function bookTitle(book: BookType): string {
	return book.prettyName || book.title;
}

export function BookCover({
	book,
	className = "",
}: {
	book: BookType;
	className?: string;
}) {
	return (
		<img
			className={`book-cover ${className}`}
			src={book.image_url || placeholderCover}
			alt={`Cover of ${bookTitle(book)}`}
			loading="lazy"
			onError={(event) => {
				// Swap in the placeholder once; if it fails too, don't loop.
				const image = event.currentTarget;
				if (image.dataset.fallback) return;
				image.dataset.fallback = "true";
				image.src = placeholderCover;
			}}
		/>
	);
}
