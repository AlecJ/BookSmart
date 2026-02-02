import { useBooksCtx } from "@/app/contexts/BookContext";
import NavBar from "@/components/navbar";

import { Slot, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function BookLayout() {
	const params = useGlobalSearchParams(); // { bookId: '123', chapterNum: '5' }
	const bookId = params.bookId as string;
	const { getUserBookData } = useBooksCtx();

	useEffect(() => {
		if (bookId) getUserBookData(bookId);
	}, [bookId, getUserBookData]);

	const isWeb = Platform.OS === "web";

	return (
		<>
			{isWeb && <NavBar />}
			<Slot />
		</>
	);
}
