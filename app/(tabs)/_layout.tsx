import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs screenOptions={tabsScreenOptions}>
			<Tabs.Screen
				name="index"
				options={{
					title: "BookSmart",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "home-sharp" : "home-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "search-sharp" : "search-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={
								focused
									? "person-circle-sharp"
									: "person-circle-outline"
							}
							color={color}
							size={24}
						/>
					),
				}}
			/>
		</Tabs>
	);
}

const tabsScreenOptions = {
	tabBarActiveTintColor: "#4d6dc8",
	tabBarInactiveTintColor: "#0e162d",
	headerStyle: { backgroundColor: "#e6d7ae" },
	headerShadowVisible: false,
	headerTintColor: "#0e162d",
	tabBarStyle: {
		backgroundColor: "#e6d7ae",
	},
};
