import { api } from "./api";

export const userService = {
	login: async (email: string, password: string): Promise<string> => {
		const formData = new URLSearchParams({
			username: email,
			password,
		});
		const { data } = await api.post("/login/access-token", formData, {
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});
		return data.access_token;
	},

	register: async (email: string, password: string): Promise<string> => {
		const { data } = await api.post("/users/register", {
			email,
			password,
		});
		return data.access_token;
	},
};
