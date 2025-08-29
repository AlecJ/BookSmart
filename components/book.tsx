import ProgressBar from "@/components/progressBar";
import { BookType } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

const placeholderImage = require("@/assets/images/book-cover-placeholder.png");

type Props = {
	showContinueBtn?: boolean;
	showProgressBar?: boolean;
	onPress?: () => void;
	style?: ViewStyle;
	book: BookType;
};

export default function Book({
	showContinueBtn,
	onPress,
	style,
	book,
	showProgressBar,
}: Props) {
	const [isHovered, setIsHovered] = useState<boolean>(false);

	return (
		<>
			<Pressable
				onPress={onPress}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
				style={style}
			>
				<Image
					source={book.imgSrc ? book.imgSrc : placeholderImage}
					style={[
						style,
						styles.book,
						{
							opacity: isHovered ? 0.7 : 1,
						},
					]}
					transition={200}
				/>
				{showProgressBar && book.progress ? (
					<View style={styles.progressBarContainer}>
						<ProgressBar fillPercent={book.progress} />
					</View>
				) : null}
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
	book: {
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
		height: 50,
		backgroundColor: "#f4f4f4",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 5,
		position: "absolute",
		bottom: 45,
		right: 30,
	},
	continueBtnLabel: {
		fontSize: 16,
	},
});
