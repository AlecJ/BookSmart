import Header from "@/components/header";
import { Stack } from "expo-router";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

export default function RootLayout() {
	if (Platform.OS === "web") {
		return (
			<View style={styles.container}>
				<Header />
				<ScrollView
					style={styles.scrollContainer}
					contentContainerStyle={{ alignItems: "center" }}
				>
					<View style={styles.content}>
						<Stack
							initialRouteName="(tabs)"
							screenOptions={{ headerShown: false }}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}

	return (
		<Stack>
			<Stack.Screen
				name="(tabs)"
				options={{ headerShown: false, title: "Home" }}
			/>
		</Stack>
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
