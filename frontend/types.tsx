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
	status?: null | 0 | 1 | 2;
	questions?: BookQuestionType[];
}

export interface BookQuestionType {
	id: number;
	chapter_id: string;
	question_text: string;
	userResponse?: UserResponseType;
	status?: null | 0 | 1 | 2;
}

export interface UserResponseType {
	id: string;
	user_id: string;
	question_id: string;
	response_text: string;
	feedback_text?: string;
	feedback_grade: 0 | 1 | 2;
}
