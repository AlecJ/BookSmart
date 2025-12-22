import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
	status: string;
	style?: ViewStyle;
};

enum Status {
	INCOMPLETE = "incomplete",
	FAILED = "failed",
	PARTIAL_COMPLETE = "partial_complete",
	COMPLETE = "complete",
}

const STATUS_ICON_MAP: Record<Status, keyof typeof Ionicons.glyphMap> = {
	[Status.INCOMPLETE]: { name: "ellipse-outline", color: "" },
	[Status.FAILED]: { name: "close-circle", color: "#f53636ff" },
	[Status.PARTIAL_COMPLETE]: { name: "checkmark-circle", color: "#e5ab17ff" },
	[Status.COMPLETE]: { name: "checkmark-circle", color: "#14af1eff" },
};

export default function FeedbackScore({ status, style, ...props }: Props) {
	const icon = STATUS_ICON_MAP[status];

	return (
		<View style={[styles.container, style]} {...props}>
			<Text style={styles.gradeText}>Grade</Text>
			<Ionicons
				style={styles.chapterBtnIcon}
				name={icon.name}
				size={30}
				color={icon.color}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 180,
		minHeight: 50,
		backgroundColor: "#ccc",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
	},
	gradeText: {
		fontSize: 20,
		fontWeight: 300,
		color: "#000",
		padding: 25,
		paddingRight: 100,
		flexWrap: "wrap",
	},
	chapterBtnIcon: {
		position: "absolute",
		right: 25,
	},
});
