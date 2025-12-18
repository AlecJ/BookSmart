import ProgressBar from "@/components/progressBar";
import { BookType } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

const placeholderImage = require("@/assets/images/book-cover-placeholder.png");

type Props = {
	showContinueBtn?: boolean;
	showProgressBar?: boolean;
	showGradient?: boolean;
	onPress?: () => void;
	style?: ViewStyle;
	book: BookType;
	disableInteract?: boolean;
};

export default function Book({
	showContinueBtn,
	onPress,
	style,
	book,
	showProgressBar,
	showGradient,
	disableInteract,
}: Props) {
	const [isHovered, setIsHovered] = useState<boolean>(false);

	const content = (
		<>
			<View style={[styles.imageContainer]}>
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

				{showGradient && (
					<>
						<LinearGradient
							colors={[
								"#f1e9d2",
								"rgba(241, 233, 210, 0.5)",
								"rgba(241, 233, 210, 0.2)",
								"transparent",
							]}
							locations={[0, 0.3, 0.6, 1]}
							style={styles.fadeTop}
							pointerEvents="none"
						/>

						<LinearGradient
							colors={[
								"transparent",
								"rgba(241, 233, 210, 0.2)",
								"rgba(241, 233, 210, 0.5)",
								"#f1e9d2",
							]}
							locations={[0, 0.4, 0.7, 1]}
							style={styles.fadeBottom}
							pointerEvents="none"
						/>
					</>
				)}
			</View>

			{showProgressBar && book.progress ? (
				<View style={styles.progressBarContainer}>
					<ProgressBar fillPercent={book.progress} />
				</View>
			) : null}

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
		</>
	);

	if (disableInteract) {
		return <View style={style}>{content}</View>;
	}

	return (
		<Pressable
			onPress={onPress}
			onHoverIn={() => setIsHovered(true)}
			onHoverOut={() => setIsHovered(false)}
			style={style}
		>
			{content}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	imageContainer: {
		width: "100%",
		height: "100%",
		position: "relative",
	},
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
	fadeTop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 60,
	},
	fadeBottom: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 60,
	},
});
