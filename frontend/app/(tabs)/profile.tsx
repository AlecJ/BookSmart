import ProfileBookRow from "@/components/bookRowProfile";
import { Link } from "expo-router";
import { useEffect } from "react";
import {
	ActivityIndicator,
	NativeScrollEvent,
	NativeSyntheticEvent,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useBooksCtx } from "../contexts/BookContext";

export default function ProfileScreen() {
	const { books, getUserBooks, loadMoreBooks, isLoadingMoreBooks } =
		useBooksCtx();

	useEffect(() => {
		getUserBooks();
	}, [getUserBooks]);

	const handleScroll = ({
		nativeEvent,
	}: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
		if (
			layoutMeasurement.height + contentOffset.y >=
			contentSize.height - 200
		) {
			loadMoreBooks();
		}
	};

	return (
		<ScrollView onScroll={handleScroll} scrollEventThrottle={400}>
			<View style={styles.profilePage}>
				<View style={styles.profileColumn}>
					<View style={styles.profileContainer}>
						<Text style={styles.columnHeader}>Your Profile</Text>
						<View style={styles.profileImage} />
						<View style={styles.userDetails}>
							<View style={styles.userDetailsRow}>
								<Text>Name:</Text>
								<TextInput
									style={styles.textInput}
									placeholder="Name"
								/>
							</View>
						</View>
					</View>
				</View>
				<View style={styles.historyColumn}>
					<Text style={styles.columnHeader}>Reading History</Text>
					{books.map((item, index) => (
						<Link key={index} href={`/read/${item.id}`}>
							<ProfileBookRow book={item} />
						</Link>
					))}
					{isLoadingMoreBooks && (
						<ActivityIndicator size="large" style={{ padding: 24 }} />
					)}
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	profilePage: {
		flexDirection: "row",
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
		alignSelf: "flex-start",
		maxWidth: 550,
	},
});
