import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Loading";
import { useReturnPath } from "../components/RouteGuards";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";

export function AuthPage({ isRegister = false }: { isRegister?: boolean }) {
	const { login, register } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const returnPath = useReturnPath();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	useDocumentTitle(isRegister ? "Create account" : "Sign in");

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		if (isRegister && password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setIsSubmitting(true);
		try {
			if (isRegister) await register(email, password);
			else await login(email, password);
			navigate(returnPath, { replace: true });
		} catch (submitError) {
			setError(getApiErrorMessage(
				submitError,
				isRegister ? "Registration failed." : "Incorrect email or password.",
			));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="auth-page">
			<div className="auth-card">
				<span className="eyebrow">{isRegister ? "Start your reading journey" : "Welcome back"}</span>
				<h1>{isRegister ? "Create your account" : "Sign in to BookSmart"}</h1>
				<p className="muted">{isRegister ? "Save your books and keep track of your progress." : "Your library is waiting for you."}</p>
				<form className="auth-form" onSubmit={submit}>
					{error && <p className="form-error" role="alert">{error}</p>}
					<label>
						Email
						<input
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</label>
					<div className="field">
						<label>
							Password
							<input
								type="password"
								autoComplete={isRegister ? "new-password" : "current-password"}
								required
								minLength={isRegister ? 8 : undefined}
								maxLength={128}
								aria-describedby={isRegister ? "password-hint" : undefined}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</label>
						{isRegister && <span className="field-hint" id="password-hint">At least 8 characters.</span>}
					</div>
					{isRegister && (
						<label>
							Confirm password
							<input
								type="password"
								autoComplete="new-password"
								required
								maxLength={128}
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
							/>
						</label>
					)}
					<button className="button primary-button full-width" disabled={isSubmitting} aria-busy={isSubmitting}>
						{isSubmitting && <Spinner small />}
						{isSubmitting ? (isRegister ? "Creating account..." : "Signing in...") : isRegister ? "Create account" : "Sign in"}
					</button>
				</form>
				<p className="auth-switch">
					{isRegister ? "Already have an account?" : "New to BookSmart?"}{" "}
					<Link to={isRegister ? "/login" : "/register"} state={location.state}>
						{isRegister ? "Sign in" : "Create an account"}
					</Link>
				</p>
			</div>
		</section>
	);
}
