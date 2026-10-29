import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { api, getApiErrorMessage } from "../services/api";
import { userService } from "../services/userService";

const TOKEN_KEY = "auth_token";

interface AuthContextValue {
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The API answers 401 for a missing token and 403 for an invalid or expired one.
function isRejectedSession(error: unknown): boolean {
	const status = axios.isAxiosError(error) ? error.response?.status : undefined;
	return status === 401 || status === 403;
}

function setAuthorization(token: string | null) {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common.Authorization;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const token = window.localStorage.getItem(TOKEN_KEY);
			if (!token) {
				setIsLoading(false);
				return;
			}

			setAuthorization(token);
			try {
				await api.get("/read", { params: { limit: 1, offset: 0 } });
				setIsAuthenticated(true);
			} catch (error) {
				console.error("Auth check failed:", error);
				if (isRejectedSession(error)) {
					window.localStorage.removeItem(TOKEN_KEY);
					setAuthorization(null);
				} else {
					// The API is unreachable or failing; keep the session so the
					// user isn't signed out by an outage.
					setIsAuthenticated(true);
				}
			} finally {
				setIsLoading(false);
			}
		};

		void checkAuth();
	}, []);

	const authenticate = useCallback(async (operation: () => Promise<string>) => {
		try {
			const token = await operation();
			window.localStorage.setItem(TOKEN_KEY, token);
			setAuthorization(token);
			setIsAuthenticated(true);
		} catch (error) {
			throw new Error(getApiErrorMessage(error, "Authentication failed"));
		}
	}, []);

	const login = useCallback(
		(email: string, password: string) =>
			authenticate(() => userService.login(email, password)),
		[authenticate],
	);
	const register = useCallback(
		(email: string, password: string) =>
			authenticate(() => userService.register(email, password)),
		[authenticate],
	);
	const logout = useCallback(() => {
		window.localStorage.removeItem(TOKEN_KEY);
		setAuthorization(null);
		setIsAuthenticated(false);
	}, []);

	// Sign out when the API rejects the token mid-session (e.g. it expired).
	useEffect(() => {
		const interceptor = api.interceptors.response.use(undefined, (error: unknown) => {
			if (isRejectedSession(error) && window.localStorage.getItem(TOKEN_KEY)) {
				logout();
			}
			return Promise.reject(error);
		});
		return () => api.interceptors.response.eject(interceptor);
	}, [logout]);

	const value = useMemo(
		() => ({ isLoading, isAuthenticated, login, register, logout }),
		[isLoading, isAuthenticated, login, register, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
