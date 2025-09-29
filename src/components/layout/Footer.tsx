import { Box, Text } from "@chakra-ui/react";

export default function Footer() {
	const built =
		(import.meta as { env?: Record<string, string> }).env?.[
			"VITE_BUILD_TIME"
		] ?? "";
	return (
		<Box
			as="footer"
			py={8}
			color="gray.500"
			textAlign="center"
		>
			<Text fontSize="sm">© {new Date().getFullYear()} Nick Karnik</Text>
			{built ? <Text fontSize="xs">Built {built}</Text> : null}
		</Box>
	);
}
