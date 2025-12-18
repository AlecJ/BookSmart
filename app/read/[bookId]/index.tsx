import Book from "@/components/book";
import ChapterBtn from "@/components/chapterBtn";
import { Link, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();

	const isWeb = Platform.OS === "web";

	const book = {
		name: "Letters_to_a_Young_Chef",
		prettyName: "Letters to a Young Chef",
		author: "Daniel Boulud",
		description:
			"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
		imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
		progress: 0.75,
	};

	const chapters = [
		{ id: 1, title: "Chapter 1", status: "complete" },
		{ id: 2, title: "Chapter 2", status: "failed" },
		{ id: 3, title: "Chapter 3", status: "partial_complete" },
		{ id: 4, title: "Chapter 4", status: "partial_complete" },
		{ id: 5, title: "Chapter 5", status: "incomplete" },
	];

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
	container: {
		width: "100%",
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		width: "100%",
		marginTop: 20,
		// height: 300,
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
