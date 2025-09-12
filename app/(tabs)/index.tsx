import Book from "@/components/book";
import { BookType } from "@/types";
import { Link } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
	const isWeb = Platform.OS === "web";

	const books: BookType[] = [
		{
			name: "Letters_to_a_Young_Chef",
			imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			progress: 0.75,
		},
		{ name: "Book 2" },
		{ name: "Book 3" },
		{ name: "Book 4" },
		{ name: "Book 5" },
		{ name: "Book 9" },
		{ name: "Book 6" },
		{ name: "Book 7" },
		{ name: "Book 8" },
	];

	return (
		<>
			{books.length === 0 ? (
				<Text>Search for books to read.</Text>
			) : (
				(() => {
					const content = (
						<>
							<View style={styles.container}>
								<Link asChild href={`/read/${books[0].name}`}>
									<Book
										style={styles.mainBook}
										book={books[0]}
										showContinueBtn
										showProgressBar
									/>
								</Link>
							</View>
							<View style={styles.container}>
								<View style={styles.bookshelf}>
									{books.slice(1).map((book, index) => (
										<Book
											key={index}
											book={book}
											style={styles.smallBook}
										/>
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
		height: "100%",
		aspectRatio: 2 / 3,
		padding: 15,
		borderRadius: 15,
	},
	smallBook: {
		width: "25%",
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
		flex: 1,
	},
	text: {
		color: "#0e162d",
	},
});
