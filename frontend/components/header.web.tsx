import { useAuth } from "@/app/contexts/AuthContext";
import { useBooksCtx } from "@/app/contexts/BookContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Header() {
	const { logout, isAuthenticated } = useAuth();
	const { searchBooks } = useBooksCtx();
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearchFocus = () => {
		router.push("/search");
	};

	const handleSearchSubmit = async () => {
		if (searchQuery.trim()) {
			await searchBooks(searchQuery);
			router.push("/search");
		}
	};

	// Automatic search with 500ms debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchQuery.trim()) {
				searchBooks(searchQuery);
				router.push("/search");
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	return (
		<View style={styles.header}>
			<View style={styles.leftHeaderSection}>
				<Link href={"/"}>
					<Text style={styles.headerText}>BookSmart</Text>
				</Link>
			</View>
			<View style={styles.headerSearchBar}>
				<Ionicons
					name={"search-outline"}
					color={"#0e162d"}
					size={20}
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Search for books..."
					placeholderTextColor="#999"
					value={searchQuery}
					onChangeText={setSearchQuery}
					onFocus={handleSearchFocus}
					onSubmitEditing={handleSearchSubmit}
					returnKeyType="search"
				/>
			</View>
			<View style={styles.rightHeaderSection}>
				{isAuthenticated ? (
					<>
						<Link asChild href={`/profile`}>
							<Text style={styles.headerText}>Profile</Text>
						</Link>

						<Text style={styles.headerText} onPress={logout}>
							Log Out
						</Text>
					</>
				) : (
					<>
						<Link asChild href={`/(auth)/login`}>
							<Text style={styles.headerText}>Register</Text>
						</Link>

						<Link asChild href={`/(auth)/login`}>
							<Text style={styles.headerText}>Login</Text>
						</Link>
					</>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		// position: "absolute",
		// top: 0,
		width: "100%",
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
		maxWidth: 500,
		height: 40,
		backgroundColor: "#fafafa",
		borderColor: "#fafafa",
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 8,
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: "#0e162d",
		// outlineStyle: "none",
	},
	rightHeaderSection: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});
