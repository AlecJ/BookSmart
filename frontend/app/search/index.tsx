import SearchResultsList from "@/components/searchResultsList";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useBooksCtx } from "../contexts/BookContext";

export default function SearchScreen() {
	const { searchBookResults, isSearching } = useBooksCtx();

	if (isSearching) {
		return (
			<View style={[styles.container, { flex: 1, marginTop: 50 }]}>
				<ActivityIndicator size="large" color="#0e162d" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{searchBookResults.length === 0 ? (
				<Text style={styles.noResultsText}>
					No search results found.
				</Text>
			) : (
				<SearchResultsList results={searchBookResults} />
			)}
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
	noResultsText: {
		color: "#0e162d",
		fontSize: 18,
		marginTop: 20,
	},
});
