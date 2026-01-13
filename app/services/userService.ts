import { api } from "./api";

export const userService = {
	login: async (email: string, password: string) => {
		try {
			const formData = new URLSearchParams();
			formData.append("username", email);
			formData.append("password", password);

			const response = await api.post("/login/access-token", formData, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			const { access_token } = response.data;
			return access_token;
		} catch (error: any) {
			console.error("Login failed:", error);
			throw new Error(error.response?.data?.detail || "Login failed");
		}
	},
};
