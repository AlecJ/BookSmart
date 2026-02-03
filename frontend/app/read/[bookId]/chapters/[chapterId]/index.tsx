import { useBooksCtx } from "@/app/contexts/BookContext";
import ChapterBtn from "@/components/chapterBtn";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
	ActivityIndicator,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function BookDetailsScreen() {
	const { chapterId } = useLocalSearchParams();
	const {
		selectedBook: book,
		selectedChapter: chapter,
		getChapter,
		getOrGenerateChapterQuestions,
		setSelectedChapter,
		setSelectedQuestion,
	} = useBooksCtx();
	const questions = chapter?.questions || [];
	const hasFetchedRef = useRef<string | null>(null);

	// Fetch chapter if not already set (page reload)
	useEffect(() => {
		if (!chapter && chapterId) {
			const chapterToSet = getChapter(chapterId as string);
			if (chapterToSet) {
				setSelectedChapter(chapterToSet);
			}
		}
	}, [chapter, chapterId, getChapter, setSelectedChapter]);

	// Fetch questions for chapter
	useEffect(() => {
		if (
			chapter &&
			chapterId &&
			(!chapter.questions || chapter.questions.length === 0) &&
			hasFetchedRef.current !== chapterId
		) {
			hasFetchedRef.current = chapterId as string;
			getOrGenerateChapterQuestions(chapterId as string);
		}
	}, [chapter, chapterId, getOrGenerateChapterQuestions]);

	// Show loading indicator while book is being fetched
	if (!book || !chapter || !chapter.questions) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	const handleQuestionBtn = (question: any) => {
		setSelectedQuestion(question);
		router.push(`./${chapterId}/question/${question.id}`);
	};

	const isWeb = Platform.OS === "web";

	const questionList = questions.map((question) => (
		<ChapterBtn
			key={question.id}
			onPress={() => handleQuestionBtn(question)}
			style={styles.questionBtn}
			title={question.question_text}
			status={question.status}
		/>
	));

	const content = (
		<>
			<Link href={`/read/${book.title}`}>
				<Text style={[styles.text, styles.bookTitle]}>
					{book.title}
				</Text>
			</Link>
			<Text style={[styles.text, styles.chapterTitle]}>
				{chapter?.title}
			</Text>
			<View style={styles.questionList}>{questionList}</View>
		</>
	);

	return isWeb ? (
		<View style={styles.container}>{content}</View>
	) : (
		<ScrollView
			style={styles.scrollView}
			contentContainerStyle={styles.container}
		>
			{content}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		width: "100%",
		backgroundColor: "#f1e9d2",
	},
	container: {
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
	},
	text: {
		color: "#0e162d",
	},
	bookTitle: {
		alignSelf: "center",
		fontSize: 30,
		fontWeight: 400,
	},
	chapterTitle: {
		alignSelf: "center",
		fontSize: 22,
		fontWeight: 400,
		marginTop: 30,
	},
	questionList: {
		width: "100%",
		alignItems: "center",
		marginTop: 20,
		gap: 10,
		marginBottom: 20,
	},
	questionBtn: {
		width: "90%",
		maxWidth: 600,
		minHeight: 70,
	},
});
