import { ImageSourcePropType } from "react-native";

export interface BookType {
	name: string;
	prettyName?: string;
	imgSrc?: ImageSourcePropType;
	progress?: number;
	author?: string;
}
