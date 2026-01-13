import Book from "@/components/book";
import { BookType } from "@/types";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
	book: BookType;
	style?: ViewStyle;
};

export default function BookRow({ book, style }: Props) {
	return (
		<View style={[styles.rowContainer, style]}>
			<Book
				book={book}
				style={{
					height: 96,
					aspectRatio: 2 / 3,
				}}
				disableInteract
			></Book>
			<View style={styles.bookDetails}>
				<Text style={styles.bookTitle}>
					{book.prettyName || book.name || book.title}
				</Text>
				<Text>by {book.author}</Text>
			</View>

			{/* <View style={styles.bookProgress}>
				<Text>Progress</Text>
				<Text>{book.progress ? book.progress * 100 + "%" : "0%"}</Text>
			</View> */}
		</View>
	);
}

const styles = StyleSheet.create({
	rowContainer: {
		height: 96,
		width: 550,
		maxWidth: "100%",
		flexDirection: "row",
		backgroundColor: "rgba(236, 211, 168, 1)",
		alignItems: "center",
	},
	bookDetails: {
		flex: 1,
		textAlign: "center",
		marginLeft: 20,
	},
	bookTitle: {
		fontSize: 20,
	},
	bookProgress: {
		fontSize: 16,
		justifyContent: "flex-end",
		marginRight: 20,
	},
});
