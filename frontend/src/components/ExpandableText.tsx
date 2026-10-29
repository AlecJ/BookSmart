import { useState } from "react";

// Long book descriptions push actions and chapters far down on small screens,
// so they start clamped with a toggle.
export function ExpandableText({
	text,
	className = "",
	collapseAfter = 420,
}: {
	text: string;
	className?: string;
	collapseAfter?: number;
}) {
	const [expanded, setExpanded] = useState(false);
	const isLong = text.length > collapseAfter;
	return (
		<div className={`expandable ${className}`}>
			<p className={isLong && !expanded ? "is-clamped" : undefined}>{text}</p>
			{isLong && (
				<button
					className="text-link"
					type="button"
					aria-expanded={expanded}
					onClick={() => setExpanded((current) => !current)}
				>
					{expanded ? "Show less" : "Show more"}
				</button>
			)}
		</div>
	);
}
