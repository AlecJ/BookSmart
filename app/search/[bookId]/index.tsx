import Book from "@/components/book";
import { BookType } from "@/types";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function BookSearchDetailsPage() {
	const { bookId } = useLocalSearchParams();
	const [book, setBook] = useState<BookType | null>(null);
	const isWeb = Platform.OS === "web";

	useEffect(() => {
		// Fetch your book data here
		// For now, using mock data
		const fetchBook = async () => {
			const bookData = {
				name: "Letters_to_a_Young_Chef",
				prettyName: "Letters to a Young Chef",
				author: "Daniel Boulud",
				description:
					"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
				imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			};
			setBook(bookData);
		};

		fetchBook();
	}, [bookId]);

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
						{book.prettyName}
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
				<Link href={`/read/${bookId}`}>
					<View style={styles.addToLibraryBtn}>
						<Text>Add to Library</Text>
					</View>
				</Link>
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
