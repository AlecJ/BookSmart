import { StyleSheet, Text, View } from "react-native";

export default function SearchScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Search Screen</Text>
			<Text style={styles.text}>Search Bar</Text>
			<Text style={styles.text}>Results</Text>
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
