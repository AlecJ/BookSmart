import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BookProvider } from "./contexts/BookContext";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<BookProvider>
					<App />
				</BookProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
