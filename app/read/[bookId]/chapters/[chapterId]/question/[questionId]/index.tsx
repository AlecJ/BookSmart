import { useBook } from "@/app/read/[bookId]/_layout";
import FeedbackScore from "@/components/feedbackScore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Animated,
	Button,
	Dimensions,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = Math.min(SCREEN_WIDTH, 970);

export default function BookDetailsScreen() {
	const [showQuestion, setShowQuestion] = useState(true);
	const [userResponse, setUserResponse] = useState("");
	const [charCount, setCharCount] = useState(0);
	const initialized = useRef(false);
	const slideAnim = useRef(new Animated.Value(0)).current;
	const buttonOpacity = useRef(new Animated.Value(1)).current;

	const { chapterNum, questionNum } = useLocalSearchParams();
	const { getQuestion } = useBook();

	const question = getQuestion(Number(chapterNum), Number(questionNum));

	useEffect(() => {
		if (question?.userResponse && !initialized.current) {
			setUserResponse(question.userResponse);
			setCharCount(question.userResponse.length);
			initialized.current = true;
		}
	}, [question?.userResponse]);

	// Show loading indicator while book is being fetched
	if (!question) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	const slideToFeedback = () => {
		Animated.parallel([
			Animated.timing(buttonOpacity, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: -SLIDE_WIDTH,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			setShowQuestion(false);
			Animated.timing(buttonOpacity, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}).start();
		});
	};

	const slideToQuestion = () => {
		Animated.parallel([
			Animated.timing(buttonOpacity, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			setShowQuestion(true);
			Animated.timing(buttonOpacity, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}).start();
		});
	};

	const questionScreen = (
		<>
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
		</>
	);

	const feedbackScreen = (
		<>
			<Text style={styles.questionText}>{question?.text}</Text>
			<FeedbackScore status={"complete"} />
		</>
	);

	return (
		<View style={styles.container}>
			<Animated.View
				style={[
					styles.slideContainer,
					{
						transform: [{ translateX: slideAnim }],
					},
				]}
			>
				<View style={styles.screen}>
					{questionScreen}
					{showQuestion && (
						<Animated.View
							style={[
								styles.viewFeedbackBtn,
								{ opacity: buttonOpacity },
							]}
						>
							<Pressable onPress={slideToFeedback}>
								<Text style={styles.viewFeedbackText}>
									View Feedback
								</Text>
								<Ionicons
									style={styles.viewFeedbackChevron}
									name="chevron-forward"
									size={30}
								/>
							</Pressable>
						</Animated.View>
					)}
				</View>
				<View style={styles.screen}>
					{feedbackScreen}
					{!showQuestion && (
						<Animated.View
							style={[
								styles.viewQuestionBtn,
								{ opacity: buttonOpacity },
							]}
						>
							<Pressable onPress={slideToQuestion}>
								<Text style={styles.viewFeedbackText}>
									View Question
								</Text>
								<Ionicons
									style={styles.viewFeedbackChevron}
									name="chevron-back"
									size={30}
								/>
							</Pressable>
						</Animated.View>
					)}
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f1e9d2",
		minHeight: 400,
		overflow: "hidden",
		marginHorizontal: -20,
	},
	slideContainer: {
		flexDirection: "row",
		width: SLIDE_WIDTH * 2,
	},
	screen: {
		width: SLIDE_WIDTH,
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
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
	viewQuestionBtn: {
		position: "absolute",
		width: 80,
		top: "45%",
		left: 5,
	},
	viewFeedbackBtn: {
		position: "absolute",
		width: 80,
		top: "45%",
		right: 5,
	},
	viewFeedbackText: {
		fontSize: 15,
		textAlign: "center",
	},
	viewFeedbackChevron: {
		alignSelf: "center",
	},
});
