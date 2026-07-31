import { useBooksCtx } from "@/app/contexts/BookContext";
import Book from "@/components/book";
import { BookType } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function BookSearchDetailsPage() {
	const { bookId } = useLocalSearchParams();
	const [book, setBook] = useState<BookType | null>(null);
	const isWeb = Platform.OS === "web";

	const {
		selectedBook,
		viewSearchResultBook,
		addBookToLibrary,
		bookDetailsError,
		books,
	} = useBooksCtx();

	const isInLibrary =
		!!book &&
		books.some(
			(libraryBook) => libraryBook.google_book_id === book.google_book_id,
		);

	const handleAddToLibrary = async () => {
		if (!book) return;

		if (isInLibrary) {
			router.push(`/read/${book.id}`);
			return;
		}

		try {
			await addBookToLibrary(book);
			router.replace(`/read/${book.id}`);
		} catch (error: any) {
			// Fall back gracefully if the library list hadn't loaded this book yet
			if (error?.message?.toLowerCase().includes("already")) {
				router.push(`/read/${book.id}`);
				return;
			}
			console.error("Failed to add book to library:", error);
			alert("Failed to add book to library. Please try again.");
		}
	};

	useEffect(() => {
		if (!selectedBook && bookId && viewSearchResultBook) {
			viewSearchResultBook(bookId as string);
		}

		if (selectedBook) {
			setBook(selectedBook);
		}
	}, [bookId, selectedBook]);

	// Show loading indicator while book is being fetched
	if (!book) {
		if (bookDetailsError) {
			return (
				<View style={[styles.container, styles.loadingContainer]}>
					<Text style={styles.text}>{bookDetailsError}</Text>
				</View>
			);
		}
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{isWeb && (
					<Book
						style={styles.bookCover}
						book={book}
						disableInteract
						showGradient
					/>
				)}
				<View style={styles.bookInfo}>
					<Text style={[styles.text, styles.bookTitle]}>
						{book.title}
					</Text>
					<Text style={[styles.text, styles.authorText]}>
						{book.author}
					</Text>
					<Text
						style={[styles.text, styles.descriptionText]}
						numberOfLines={10}
						ellipsizeMode="head"
					>
						{book.description}
					</Text>
				</View>
			</View>
			<View style={styles.addToLibaryBtnContainer}>
				<Pressable
					style={styles.addToLibraryBtn}
					onPress={handleAddToLibrary}
				>
					<Text style={styles.addToLibraryBtnText}>
						{isInLibrary ? "Open Book" : "Add to Library"}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {},
	loadingContainer: {},
	header: { width: "100%", marginTop: 20, flexDirection: "row" },
	bookCover: {
		flex: 1,
		width: "20%",
		height: 500,
	},
	bookInfo: {
		flex: 1,
		padding: 10,
		justifyContent: "center",
		maxHeight: 500,
	},
	text: {
		color: "#0e162d",
	},
	bookTitle: {
		alignSelf: "center",
		fontSize: 30,
		fontWeight: 400,
		marginTop: 10,
	},
	authorText: {
		alignSelf: "center",
		fontSize: 20,
		fontWeight: 300,
		marginTop: 10,
	},
	descriptionText: {
		fontSize: 18,
		fontWeight: 300,
		marginTop: 10,
		textIndent: "30px",
		textAlign: "center",
	},
	addToLibaryBtnContainer: {
		alignItems: "center",
		marginTop: 40,
	},
	addToLibraryBtn: {
		backgroundColor: "#4d6dc8",
		color: "white",
		width: 200,
		height: 50,

		justifyContent: "center",
		borderRadius: 8,
	},
	addToLibraryBtnText: {
		color: "white",
		fontSize: 18,
		fontWeight: 400,
		textAlign: "center",
	},
});
