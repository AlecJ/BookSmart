import { StyleSheet, View } from "react-native";

export default function ProgressBar({}) {
	return (
		<View style={styles.progressBar}>
			<View style={styles.progressFill} />
		</View>
	);
}

const styles = StyleSheet.create({
	progressBar: {
		width: "100%",
		height: 20,
		backgroundColor: "#e0e0df",
		borderRadius: 5,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#f9f954ff",
		width: "50%", // Example width, should be dynamic based on progress
	},
});
