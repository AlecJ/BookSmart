import BookRow from "@/components/bookRow";
import { BookType } from "@/types";
import {
	FlatList,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

const books: BookType[] = [
	{
		name: "Letters_to_a_Young_Chef",
		prettyName: "Letters to a Young Chef",
		imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
		progress: 0.75,
		author: "Daniel Boulud",
	},
	{ name: "Book 2" },
	{ name: "Book 3" },
	{ name: "Book 4" },
	{ name: "Book 5" },
	{ name: "Book 6" },
	{ name: "Book 7" },
	{ name: "Book 8" },
	{ name: "Book 9" },
	{ name: "Book 10" },
	{ name: "Book 11" },
	{ name: "Book 12" },
];

export default function ProfileScreen() {
	const isWeb = Platform.OS === "web";

	return (() => {
		const content = (
			<>
				<View style={styles.profileColumn}>
					<View style={styles.profileContainer}>
						<Text style={styles.profileContainerHeader}>
							Your Profile
						</Text>
						<View style={styles.profileImage}></View>
						<View style={styles.userDetails}>
							<View style={styles.userDetailsRow}>
								<Text>Name:</Text>
								<TextInput
									style={styles.textInput}
									placeholder="Name"
								/>
							</View>
						</View>
						<View style={styles.profileControls}></View>
					</View>
				</View>
				<View style={styles.historyColumn}>
					<Text style={styles.historyHeader}>Reading History</Text>
					<FlatList
						style={{ flex: 1, minHeight: 0 }}
						data={books}
						renderItem={({ item }) => <BookRow book={item} />}
						keyExtractor={(item, index) => index.toString()}
						showsVerticalScrollIndicator
						contentContainerStyle={{ paddingBottom: 16 }}
					/>
				</View>
			</>
		);

		return isWeb ? (
			<View style={styles.profilePage}>{content}</View>
		) : (
			<ScrollView>{content}</ScrollView>
		);
	})();
}

const styles = StyleSheet.create({
	profilePage: {
		flex: 1,
		flexDirection: "row",
		height: "100%",
		borderWidth: 2,
		borderColor: "red",
	},
	profileColumn: {
		flex: 1,
		maxHeight: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	profileContainer: {
		flex: 1,
		width: "100%",
		maxHeight: 500,
		alignItems: "center",
		justifyContent: "flex-start",
	},
	profileContainerHeader: {
		fontSize: 20,
		marginBottom: 16,
	},
	profileImage: {
		width: 160,
		height: 160,
		backgroundColor: "#ccc",
		marginBottom: 16,
		borderRadius: 80,
	},
	userDetails: {},
	userDetailsRow: { flex: 1, flexDirection: "row", alignItems: "center" },
	textInput: {
		paddingLeft: 5,
		marginLeft: 5,
		backgroundColor: "#fff",
		height: 30,
	},
	historyColumn: {
		height: 2000,
		// flex: 1,
		// flexDirection: "column",
		// overflowY: "auto",
		// minHeight: 0,
	},
	historyHeader: { fontSize: 20, marginTop: 20, marginBottom: 20 },
});
