import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops! Not Found" }} />
			<View style={styles.container}>
				<Text style={styles.text}>
					The page you are looking for does not exist.
				</Text>
				<Link href="/" style={styles.button}>
					Go back
				</Link>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// backgroundColor: "#25292e",
		justifyContent: "center",
		alignItems: "center",
	},
	button: {
		fontSize: 20,
		textDecorationLine: "underline",
		color: "#000",
	},
	text: {
		fontSize: 18,
		textAlign: "center",
		marginBottom: 20,
	},
});
