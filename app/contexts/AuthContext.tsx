import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { userService } from "../services/userService";
import { secureStorage } from "../utils/secureStorage";

export const TOKEN_KEY = "auth_token";

interface AuthContextType {
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// Check authentication status on mount
	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const token = await secureStorage.getItem(TOKEN_KEY);
			if (token) {
				// Set token in API headers
				api.defaults.headers.common[
					"Authorization"
				] = `Bearer ${token}`;

				// Verify token is still valid by fetching user profile
				// const response = await api.get("/users/me");
				// setUser(response.data);
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			// Token is invalid, clear it
			await secureStorage.removeItem(TOKEN_KEY);
			delete api.defaults.headers.common["Authorization"];
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const access_token = await userService.login(email, password);

			// Store token and set headers
			await secureStorage.setItem(TOKEN_KEY, access_token);

			api.defaults.headers.common[
				"Authorization"
			] = `Bearer ${access_token}`;

			setIsAuthenticated(true);
		} catch (error: any) {
			console.error("Login failed:", error);
			throw new Error(error.response?.data?.detail || "Login failed");
		}
	};

	const logout = async () => {
		try {
			await secureStorage.removeItem(TOKEN_KEY);
			delete api.defaults.headers.common["Authorization"];
			setIsAuthenticated(false);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isLoading,
				isAuthenticated,
				login,
				logout,
				checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
