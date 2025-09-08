import CalaImg from "./assets/Cala.png";
import NellyImg from "./assets/Nelly.png";

export type CharacterName = "Cala" | "Nelly";

export const characters: Record<
	CharacterName,
	{ fullname: string; image: ImageMetadata; name: CharacterName }
> = {
	Cala: {
		fullname: "Cala, the Curious Capybara",
		name: "Cala",
		image: CalaImg,
	},
	Nelly: {
		fullname: "Nelly, the Nerdy Newt",
		name: "Nelly",
		image: NellyImg,
	},
} as const;
