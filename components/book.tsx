import ProgressBar from "@/components/progressBar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import {
	ImageSourcePropType,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type Props = {
	imgSource: ImageSourcePropType;
	enableNavBtn?: boolean;
	width?: number;
	height?: number;
};

export default function Book({
	imgSource,
	enableNavBtn,
	width,
	height,
}: Props) {
	const [isHovered, setIsHovered] = useState(false);
	const calcWidth = width ? width : 200;
	const calcHeight = height ? height : 300;

	return (
		<>
			<Pressable
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
				onPress={() => {
					alert("Enter book.");
				}}
				style={[
					styles.book,
					{
						width: calcWidth,
						height: calcHeight,
					},
				]}
			>
				<Image
					source={imgSource}
					style={[
						styles.book,
						{
							width: calcWidth,
							height: calcHeight,
							opacity: isHovered ? 0.7 : 1,
						},
					]}
					transition={200}
				/>
				<View style={styles.progressBarContainer}>
					<ProgressBar />
				</View>
			</Pressable>
			{enableNavBtn ? (
				<Pressable style={styles.button}>
					<Text style={styles.buttonLabel}>Continue</Text>
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
		borderRadius: 18,
		overflow: "hidden",
	},
	progressBarContainer: {
		position: "relative",
		bottom: 15,
		zIndex: 50,
	},
	button: {
		width: 120,
		height: 40,
		backgroundColor: "#f4f4f4",
		position: "relative",
		bottom: 65,
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
