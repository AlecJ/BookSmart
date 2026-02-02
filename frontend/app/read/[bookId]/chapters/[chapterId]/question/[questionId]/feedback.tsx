import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId, chapterNum } = useLocalSearchParams();

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Answer</Text>
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
