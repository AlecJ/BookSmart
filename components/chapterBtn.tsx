import { Ionicons } from "@expo/vector-icons";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type Props = {
	title: string;
	status: string;
	style: PressableProps["style"];
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

export default function ChapterBtn({
	title,
	status,
	style,
	...props
}: PressableProps & Props) {
	const icon = STATUS_ICON_MAP[status];

	return (
		<Pressable style={[styles.container, style]} {...props}>
			<Text style={styles.chapterTitleText}>{title}</Text>
			<Ionicons
				style={styles.chapterBtnIcon}
				name={icon.name}
				size={30}
				color={icon.color}
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 150,
		height: 60,
		backgroundColor: "#ccc",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
	},
	chapterTitleText: {
		fontSize: 20,
		fontWeight: 250,
		color: "#000",
	},
	chapterBtnIcon: {
		position: "absolute",
		right: 25,
	},
});
