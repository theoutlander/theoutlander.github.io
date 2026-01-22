/**
 * Brand colors for social media and service icons
 * Official brand colors for consistent icon styling
 */

export type IconType =
	| "email"
	| "linkedin"
	| "github"
	| "youtube"
	| "codementor"
	| "calendar"
	| "resume"
	| "twitter"
	| "stackoverflow";

export interface IconColorConfig {
	light: string;
	dark: string;
	hoverLight?: string;
	hoverDark?: string;
}

export const iconColors: Record<IconType, IconColorConfig> = {
	email: {
		light: "#000000", // Black
		dark: "#FFFFFF",
		hoverLight: "#333333",
		hoverDark: "#E4E4E7",
	},
	linkedin: {
		light: "#0A66C2", // Official LinkedIn blue
		dark: "#0A66C2",
		hoverLight: "#004182",
		hoverDark: "#3399FF",
	},
	github: {
		light: "#181717", // Official GitHub black
		dark: "#FFFFFF",
		hoverLight: "#000000",
		hoverDark: "#E4E4E7",
	},
	youtube: {
		light: "#FF0000", // Official YouTube red
		dark: "#FF0000",
		hoverLight: "#CC0000",
		hoverDark: "#FF4444",
	},
	codementor: {
		light: "#FF6B35", // Codementor orange
		dark: "#FF8C66",
		hoverLight: "#E55A2B",
		hoverDark: "#FFA380",
	},
	calendar: {
		light: "#111111", // Neutral dark
		dark: "#E4E4E7",
		hoverLight: "#000000",
		hoverDark: "#FFFFFF",
	},
	resume: {
		light: "#000000", // Black
		dark: "#FFFFFF",
		hoverLight: "#333333",
		hoverDark: "#E4E4E7",
	},
	twitter: {
		light: "#1DA1F2", // Official Twitter blue
		dark: "#1DA1F2",
		hoverLight: "#0d8bd9",
		hoverDark: "#4db3f5",
	},
	stackoverflow: {
		light: "#F48024", // Official Stack Overflow orange
		dark: "#FFA366",
		hoverLight: "#D66D1A",
		hoverDark: "#FFB88C",
	},
};

/**
 * Get color styles for an icon type
 */
export function getIconColorStyles(iconType: IconType): {
	color: { base: string; _dark: string };
	_hover?: { color: { base: string; _dark: string } };
} {
	const colors = iconColors[iconType];
	return {
		color: {
			base: colors.light,
			_dark: colors.dark,
		},
		...(colors.hoverLight && colors.hoverDark
			? {
					_hover: {
						color: {
							base: colors.hoverLight,
							_dark: colors.hoverDark,
						},
					},
			  }
			: {}),
	};
}
