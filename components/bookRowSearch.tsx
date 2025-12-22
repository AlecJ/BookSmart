import BookRow from "@/components/bookRow";
import { BookType } from "@/types";
import { StyleSheet, ViewStyle } from "react-native";

type Props = {
	book: BookType;
	style?: ViewStyle;
};

export default function SearchBookRow({ book, style }: Props) {
	return <BookRow book={book} style={[styles.searchBookRow, style]} />;
}

const styles = StyleSheet.create({
	searchBookRow: {},
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
