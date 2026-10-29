export class HttpError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "HttpError";
	}
}

export function errorDetail(error: unknown): string {
	return error instanceof Error ? error.message : "Internal server error";
}
