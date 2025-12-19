import { useBook } from "@/app/read/[bookId]/_layout";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Button,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

export default function BookDetailsScreen() {
	const [userResponse, setUserResponse] = useState("");
	const [charCount, setCharCount] = useState(0);
	const initialized = useRef(false);

	const { chapterNum, questionNum } = useLocalSearchParams();
	const { getQuestion } = useBook();

	const question = getQuestion(Number(chapterNum), Number(questionNum));

	useEffect(() => {
		if (question?.response && !initialized.current) {
			setUserResponse(question.response);
			setCharCount(question.response.length);
			initialized.current = true;
		}
	}, [question?.response]);

	// Show loading indicator while book is being fetched
	if (!question) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.questionText}>{question?.text}</Text>
			<TextInput
				style={styles.userResponseInput}
				onChangeText={(text) => {
					setUserResponse(text);
					setCharCount(text.length);
				}}
				value={userResponse}
				maxLength={1000}
				placeholder={"Enter your response here..."}
				placeholderTextColor={"#999"}
				multiline
				textAlignVertical="top"
			/>
			<Text style={styles.charCountText} selectable={false}>
				{charCount}/1000
			</Text>
			<View style={styles.submitResponseBtn}>
				<Button title="Submit Response" onPress={() => {}} />
			</View>
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
	questionText: {
		color: "#0e162d",
		fontSize: 22,
		fontWeight: 400,
		marginTop: 30,
		width: "80%",
	},
	userResponseInput: {
		backgroundColor: "#ffffffb3",
		width: "80%",
		height: 250,
		marginTop: 20,
		textAlign: "auto",
		fontSize: 16,
		padding: 8,
	},
	charCountText: {
		width: "80%",
		textAlign: "left",
		marginTop: 5,
		fontSize: 14,
		color: "#666",
	},
	submitResponseBtn: {
		marginTop: 20,
		width: 170,
	},
});
