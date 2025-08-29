import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Book Details Screen</Text>
			<Text style={styles.text}>Book Title: {bookId}</Text>
			<Text style={styles.text}>Author</Text>
			<Text style={styles.text}>Description</Text>
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
