import ProfileBookRow from "@/components/bookRowProfile";
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
						<Text style={styles.columnHeader}>Your Profile</Text>
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
						<View></View>
					</View>
				</View>
				<View style={styles.historyColumn}>
					<Text style={styles.columnHeader}>Reading History</Text>
					<FlatList
						style={{ flex: 1, minHeight: 0 }}
						data={books}
						renderItem={({ item }) => (
							<ProfileBookRow book={item} />
						)}
						keyExtractor={(item, index) => index.toString()}
						showsVerticalScrollIndicator
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
		borderWidth: 2,
		borderColor: "red",
	},
	columnHeader: {
		fontSize: 20,
		marginTop: 20,
		marginBottom: 16,
		textAlign: "center",
	},
	profileColumn: {
		flex: 2,
		maxHeight: 600,
		borderWidth: 2,
		borderColor: "blue",
	},
	profileContainer: {
		flex: 1,
		maxHeight: 600,
		alignItems: "center",
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
		flex: 3,
		alignSelf: "flex-end",
		maxWidth: 550,
	},
});
