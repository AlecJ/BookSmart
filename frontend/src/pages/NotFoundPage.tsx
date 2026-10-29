import { PageMessage } from "../components/PageMessage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFoundPage() {
	useDocumentTitle("Page not found");
	return <PageMessage title="Page not found" message="The page you are looking for does not exist." />;
}
