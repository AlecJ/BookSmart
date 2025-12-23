import { BookType } from "@/types";
import { Pressable, StyleSheet, View } from "react-native";

import BookRowSearch from "@/components/bookRowSearch";

type Props = { results: BookType[] };

export default function SearchResultsList({ results }: Props) {
	const resultsList = results.map((result, index) => {
		return (
			<Pressable key={index} href={`./search/${result.name}`}>
				<BookRowSearch
					key={index}
					book={result}
					style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
				/>
			</Pressable>
		);
	});

	return <View style={styles.container}>{resultsList}</View>;
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		marginTop: 20,
		alignItems: "center",
		gap: 2,
	},
	evenRow: {
		backgroundColor: "rgba(236, 211, 168, 1)",
	},
	oddRow: {
		backgroundColor: "rgba(245, 233, 201, 1)",
	},
});
