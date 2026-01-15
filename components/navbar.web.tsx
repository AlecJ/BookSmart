import { useBooksCtx } from "@/app/contexts/BookContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useGlobalSearchParams, useSegments } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NavBar() {
	const segments = useSegments();
	const params = useGlobalSearchParams(); // { bookId: '123', chapterNum: '5' }
	const { selectedBook: book } = useBooksCtx();

	const links = segments.filter((segment) => {
		return (
			segment === "[bookId]" ||
			segment === "[chapterNum]" ||
			segment === "[questionNum]"
		);
	});

	console.log(book);

	const linkObjects = links.map((segment, i) => {
		if (segment === "[bookId]") {
			return {
				label: book?.title || params.bookId,
				href: `/read/${params.bookId}`,
			};
		} else if (segment === "[chapterNum]") {
			return {
				label: `Chapter ${params.chapterNum}`,
				href: `/read/${params.bookId}/chapters/${params.chapterNum}`,
			};
		} else if (segment === "[questionNum]") {
			return {
				label: `Question ${params.questionNum}`,
				href: `/read/${params.bookId}/chapters/${params.chapterNum}/question/${params.questionNum}`,
			};
		}
	});

	const navbarLinks = linkObjects.map((link, i) => {
		const isLast = i === linkObjects.length - 1;

		return (
			<View key={i} style={styles.breadcrumbItem}>
				{isLast ? (
					<Text>{link.label}</Text>
				) : (
					<>
						<Link href={link.href}>
							<Text style={styles.link}>{link.label}</Text>
						</Link>
						<Text style={styles.separator}> / </Text>
					</>
				)}
			</View>
		);
	});

	return (
		<View>
			<View style={styles.container}>
				<View style={styles.breadcrumbItem}>
					<Link href="/">
						<Ionicons
							// style={styles.chapterBtnIcon}
							name={"home-sharp"}
							size={20}
							color={"#403aeeff"}
						/>
					</Link>
					<Text style={styles.separator}> / </Text>
				</View>
				{navbarLinks}
			</View>
			<LinearGradient
				colors={["transparent", "#403aeeff", "transparent"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				locations={[0, 0.5, 1]}
				style={styles.underline}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 50,
		// backgroundColor: "#fff",
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
	},
	breadcrumbItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	link: {
		color: "#403aeeff",
		textDecorationLine: "underline",
	},
	separator: {
		color: "#666",
		marginHorizontal: 8,
	},
	underline: {
		height: 1,
		width: "100%",
	},
});
