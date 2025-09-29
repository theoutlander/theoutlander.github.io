// src/routes/about.tsx
import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Heading, Text, Link } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export const Route = createFileRoute("/about")({
	component: () => (
		<>
			<Helmet>
				<title>About - Nick Karnik</title>
				<meta
					name="description"
					content="Hi, I'm Nick. I build software and lead engineering teams. Learn more about my background and experience."
				/>
				<meta
					property="og:title"
					content="About - Nick Karnik"
				/>
				<meta
					property="og:description"
					content="Hi, I'm Nick. I build software and lead engineering teams. Learn more about my background and experience."
				/>
				<meta
					property="og:type"
					content="profile"
				/>
				<meta
					property="og:url"
					content="https://nick.karnik.io/about"
				/>
				<meta
					name="twitter:card"
					content="summary"
				/>
				<meta
					name="twitter:title"
					content="About - Nick Karnik"
				/>
				<meta
					name="twitter:description"
					content="Hi, I'm Nick. I build software and lead engineering teams. Learn more about my background and experience."
				/>
			</Helmet>
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
		</>
	),
});
