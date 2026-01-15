import { useBooksCtx } from "@/app/contexts/BookContext";
import ChapterBtn from "@/components/chapterBtn";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
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
		setSelectedChapter,
		setSelectedQuestion,
	} = useBooksCtx();
	const questions = chapter?.questions || [];
	console.log(chapter);

	useEffect(() => {
		if (!chapter) {
			const chapterToSet = getChapter(chapterId as string);
			setSelectedChapter(chapterToSet);
		}
	}, [chapter, chapterId, getChapter, setSelectedChapter]);

	// Show loading indicator while book is being fetched
	if (!book) {
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
		<Pressable
			key={question.id}
			onPress={() => handleQuestionBtn(question)}
		>
			<ChapterBtn
				style={styles.questionBtn}
				title={question.text}
				status={question.status}
			/>
		</Pressable>
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
