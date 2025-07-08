import Book from "@/components/book";
import { StyleSheet, Text, View } from "react-native";

const PlaceholderImage = require("@/assets/images/LettersToAYoungChef.jpg");

export default function Index() {
	return (
		<View style={styles.container}>
			<Book imgSource={PlaceholderImage} enableNavBtn />
			<Text style={styles.text}>Other in progress books</Text>
			<Text style={styles.text}>
				OR "Search for a book to add to your reading list."
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f1e9d2",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		color: "#0e162d",
	},
});
