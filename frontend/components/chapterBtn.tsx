import { Ionicons } from "@expo/vector-icons";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type Props = {
	title: string;
	status: number | null;
	style: PressableProps["style"];
};

const STATUS_ICON_MAP: Record<
	string,
	{ name: keyof typeof Ionicons.glyphMap; color: string }
> = {
	null: { name: "ellipse-outline", color: "#999" },
	"0": { name: "close-circle", color: "#f53636ff" },
	"1": { name: "checkmark-circle", color: "#e5ab17ff" },
	"2": { name: "checkmark-circle", color: "#14af1eff" },
};

export default function ChapterBtn({
	title,
	status,
	style,
	...props
}: PressableProps & Props) {
	const statusKey = status === null ? "null" : String(status);
	const icon = STATUS_ICON_MAP[statusKey];

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
		minHeight: 60,
		backgroundColor: "#ccc",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
	},
	chapterTitleText: {
		fontSize: 20,
		fontWeight: 300,
		color: "#000",
		padding: 25,
		paddingRight: 70,
		flexWrap: "wrap",
	},
	chapterBtnIcon: {
		position: "absolute",
		right: 25,
	},
});
