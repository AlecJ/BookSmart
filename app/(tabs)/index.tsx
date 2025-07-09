import Book from "@/components/book";
import { StyleSheet, Text, View } from "react-native";

const PlaceholderImage = require("@/assets/images/LettersToAYoungChef.jpg");

export default function Index() {
	return (
		<View style={styles.container}>
			<Book
				imgSource={PlaceholderImage}
				width={"85vw"}
				height={"120vw"}
				enableNavBtn
			/>
			<Text style={styles.text}>Other in progress books</Text>
			<Text style={styles.text}>
				OR "Search for a book to add to your reading list."
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
		paddingTop: "1.5rem",
		backgroundColor: "#f1e9d2",
		alignItems: "center",
	},
	text: {
		color: "#0e162d",
	},
});
