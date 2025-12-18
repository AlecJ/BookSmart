import {
	Image,
	Pressable,
	PressableProps,
	StyleSheet,
	Text,
} from "react-native";

type Props = {
	title: string;
	style: PressableProps["style"];
};

const incompleteCircle = require("@/assets/images/incomplete-circle.png");
const failedCircle = require("@/assets/images/failed-circle.png");
const partialCompleteCircle = require("@/assets/images/partial-complete-circle.png");
const passedCircle = require("@/assets/images/passed-circle.png");

export default function ChapterBtn({
	title,
	style,
	...props
}: PressableProps & Props) {
	return (
		<Pressable style={[styles.container, style]} {...props}>
			<Text style={styles.chapterTitleText}>{title}</Text>
			<Image style={styles.chapterBtnIcon} source={incompleteCircle} />
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
		width: 25,
		height: 25,
		position: "absolute",
		right: 25,
	},
});
