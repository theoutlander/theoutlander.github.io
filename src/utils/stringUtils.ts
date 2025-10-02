/**
 * Capitalizes the first letter of each word in a string
 */
export function capitalizeFirstLetter(str: string): string {
	if (!str || str.length === 0) return str;
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Capitalizes the first letter of each tag in an array
 */
export function capitalizeTags(tags: string[]): string[] {
	return tags.map((tag) => capitalizeFirstLetter(tag));
}
