// src/routes/about.tsx
import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading, Text, Link } from "@chakra-ui/react";

export const Route = createFileRoute("/about")({
	component: () => (
		<Box
			maxW="3xl"
			mx="auto"
			p={6}
		>
			<Heading
				size="lg"
				mb={4}
			>
				About
			</Heading>
			<Text mb={3}>
				Hi, I’m Nick. I build software and lead engineering teams…
			</Text>
			<Text>
				Connect:{" "}
				<Link
					href="https://www.linkedin.com/in/..."
					target="_blank"
					rel="noopener noreferrer"
				>
					LinkedIn
				</Link>{" "}
				•{" "}
				<Link
					href="https://github.com/theoutlander"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub
				</Link>
			</Text>
		</Box>
	),
});
