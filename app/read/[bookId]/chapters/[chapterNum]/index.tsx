import { useBook } from "@/app/read/[bookId]/_layout";
import ChapterBtn from "@/components/chapterBtn";
import { Link, useLocalSearchParams } from "expo-router";
import {
	ActivityIndicator,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function BookDetailsScreen() {
	const { chapterNum } = useLocalSearchParams();
	const { book, getChapter } = useBook();
	const questions = getChapter(Number(chapterNum))?.questions || [];

	// Show loading indicator while book is being fetched
	if (!book) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	const isWeb = Platform.OS === "web";

	const questionList = questions.map((question) => (
		<Link
			key={question.id}
			asChild
			href={`./${chapterNum}/question/${question.id}`}
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
		marginBottom: 20,
	},
	questionBtn: {
		width: "90%",
		maxWidth: 600,
		minHeight: 70,
	},
});
