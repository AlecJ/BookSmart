import Book from "@/components/book";
import ChapterBtn from "@/components/chapterBtn";
import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetailsScreen() {
	const { bookId } = useLocalSearchParams();

	const book = {
		name: "Letters_to_a_Young_Chef",
		imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
		progress: 0.75,
	};

	const chapters = [
		{ id: 1, title: "Chapter 1", completed: true },
		{ id: 2, title: "Chapter 2", completed: true },
		{ id: 3, title: "Chapter 3", completed: false },
	];

	const chapterList = chapters.map((chapter) => (
		<Link
			key={chapter.id}
			asChild
			href={`/read/${bookId}/chapters/${chapter.id}`}
		>
			<ChapterBtn title={chapter.title} />
		</Link>
	));

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Book style={styles.bookCover} book={book} disableInteract />
				<View style={styles.bookInfo}>
					<Text style={styles.text}>Book Details Screen</Text>
					<Text style={styles.text}>Book Title: {bookId}</Text>
					<Text style={styles.text}>Author</Text>
					<Text style={styles.text}>Description</Text>
				</View>
			</View>
			<View style={styles.chapterList}>{chapterList}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		width: "100%",
		height: 200,
		borderWidth: 2,
		borderColor: "red",
		flexDirection: "row",
	},
	bookCover: {
		flex: 1,
	},
	bookInfo: {
		flex: 1,
	},
	chapterList: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 10,
		padding: 10,
	},
	text: {
		color: "#0e162d",
	},
});
