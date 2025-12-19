import Ionicons from "@expo/vector-icons/Ionicons";
import { Slot, Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
	const questionHasFeedback = true;

	if (Platform.OS === "web") {
		return (
			<View>
				<Slot />
			</View>
		);
	}

	return (
		<Tabs screenOptions={tabsScreenOptions}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Question",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "help-sharp" : "help-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			{questionHasFeedback ? (
				<Tabs.Screen
					name="feedback"
					options={{
						title: "Feedback",
						tabBarIcon: ({ color, focused }) => (
							<Ionicons
								name={
									focused
										? "document-text-sharp"
										: "document-text-outline"
								}
								color={color}
								size={24}
							/>
						),
					}}
				/>
			) : (
				<Tabs.Screen
					name="feedback"
					options={{
						title: "Feedback",
						tabBarIcon: ({ color, focused }) => (
							<Ionicons
								name={
									focused
										? "document-text-sharp"
										: "document-text-outline"
								}
								color={color}
								size={24}
							/>
						),
					}}
					listeners={{
						tabPress: (e) => {
							e.preventDefault();
						},
					}}
				/>
			)}
		</Tabs>
	);
}

const tabsScreenOptions = {
	headerShown: false,
	tabBarActiveTintColor: "#4d6dc8",
	tabBarInactiveTintColor: "#0e162d",
	tabBarStyle: {
		backgroundColor: "#e6d7ae",
	},
};

const styles = StyleSheet.create({
	page: {
		backgroundColor: "#f1e9d2",
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		overflowY: "scroll",
	},
	content: {
		flex: 1,
		width: "100%",
		maxWidth: 970,
	},
});
