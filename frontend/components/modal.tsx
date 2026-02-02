import { ReactNode } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

type Props = {
	children: ReactNode;
	isVisible: boolean;
	onClose: () => void;
};

export default function Modal({ children, isVisible, onClose }: Props) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions();

	if (!isVisible) {
		return null;
	}

	return (
		<>
			<View style={styles.container}>
				<View
					style={[
						styles.modal,
						{
							width: screenWidth * 0.6,
							height: screenHeight * 0.6,
							minWidth: 300,
						},
					]}
				>
					{children}
				</View>

				<Pressable style={styles.backdrop} onPress={onClose} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1001,
		borderRadius: 10,
		backgroundColor: "#fff",
	},
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		zIndex: 999,
	},
});
