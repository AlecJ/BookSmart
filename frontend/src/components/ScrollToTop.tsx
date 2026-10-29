import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// BrowserRouter keeps the scroll position between pages, so opening a chapter
// from the bottom of a long list would land partway down the next page.
export function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}
