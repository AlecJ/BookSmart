import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000")
	.replace(/\/+$/, "");

export const api = axios.create({
	baseURL: `${apiBaseUrl}/api/v1`,
	// No default Content-Type: axios sets it per request from the body, and a
	// JSON type on bodiless requests made it send a literal `null` body.
	timeout: 10000,
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (axios.isAxiosError<{ detail?: string }>(error)) {
		return error.response?.data?.detail || fallback;
	}
	return error instanceof Error ? error.message : fallback;
}
