import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000")
	.replace(/\/+$/, "");

export const api = axios.create({
	baseURL: `${apiBaseUrl}/api/v1`,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (axios.isAxiosError<{ detail?: string }>(error)) {
		return error.response?.data?.detail || fallback;
	}
	return error instanceof Error ? error.message : fallback;
}
