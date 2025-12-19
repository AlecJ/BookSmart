import Book from "@/components/book";
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
import { useBook } from "./_layout";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();
	const { book } = useBook();
	const chapters = book?.chapters || [];

	const isWeb = Platform.OS === "web";

	// Show loading indicator while book is being fetched
	if (!book) {
		return (
			<View style={[styles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	const chapterList = chapters.map((chapter) => (
		<Link
			key={chapter.id}
			asChild
			href={`/read/${bookId}/chapters/${chapter.id}`}
		>
			<ChapterBtn
				style={isWeb ? styles.chapterBtnWeb : styles.chapterBtn}
				title={chapter.title}
				status={chapter.status}
			/>
		</Link>
	));

	const content = (
		<>
			<View style={styles.header}>
				{isWeb && (
					<Book
						style={styles.bookCover}
						book={book}
						disableInteract
						showGradient
					/>
				)}
				<View style={styles.bookInfo}>
					<Text style={[styles.text, styles.bookTitle]}>
						{book.prettyName}
					</Text>
					<Text style={[styles.text, styles.authorText]}>
						{book.author}
					</Text>
					<Text
						style={[styles.text, styles.descriptionText]}
						numberOfLines={10}
						ellipsizeMode="head"
					>
						{book.description}
					</Text>
				</View>
			</View>
			<Text style={[styles.text, styles.chapterHeading]}>Chapters</Text>
			<View style={styles.chapterList}>{chapterList}</View>
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
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		width: "100%",
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		width: "100%",
		marginTop: 20,
		flexDirection: "row",
	},
	bookCover: {
		flex: 1,
		width: "20%",
		height: 300,
	},
	bookInfo: {
		flex: 1,
		padding: 10,
		justifyContent: "center",
		maxHeight: 300,
	},
	chapterList: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-start",
		gap: 10,
		padding: 10,
	},
	chapterBtn: {
		width: "100%",
		height: 75,
		padding: 0,
		margin: 0,
	},
	chapterBtnWeb: {
		width: "49%",
		height: 75,
		padding: 0,
		margin: 0,
	},
	text: {
		color: "#0e162d",
	},
	bookTitle: {
		alignSelf: "center",
		fontSize: 30,
		fontWeight: 400,
		marginTop: 10,
	},
	authorText: {
		alignSelf: "center",
		fontSize: 20,
		fontWeight: 300,
		marginTop: 10,
	},
	descriptionText: {
		fontSize: 18,
		fontWeight: 300,
		marginTop: 10,
		textIndent: "30px",
		textAlign: "center",
	},
	chapterHeading: {
		fontSize: 24,
		fontWeight: 200,
		marginTop: 30,
	},
});
