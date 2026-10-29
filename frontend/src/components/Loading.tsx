// The one spinner used across the app: full size for page and section loads,
// `small` inline in buttons and form fields (it inherits the text colour).
export function Spinner({ small = false }: { small?: boolean }) {
	return <span className={small ? "spinner spinner-small" : "spinner"} aria-hidden="true" />;
}

export function Loading({ label = "Loading..." }: { label?: string }) {
	return (
		<div className="loading-state" role="status">
			<Spinner />
			<span>{label}</span>
		</div>
	);
}
