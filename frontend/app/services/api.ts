import axios from "axios";

export const api = axios.create({
	baseURL:
		(process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000") +
		"/api/v1",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});
