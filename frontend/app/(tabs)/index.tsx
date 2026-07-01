import Book from "@/components/book";
import { Link } from "expo-router";
import { useEffect } from "react";

import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useBooksCtx } from "../contexts/BookContext";

export default function Index() {
	const isWeb = Platform.OS === "web";

	const { books, getUserBooks } = useBooksCtx();

	useEffect(() => {
		getUserBooks();
	}, [getUserBooks]);

	return (
		<>
			{books.length === 0 ? (
				<Text>Search for books to read.</Text>
			) : (
				(() => {
					const content = (
						<>
							<View style={styles.container}>
								<Text style={styles.continueText}>
									Continue Reading...
								</Text>
								<Link asChild href={`/read/${books[0].id}`}>
									<Book
										style={styles.mainBook}
										book={books[0]}
										showContinueBtn
										showProgressBar
									/>
								</Link>
							</View>
							<View style={styles.container}>
								<Text style={styles.libraryText}>
									Your Library
								</Text>
								<View style={styles.bookshelf}>
									{books.slice(1, 7).map((book, index) => (
										<Link
											key={index}
											asChild
											href={`/read/${book.id}`}
										>
											<Book
												key={index}
												book={book}
												style={styles.smallBook}
											/>
										</Link>
									))}
								</View>
							</View>
						</>
					);

					return isWeb ? (
						<View style={styles.columns}>{content}</View>
					) : (
						<ScrollView>{content}</ScrollView>
					);
				})()
			)}
		</>
	);
}

const styles = StyleSheet.create({
	columns: {
		height: "100%",
		maxHeight: 700,
		width: "100%",
		marginTop: 50,
		flexDirection: "row",
		flex: 1,
	},
	container: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
	},
	bookContainer: {},
	mainBook: {
		width: "100%",
		aspectRatio: 2 / 3,
		padding: 15,
		borderRadius: 15,
	},
	smallBook: {
		width: "33%",
		aspectRatio: 2 / 3,
		padding: 4,
		borderRadius: 8,
	},
	bookshelf: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		alignContent: "center",
		padding: 15,
		width: "100%",
	},
	text: {
		color: "#0e162d",
	},
	continueText: {
		fontSize: 20,
		fontWeight: 500,
	},
	libraryText: {
		fontSize: 20,
		fontWeight: 500,
		marginBottom: 10,
	},
});
