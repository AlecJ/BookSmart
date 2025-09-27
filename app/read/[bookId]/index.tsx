import { Link, useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();

	return (
		<View style={styles.container}>
			<View style={styles.innerContainer}>
				<Text style={styles.text}>Book Details Screen</Text>
				<Text style={styles.text}>Book Title: {bookId}</Text>
				<Text style={styles.text}>Author</Text>
				<Text style={styles.text}>Description</Text>
				<Link asChild href={`./${bookId}/chapters`}>
					<Button title="BookSmart" />
				</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		// flex: 1,
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "red",
	},
	innerContainer: {
		flex: 1,
	},
	text: {
		color: "#0e162d",
	},
});
