import { Link, useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId, chapterNum } = useLocalSearchParams();

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Book Chapter Screen</Text>
			<Text style={styles.text}>Book ID: {bookId}</Text>
			<Text style={styles.text}>Chapter Number: {chapterNum}</Text>
			<Link asChild href={`./${chapterNum}/question/1`}>
				<Button title="Question 1" />
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: "#0e162d",
	},
});
