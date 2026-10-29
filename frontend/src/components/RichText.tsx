// Generated questions and feedback often use Markdown emphasis, e.g.
// "*The Hobbit*". Render **bold** and *italic* as elements (never as HTML)
// instead of showing the asterisks.
const EMPHASIS = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

export function RichText({ text }: { text: string }) {
	return (
		<>
			{text.split(EMPHASIS).map((part, index) => {
				if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
					return <strong key={index}>{part.slice(2, -2)}</strong>;
				}
				if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
					return <em key={index}>{part.slice(1, -1)}</em>;
				}
				return part;
			})}
		</>
	);
}
