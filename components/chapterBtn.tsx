import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type Props = {
	title: string;
	style: PressableProps["style"];
};

export default function ChapterBtn({
	title,
	style,
	...props
}: PressableProps & Props) {
	return (
		<Pressable style={[styles.container, style]} {...props}>
			<Text style={styles.text}>{title}</Text>
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
	text: {
		fontSize: 16,
		color: "#000",
	},
});
