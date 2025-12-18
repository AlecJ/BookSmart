import ChapterBtn from "@/components/chapterBtn";
import { Link, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useBook } from "../../_layout";

export default function BookDetailsScreen() {
	const { chapterNum } = useLocalSearchParams();
	const { book, getChapter } = useBook();
	const questions = getChapter(Number(chapterNum))?.questions || [];

	const isWeb = Platform.OS === "web";

	// const questions = [
	// 	{ id: 1, text: "Question 1", status: "complete" },
	// 	{ id: 2, text: "Question 2", status: "failed" },
	// 	{ id: 3, text: "Question 3", status: "partial_complete" },
	// 	{ id: 4, text: "Question 4", status: "incomplete" },
	// ];

	const questionList = questions.map((question) => (
		<Link
			key={question.id}
			asChild
			href={isWeb ? `./${chapterNum}/question/${question.id}` : `..`}
		>
			<ChapterBtn
				style={styles.questionBtn}
				title={question.text}
				status={question.status}
			/>
		</Link>
	));

	const content = (
		<>
			<Link href={`/read/${book.name}`}>
				<Text style={[styles.text, styles.bookTitle]}>
					{book.prettyName}
				</Text>
			</Link>
			<Text style={[styles.text, styles.chapterTitle]}>
				Chapter {chapterNum}
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
	},
	questionBtn: {
		width: "90%",
		maxWidth: 600,
		height: 70,
	},
});
