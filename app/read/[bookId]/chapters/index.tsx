import { Link, useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Book Chapters Screen</Text>
			<Link asChild href={`./chapters/1`}>
				<Button title="Chapter 1" />
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
