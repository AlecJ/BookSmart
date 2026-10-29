import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { AuthRoute, ProtectedRoute } from "./components/RouteGuards";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthPage } from "./pages/AuthPage";
import { ChapterPage } from "./pages/ChapterPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuestionPage } from "./pages/QuestionPage";
import { ReadBookLayout } from "./pages/ReadBookLayout";
import { ReadBookPage } from "./pages/ReadBookPage";
import { SearchBookDetailsPage } from "./pages/SearchBookDetailsPage";
import { SearchPage } from "./pages/SearchPage";

export default function App() {
	return (
		<div className="app-shell">
			<ScrollToTop />
			<a className="skip-link" href="#main">Skip to content</a>
			<AppHeader />
			<main className="main-content" id="main">
				<Routes>
					<Route path="/login" element={<AuthRoute><AuthPage /></AuthRoute>} />
					<Route path="/register" element={<AuthRoute><AuthPage isRegister /></AuthRoute>} />
					<Route path="/search" element={<SearchPage />} />
					<Route path="/search/:bookId" element={<SearchBookDetailsPage />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/read/:bookId" element={<ReadBookLayout />}>
							<Route index element={<ReadBookPage />} />
							<Route path="chapters/:chapterId" element={<ChapterPage />} />
							<Route path="chapters/:chapterId/question/:questionId" element={<QuestionPage />} />
						</Route>
					</Route>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</main>
			<footer className="site-footer">
				<span>BookSmart</span>
				<span>© 2026</span>
			</footer>
		</div>
	);
}
