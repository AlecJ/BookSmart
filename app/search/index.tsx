import SearchResultsList from "@/components/searchResultsList";
import { StyleSheet, View } from "react-native";
import { useBooksCtx } from "../contexts/BookContext";

export default function SearchScreen() {
	const { searchBookResults } = useBooksCtx();

	return (
		<View style={styles.container}>
			<SearchResultsList results={searchBookResults} />
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
