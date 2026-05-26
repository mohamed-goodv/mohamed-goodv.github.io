import type { Favicon } from "@/types/config.ts";

export const defaultFavicons: Favicon[] = [
	{
		src: "/favicon/image.ico",
		theme: "light",
		sizes: "64x64",
	},
	{
		src: "/favicon/image.ico",
		theme: "dark",
		sizes: "64x64",
	},
];
