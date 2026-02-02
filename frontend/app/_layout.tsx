import Header from "@/components/header";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import {
	ActivityIndicator,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BookProvider } from "./contexts/BookContext";

function RootLayoutNav() {
	const { isAuthenticated, isLoading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";

		const inPublicGroup = segments[0] === "search";

		if (!isAuthenticated && !inAuthGroup && !inPublicGroup) {
			// Redirect to login if not authenticated
			router.replace("/(auth)/login");
		} else if (isAuthenticated && inAuthGroup) {
			// Redirect to tabs if authenticated and on login page
			router.replace("/(tabs)");
		}
	}, [isAuthenticated, isLoading, segments]);

	if (isLoading) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<ActivityIndicator size="large" color="#4A90E2" />
			</View>
		);
	}

	if (Platform.OS === "web") {
		return (
			<View style={styles.container}>
				<Header />
				<ScrollView
					style={styles.scrollContainer}
					contentContainerStyle={{ alignItems: "center" }}
				>
					<View style={styles.content}>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(auth)/login" />
							<Stack.Screen name="(tabs)" />
						</Stack>
					</View>
				</ScrollView>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)/login" />
			<Stack.Screen name="(tabs)" options={{ title: "Home" }} />
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<BookProvider>
				<RootLayoutNav />
			</BookProvider>
		</AuthProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	scrollContainer: {
		flex: 1,
		width: "100%",
		backgroundColor: "#f1e9d2",
	},
	content: {
		flex: 1,
		maxWidth: 970,
		width: "100%",
	},
});
