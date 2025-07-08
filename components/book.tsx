import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { ImageSourcePropType, Pressable, StyleSheet, Text } from "react-native";

type Props = {
	imgSource: ImageSourcePropType;
	enableNavBtn?: boolean;
};

export default function Book({ imgSource, enableNavBtn }: Props) {
	return (
		<>
			<Image source={imgSource} style={styles.book} />
			{enableNavBtn ? (
				<Pressable
					style={styles.button}
					onPress={() => {
						alert("Enter book.");
					}}
				>
					<Text style={styles.buttonLabel}>View Book</Text>
					<Ionicons
						name={"arrow-forward-circle-outline"}
						color={"#0e162d"}
						size={20}
					/>
				</Pressable>
			) : null}
		</>
	);
}

const styles = StyleSheet.create({
	book: {
		width: 200,
		height: 300,
		borderRadius: 18,
	},
	button: {
		width: 120,
		height: 35,
		backgroundColor: "#f4f4f4",
		position: "relative",
		left: 30,
		bottom: 45,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 5,
	},
	buttonLabel: {
		fontSize: 16,
	},
});
