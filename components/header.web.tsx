import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

// import { SearchBar } from "react-native-elements";

export default function Header() {
	return (
		<View style={styles.header}>
			<View style={styles.leftHeaderSection}>
				<Link href={"/"}>
					<Text style={styles.headerText}>BookSmart</Text>
				</Link>
			</View>
			<View style={styles.headerSearchBar}></View>
			<View style={styles.rightHeaderSection}>
				<Link asChild href={`/profile`}>
					<Text style={styles.headerText}>Profile</Text>
				</Link>

				<Text style={styles.headerText}>Settings</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 60,
		paddingLeft: 8,
		paddingRight: 8,
		backgroundColor: "#e6d7ae",
		alignItems: "center",
		flexDirection: "row",
	},
	leftHeaderSection: {
		flex: 1,
		alignItems: "flex-start",
	},
	headerText: {
		fontSize: 20,
		margin: 8,
	},
	headerSearchBar: {
		width: 400,
		height: 40,
		backgroundColor: "#fafafa",
		borderColor: "#fafafa",
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 8,
	},
	rightHeaderSection: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});
