import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loading } from "./Loading";

// Pages that send the user to sign in pass `{ from: location }` as route
// state, so they return to that page afterwards instead of the home page.
export function useReturnPath(): string {
	const from = (useLocation().state as { from?: Location } | null)?.from;
	return from ? `${from.pathname}${from.search}` : "/";
}

export function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();
	if (isLoading) return <Loading />;
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function AuthRoute({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const returnPath = useReturnPath();
	if (isLoading) return <Loading />;
	return isAuthenticated ? <Navigate to={returnPath} replace /> : children;
}
