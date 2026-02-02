import BookRow from "@/components/bookRow";
import { BookType } from "@/types";
import { FlatList, StyleSheet, View } from "react-native";

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
	return (
		<View style={styles.profilePage}>
			<FlatList
				style={{ flex: 1, minHeight: 0 }}
				data={books}
				renderItem={({ item }) => <BookRow book={item} />}
				keyExtractor={(item, index) => index.toString()}
				showsVerticalScrollIndicator
				contentContainerStyle={{ paddingBottom: 16 }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	profilePage: {
		flex: 1,
		height: "100%",
		minHeight: 0,
		borderWidth: 2,
		borderColor: "red",
		// overflowY: "auto",
	},
});
