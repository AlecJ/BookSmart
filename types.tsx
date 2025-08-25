import { ImageSourcePropType } from "react-native";

export interface BookType {
	name: string;
	imgSrc?: ImageSourcePropType;
	progress?: number;
}
