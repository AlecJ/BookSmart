import { ImageSourcePropType } from "react-native";

export interface UserType {
	id: string;
	email: string;
	books?: BookType[];
}

export interface BookType {
	id: string;
	google_book_id: string;
	title: string;
	author: string;
	description: string;
	imgSrc?: ImageSourcePropType;
	chapters?: BookChapterType[];
}

export interface BookChapterType {
	id: number;
	book_id: string;
	title: string;
	status?: string;
	questions?: BookQuestionType[];
}

export interface BookQuestionType {
	id: number;
	chapter_id: string;
	question_text: string;
	userResponse?: UserResponseType;
}

export interface UserResponseType {
	id: string;
	user_id: string;
	question_id: string;
	response_text: string;
	feedback_text?: string;
	feedback_grade: 0 | 1 | 2;
}
