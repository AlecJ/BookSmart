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

// const placeholderImage = require("@/assets/images/book-cover-placeholder.png");
const placeholderImage = require("@/assets/images/LettersToAYoungChef.jpg");

type Props = {
	imgSource?: ImageSourcePropType;
	showContinueBtn?: boolean;
	onPress: () => void;
};

export default function Book({ imgSource, showContinueBtn, onPress }: Props) {
	const [isHovered, setIsHovered] = useState<boolean>(false);

	return (
		<>
			<Pressable
				onPress={onPress}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
				style={styles.bookContainer}
			>
				<Image
					source={imgSource ? imgSource : placeholderImage}
					style={[
						styles.book,
						{
							opacity: isHovered ? 0.7 : 1,
						},
					]}
					transition={200}
				/>
				<View style={styles.progressBarContainer}>
					<ProgressBar />
				</View>
				{/* </Pressable> */}
				{showContinueBtn ? (
					<View style={styles.continueBtn}>
						<Text style={styles.continueBtnLabel}>Continue</Text>
						<Ionicons
							name={"arrow-forward-circle-outline"}
							color={"#0e162d"}
							size={20}
						/>
					</View>
				) : null}
			</Pressable>
		</>
	);
}

const styles = StyleSheet.create({
	bookContainer: {
		width: "100%",
		height: "100%",
	},
	book: {
		borderRadius: 18,
		overflow: "hidden",
		width: "100%",
		height: "100%",
	},
	progressBarContainer: {
		position: "relative",
		bottom: 15,
		zIndex: 50,
	},
	continueBtn: {
		width: 120,
		height: 55,
		backgroundColor: "#f4f4f4",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 5,
		position: "absolute",
		bottom: 30,
		right: 15,
	},
	continueBtnLabel: {
		fontSize: 16,
	},
});
