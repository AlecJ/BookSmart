import Book from "@/components/book";
import Modal from "@/components/modal";
import { BookType } from "@/types";
import { useState } from "react";
import {
	Dimensions,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

export default function Index() {
	const [modalVisible, setModalVisible] = useState<boolean>(false);

	const {
		width: screenWidth,
		height: screenHeight,
	}: { width: number; height: number } = Dimensions.get("window");
	const isWeb = Platform.OS === "web";

	const getBookContainerStyle: () => {
		width: number;
		height: number;
	} = () => {
		if (isWeb) {
			const bookHeight = screenHeight * 0.8;
			const bookWidth = bookHeight * (2 / 3);
			return { width: bookWidth, height: bookHeight };
		} else {
			const bookWidth = screenWidth * 0.9;
			const bookHeight = bookWidth * (3 / 2);
			return { width: bookWidth, height: bookHeight };
		}
	};

	const books: BookType[] = [
		{
			name: "Letters to a Young Chef",
			imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			progress: 0.75,
		},
		{ name: "Book 2" },
		{ name: "Book 3" },
		{ name: "Book 4" },
		{ name: "Book 5" },
		{ name: "Book 9" },
		{ name: "Book 6" },
		{ name: "Book 7" },
		{ name: "Book 8" },
		{ name: "Book 10" },
	];

	return (
		<>
			<Modal
				isVisible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<Text>Lorem Ipsum</Text>
			</Modal>

			{books.length === 0 ? (
				<Text>Search for books to read.</Text>
			) : (
				(() => {
					const content = (
						<>
							<View style={styles.container}>
								<View
									style={[
										styles.bookContainer,
										getBookContainerStyle(),
									]}
								>
									<Book
										book={books[0]}
										showContinueBtn
										onPress={() => setModalVisible(true)}
									/>
								</View>
							</View>
							<View style={styles.container}>
								<View style={styles.bookshelf}>
									{books.slice(1).map((book, index) => (
										<Book
											key={index}
											book={book}
											style={styles.smallBook}
											onPress={() =>
												setModalVisible(true)
											}
										/>
									))}
								</View>
							</View>
						</>
					);

					return isWeb ? (
						<View style={styles.columns}>{content}</View>
					) : (
						<ScrollView>{content}</ScrollView>
					);
				})()
			)}
		</>
	);
}

const styles = StyleSheet.create({
	columns: {
		height: "100%",
		width: "100%",
		flex: 1,
		flexDirection: "row",
	},
	container: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f1e9d2",
		flex: 1,
	},
	bookContainer: {},
	book: {},
	smallBook: { width: "33%", padding: 8 },
	bookshelf: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-start",
		padding: 15,
		width: "100%",
		flex: 1,
	},
	text: {
		color: "#0e162d",
	},
});
