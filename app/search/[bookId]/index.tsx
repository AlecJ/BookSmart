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

	const { selectedBook, viewSearchResultBook, addBookToLibrary } =
		useBooksCtx();

	const handleAddToLibrary = async () => {
		if (book) {
			try {
				await addBookToLibrary(book);
				router.replace(`/read/${book.id}`);
			} catch (error) {
				console.error("Failed to add book to library:", error);
				alert("Failed to add book to library. Please try again.");
			}
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
					<Text>Add to Library</Text>
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
		textAlign: "center",
		justifyContent: "center",
		borderRadius: 8,
	},
});
