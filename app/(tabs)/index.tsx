import Book from "@/components/book";
import Modal from "@/components/modal";
import { useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function Index() {
	const [modalVisible, setModalVisible] = useState<boolean>(false);

	const getBookContainerStyle = () => {
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

	return (
		<>
			<Modal
				isVisible={modalVisible}
				onClose={() => setModalVisible(false)}
			>
				<Text>Lorem Ipsum</Text>
			</Modal>
			<View style={styles.container}>
				<View style={[styles.bookContainer, getBookContainerStyle()]}>
					<Book
						showContinueBtn
						onPress={() => setModalVisible(true)}
					/>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
		width: "100%",
		padding: 24,
		backgroundColor: "#f1e9d2",
		flex: 1,
		flexDirection: "row",
	},
	bookContainer: {},
	book: {},
	blogContainer: {
		height: "100%",
		width: "100%",
	},
	blogPost: {
		height: 300,
		marginBottom: 16,
		backgroundColor: "#a0a",
		padding: 10,
		justifyContent: "center",
	},
	text: {
		color: "#0e162d",
	},
});
