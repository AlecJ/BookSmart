// A question's status is its grade (2 = pass, 1 = partial pass, 0 = fail). A
// chapter's summarizes its questions, so 1 also covers "some unanswered".
const LABELS = {
	question: { 2: "Passed", 1: "Partially passed", 0: "Not passed", none: "Not answered" },
	chapter: { 2: "Complete", 1: "In progress", 0: "Needs more work", none: "Not started" },
} as const;
const MARKS = {
	2: { className: "status-complete", glyph: "✓" },
	1: { className: "status-partial", glyph: "✓" },
	0: { className: "status-failed", glyph: "×" },
} as const;

export function StatusMark({
	status,
	kind,
}: {
	status?: number | null;
	kind: "question" | "chapter";
}) {
	const labels = LABELS[kind];
	if (status !== 0 && status !== 1 && status !== 2) {
		return <span className="status-mark status-empty" role="img" aria-label={labels.none} title={labels.none} />;
	}
	const mark = MARKS[status];
	return (
		<span className={`status-mark ${mark.className}`} role="img" aria-label={labels[status]} title={labels[status]}>
			<span aria-hidden="true">{mark.glyph}</span>
		</span>
	);
}
