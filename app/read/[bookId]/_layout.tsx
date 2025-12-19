import NavBar from "@/components/navbar";
import { Slot, useLocalSearchParams } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

type Book = {
	name: string;
	prettyName: string;
	author: string;
	description: string;
	imgSrc: any;
	progress: number;
	chapters?: Chapter[];
};

type Chapter = {
	id: number;
	title: string;
	status: string;
	questions?: Question[];
};

type Question = {
	id: number;
	text: string;
	status: string;
};

type BookContextType = {
	book: Book | null;
	getChapter: (chapterNum: number) => Chapter | undefined;
	getQuestion: (
		chapterNum: number,
		questionNum: number
	) => Question | undefined;
};

const BookContext = createContext<BookContextType | undefined>(undefined);

export function useBook() {
	const context = useContext(BookContext);
	if (!context) {
		throw new Error("useBook must be used within BookProvider");
	}
	return context;
}

export default function BookLayout() {
	const { bookId } = useLocalSearchParams();
	const [book, setBook] = useState<Book | null>(null);

	useEffect(() => {
		// Fetch your book data here
		// For now, using mock data
		const fetchBook = async () => {
			const bookData = {
				name: "Letters_to_a_Young_Chef",
				prettyName: "Letters to a Young Chef",
				author: "Daniel Boulud",
				description:
					"A heartfelt collection of letters from renowned chef Daniel Boulud to aspiring chefs, offering wisdom, inspiration, and insights into the culinary world.",
				imgSrc: require("@/assets/images/LettersToAYoungChef.jpg"),
				progress: 0.75,
				chapters: [
					{
						id: 1,
						title: "Chapter 1",
						status: "complete",
						questions: [
							{
								id: 1,
								text: "How does Boulud describe the role of discipline and routine in his early culinary training, and why does he see them as foundational rather than restrictive?",
								status: "complete",
								response: "Yes!",
							},
							{
								id: 2,
								text: "What influence did mentors and the kitchen hierarchy have on shaping Boulud’s values as a young chef, and what does this suggest about how culinary knowledge is passed down?",
								status: "complete",
							},
							{
								id: 3,
								text: "How does Boulud frame the relationship between humility and ambition, and why does he argue that both are necessary for long-term success in the kitchen?",
								status: "complete",
							},
						],
					},
					{
						id: 2,
						title: "Chapter 2",
						status: "failed",
						questions: [
							{ id: 1, text: "Question 1", status: "failed" },
							{ id: 2, text: "Question 2", status: "failed" },
							{ id: 3, text: "Question 3", status: "failed" },
						],
					},
					{
						id: 3,
						title: "Chapter 3",
						status: "partial_complete",
						questions: [
							{ id: 1, text: "Question 1", status: "complete" },
							{ id: 2, text: "Question 2", status: "failed" },
							{ id: 3, text: "Question 3", status: "complete" },
						],
					},
					{
						id: 4,
						title: "Chapter 4",
						status: "incomplete",
						questions: [
							{ id: 1, text: "Question 1", status: "complete" },
							{ id: 2, text: "Question 2", status: "failed" },
							{ id: 3, text: "Question 3", status: "incomplete" },
						],
					},
					{
						id: 5,
						title: "Chapter 5",
						status: "incomplete",
						questions: [
							{ id: 1, text: "Question 1", status: "incomplete" },
							{ id: 2, text: "Question 2", status: "incomplete" },
							{ id: 3, text: "Question 3", status: "incomplete" },
						],
					},
				],
			};
			setBook(bookData);
		};

		fetchBook();
	}, [bookId]);

	const getChapter = (chapterNum: number) => {
		return book?.chapters?.find((ch) => ch.id === chapterNum);
	};

	const getQuestion = (chapterNum: number, questionNum: number) => {
		return getChapter(chapterNum)?.questions?.find(
			(q) => q.id === questionNum
		);
	};

	const isWeb = Platform.OS === "web";

	return (
		<BookContext.Provider value={{ book, getChapter, getQuestion }}>
			{isWeb && !!book && <NavBar />}
			<Slot />
		</BookContext.Provider>
	);
}
