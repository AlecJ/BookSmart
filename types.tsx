import { ImageSourcePropType } from "react-native";

export interface BookType {
	name: string;
	prettyName?: string;
	author?: string;
	description?: string;
	imgSrc?: ImageSourcePropType;
	progress?: number;
	chapters?: BookChapterType[];
}

export interface BookChapterType {
	id: number;
	title: string;
	status: string;
	questions?: BookQuestionType[];
}

export interface BookQuestionType {
	id: number;
	text: string;
	status: string;
	userResponse?: string;
	feedback?: string;
}
