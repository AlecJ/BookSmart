import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppHeader() {
	const { isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	// Mirror the current search in the box so results pages show what was searched.
	const currentQuery = pathname === "/search" ? searchParams.get("q") || "" : "";
	const [query, setQuery] = useState(currentQuery);

	useEffect(() => setQuery(currentQuery), [currentQuery]);

	const submitSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const search = query.trim();
		if (!search) return;
		navigate(`/search?q=${encodeURIComponent(search)}`);
	};

	return (
		<header className="site-header">
			<div className="header-content">
				<Link className="brand" to={isAuthenticated ? "/" : "/search"}>
					<span className="brand-mark" aria-hidden="true">B</span>
					<span>BookSmart</span>
				</Link>
				<form className="header-search" onSubmit={submitSearch} role="search">
					<span aria-hidden="true">⌕</span>
					<input
						aria-label="Search books"
						placeholder="Search by title or author"
						type="search"
						enterKeyHint="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<button aria-label="Submit book search" type="submit">Search</button>
				</form>
				<nav className="header-nav" aria-label="Main navigation">
					{isAuthenticated ? (
						<>
							<NavLink to="/" end>My library</NavLink>
							<NavLink to="/profile">Profile</NavLink>
							<button className="link-button" onClick={logout} type="button">
								Log out
							</button>
						</>
					) : (
						<>
							<NavLink to="/login">Sign in</NavLink>
							<NavLink className="nav-cta" to="/register">Create account</NavLink>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
