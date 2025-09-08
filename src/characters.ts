import CufImg from "./assets/Cuf.png";
import NellyImg from "./assets/Nelly.png";

export type CharacterName = "Cuf" | "Nelly";

export const characters: Record<
	CharacterName,
	{ fullname: string; image: ImageMetadata; name: CharacterName }
> = {
	Cuf: {
		fullname: "Cuf, the Curious Capybara",
		name: "Cuf",
		image: CufImg,
	},
	Nelly: {
		fullname: "Nelly, the Nerdy Newt",
		name: "Nelly",
		image: NellyImg,
	},
} as const;
