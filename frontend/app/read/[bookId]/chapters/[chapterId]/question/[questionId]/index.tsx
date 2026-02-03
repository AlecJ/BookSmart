import { useBooksCtx } from "@/app/contexts/BookContext";
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

// todo remove
const FEEDBACK_GRADE_MAP: Record<number, string> = {
	0: "failed",
	1: "partial_complete",
	2: "complete",
};

export default function BookDetailsScreen() {
	const [showQuestion, setShowQuestion] = useState(true);
	const [showFeedback, setShowFeedback] = useState(true);
	// const [userResponse, setUserResponse] = useState("");
	const [charCount, setCharCount] = useState(0);
	const slideAnim = useRef(new Animated.Value(0)).current;
	const buttonOpacity = useRef(new Animated.Value(1)).current;

	const { chapterId, questionId } = useLocalSearchParams();
	const {
		isLoadingBookData: isLoading,
		selectedChapter: chapter,
		selectedQuestion: question,
		userResponse,
		setUserResponse,
		feedback,
		getChapter,
		setSelectedChapter,
		getChapterQuestion,
		setSelectedQuestion,
		getUserResponse,
		submitUserResponse,
	} = useBooksCtx();

	const feedbackGrade = feedback?.feedback_grade || null;

	useEffect(() => {
		if (!chapter && chapterId) {
			const chapterToSet = getChapter(chapterId as string);
			if (chapterToSet) {
				setSelectedChapter(chapterToSet);
			}
		}
	}, [chapter, chapterId, getChapter, setSelectedChapter]);

	useEffect(() => {
		if (!question && questionId) {
			const questionToSet = getChapterQuestion(questionId as string);
			if (questionToSet) {
				setSelectedQuestion(questionToSet);
			}
		}
	}, [question, questionId, getChapterQuestion, setSelectedQuestion]);

	useEffect(() => {
		if (questionId) {
			getUserResponse(questionId as string);
		}
	}, [questionId, getUserResponse]);

	const handleUserSubmit = async () => {
		if (!userResponse.trim()) {
			alert("Please enter a response before submitting.");
			return;
		}

		// hide previous feedback
		setShowFeedback(false);
		slideToFeedback();

		submitUserResponse(userResponse);
		setShowFeedback(true);
		// setSelectedQuestion(updatedQuestion);
	};

	// Show loading indicator while book is being fetched
	if (!question || isLoading) {
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
				<Button title="Submit Response" onPress={handleUserSubmit} />
			</View>
		</>
	);

	const feedbackScreen =
		!feedback || !showFeedback ? (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		) : (
			<>
				<Text style={styles.feedbackText}>
					{feedback?.feedback_text}
				</Text>
				<FeedbackScore
					style={styles.feedbackGrade}
					status={FEEDBACK_GRADE_MAP[feedbackGrade]}
				/>
			</>
		);

	return (
		<View style={styles.container}>
			<Text style={styles.questionText}>{question?.question_text}</Text>

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
							{!!feedback && (
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
							)}
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
	questionText: {
		color: "#0e162d",
		fontSize: 22,
		fontWeight: 400,
		marginTop: 30,
		width: "80%",
		marginLeft: "10%",
		marginRight: "10%",
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
	feedbackText: {
		color: "#0e162d",
		backgroundColor: "#ffffff5a",
		fontSize: 18,
		fontWeight: 300,
		marginTop: 24,
		padding: 8,
		width: "80%",
	},
	feedbackGrade: {
		marginTop: 50,
		height: 20,
		width: 200,
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
