import SearchResultsList from "@/components/searchResultsList";
import { StyleSheet, View } from "react-native";

export default function SearchScreen() {
	const mockResults = [
		{
			name: "Letters_to_a_Young_Chef",
			prettyName: "Letters to a Young Chef",
			author: "Daniel Boulud",
			description:
				"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
			imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			progress: 0.75,
			chapters: [],
		},
		{
			name: "Letters_to_a_Young_Chef",
			prettyName: "Letters to a Young Chef",
			author: "Daniel Boulud",
			description:
				"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
			imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			progress: 0.75,
			chapters: [],
		},
		{
			name: "Letters_to_a_Young_Chef",
			prettyName: "Letters to a Young Chef",
			author: "Daniel Boulud",
			description:
				"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
			imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
			progress: 0.75,
			chapters: [],
		},
	];

	return (
		<View style={styles.container}>
			<SearchResultsList results={mockResults} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: "#0e162d",
	},
});
