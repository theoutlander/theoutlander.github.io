import { createFileRoute } from "@tanstack/react-router";
import {
	Box,
	Heading,
	Text,
	HStack,
	VStack,
	Avatar,
	Button,
	Link as CLink,
	SimpleGrid,
	Card,
	Tag,
	Separator,
	useToken,
} from "@chakra-ui/react";
import { FiMail, FiExternalLink } from "react-icons/fi";
import { Helmet } from "react-helmet-async";

const HASHNODE_ABOUT_SLUG = "about";
const BUILD_ID = (import.meta as any).env?.VITE_BUILD_ID ?? "dev";

export const Route = createFileRoute("/about")({
	loader: async () => {
		const url = `/data/pages/${HASHNODE_ABOUT_SLUG}.json?v=${BUILD_ID}`;
		const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
		if (!res.ok)
			throw new Error(`About JSON not found: ${url} (${res.status})`);
		const page = (await res.json()) as { title: string; html: string };
		// Remove a trailing © line if present
		page.html = page.html.replace(/<p>©[^<]*<\/p>\s*$/i, "").trim();
		return page;
	},
	component: AboutPage,
	errorComponent: ({ error }) => (
		<Box p={6}>
			<pre sx={{ whiteSpace: "pre-wrap" }}>{String(error)}</pre>
		</Box>
	),
});

function AboutPage() {
	const page = Route.useLoaderData() as { title: string; html: string };
	const accent = "blue.600";
	const cardBorder = useToken("colors", "gray.200");
	const muted = useToken("colors", "gray.600");

	return (
		<>
			<Helmet>
				<title>{page.title} — Nick Karnik</title>
				<meta
					name="description"
					content="About Nick Karnik"
				/>
				<link
					rel="canonical"
					href="https://nick.karnik.io/about"
				/>
			</Helmet>
			<Box>
				{/* Hero */}
				<HStack
					mb={10}
					align="center"
					gap={5}
				>
					<Avatar.Root
						name="Nick Karnik"
						size="xl"
					/>
					<VStack
						align="start"
						spacing={1}
					>
						<Heading.Root size="lg">Nick Karnik</Heading.Root>
						<Text.Root color={muted}>
							Engineer and EM, shipping fast with TypeScript
						</Text.Root>
						<HStack
							pt={1}
							gap={2}
						>
							<Tag.Root
								size="sm"
								variant="subtle"
							>
								TypeScript
							</Tag.Root>
							<Tag.Root
								size="sm"
								variant="subtle"
							>
								React
							</Tag.Root>
							<Tag.Root
								size="sm"
								variant="subtle"
							>
								DX
							</Tag.Root>
						</HStack>
					</VStack>
				</HStack>

				{/* Layout */}
				<SimpleGrid
					columns={{ base: 1, md: 3 }}
					gap={8}
				>
					{/* Main content */}
					<Box gridColumn={{ md: "span 2" }}>
					<Heading.Root
						size="md"
						mb={3}
					>
						About
					</Heading.Root>
						<Box
							sx={{
								"h1,h2,h3": { mt: "1.35rem", mb: ".5rem", lineHeight: 1.25 },
								p: { my: "1rem", lineHeight: 1.8 },
								a: { color: accent, textDecoration: "underline" },
								ul: { pl: "1.2rem", listStyle: "disc", my: ".5rem" },
								ol: { pl: "1.2rem", listStyle: "decimal", my: ".5rem" },
								li: { my: ".25rem" },
								blockquote: {
									borderLeft: "4px solid",
									borderColor: cardBorder,
									pl: 3,
									color: muted,
									my: 4,
								},
								pre: {
									bg: "gray.900",
									color: "white",
									p: 4,
									borderRadius: "xl",
									overflow: "auto",
									my: 4,
									fontFamily:
										"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
								},
								code: {
									fontFamily:
										"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
									px: "1.5",
									py: ".5",
									bg: "gray.100",
									borderRadius: "md",
									_dark: { bg: "gray.700" },
								},
								img: { borderRadius: "xl", my: 4, maxWidth: "100%" },
								hr: { my: 6 },
							}}
							dangerouslySetInnerHTML={{ __html: page.html }}
						/>
					</Box>

					{/* Sidebar */}
					<VStack
						align="stretch"
						gap={4}
					>
						<Card.Root
							border="1px solid"
							borderColor={cardBorder}
							p={4}
							borderRadius="2xl"
						>
							<Heading
								size="sm"
								mb={3}
							>
								Contact
							</Heading>
							<VStack
								align="stretch"
								gap={2}
							>
							<Button.Root
								as={CLink}
								href="mailto:nick@karnik.io"
								leftIcon={<FiMail />}
							>
								Email
							</Button.Root>
							<Button.Root
								as={CLink}
								href="https://www.linkedin.com/in/theoutlander"
								isExternal
								rightIcon={<FiExternalLink />}
								variant="outline"
							>
								LinkedIn
							</Button.Root>
							<Button.Root
								as={CLink}
								href="https://github.com/theoutlander"
								isExternal
								rightIcon={<FiExternalLink />}
								variant="outline"
							>
								GitHub
							</Button.Root>
							</VStack>
						</Card.Root>

						<Card.Root
							border="1px solid"
							borderColor={cardBorder}
							p={4}
							borderRadius="2xl"
						>
							<Heading
								size="sm"
								mb={3}
							>
								Focus
							</Heading>
							<HStack
								wrap="wrap"
								gap={2}
								mb={3}
							>
								{[
									"TypeScript",
									"React",
									"Vite",
									"Chakra",
									"Node",
									"GraphQL",
									"AI",
								].map((t) => (
									<Tag.Root
										key={t}
										size="sm"
										variant="subtle"
									>
										{t}
									</Tag.Root>
								))}
							</HStack>
							<Separator my={3} />
							<Text
								fontSize="sm"
								color={muted}
							>
								I help teams move faster with clear product bets, strong
								execution, and systems that are simple to maintain.
							</Text>
						</Card.Root>

						<Card.Root
							border="1px solid"
							borderColor={cardBorder}
							p={4}
							borderRadius="2xl"
						>
							<Heading
								size="sm"
								mb={3}
							>
								Currently
							</Heading>
							<VStack
								align="start"
								gap={2}
							>
								<Text fontSize="sm">
									Advising founders on pragmatic AI and DX.
								</Text>
								<Text fontSize="sm">
									Building with React + Node, shipping weekly.
								</Text>
							</VStack>
						</Card.Root>
					</VStack>
				</SimpleGrid>

				{/* Single footer line (we'll remove the duplicate from Hashnode content below) */}
				<Box
					textAlign="center"
					mt={10}
					color={muted}
					fontSize="sm"
				>
					© {new Date().getFullYear()} Nick Karnik
				</Box>
			</Box>
		</>
	);
}
