import { StyleSheet, View } from "react-native";

type Props = {
	fillPercent: number;
};

export default function ProgressBar({ fillPercent }: Props) {
	return (
		<View style={styles.progressBar}>
			<View
				style={[
					styles.progressFill,
					{ width: `${fillPercent * 100}%` },
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	progressBar: {
		width: "100%",
		height: 15,
		backgroundColor: "#e0e0df",
		borderRadius: 5,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#fee71cff",
		width: "50%", // Example width, should be dynamic based on progress
	},
});
