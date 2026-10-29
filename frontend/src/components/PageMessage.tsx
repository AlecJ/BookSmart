import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function PageMessage({ title, message }: { title: string; message: string }) {
	const { isAuthenticated } = useAuth();
	return (
		<section className="empty-state" role="status">
			<h1>{title}</h1>
			<p>{message}</p>
			{isAuthenticated ? (
				<Link className="text-link" to="/">Return to your library</Link>
			) : (
				<Link className="text-link" to="/search">Search for books</Link>
			)}
		</section>
	);
}
