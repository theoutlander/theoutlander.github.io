import { useEffect, useState } from "react";
import {
	Box,
	Heading,
	Text,
	SimpleGrid,
	Image,
	Card,
	Skeleton,
} from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import type { Post } from "./RoutePost";

export default function BlogList({ filterTag }: { filterTag?: string }) {
	const [posts, setPosts] = useState<Post[] | null>(null);

	useEffect(() => {
		fetch("/data/hashnode.json")
			.then((r) => r.json())
			.then(setPosts)
			.catch(() => setPosts([]));
	}, []);

	const items = (posts ?? []).filter(
		(p) => !filterTag || p.tags?.includes(filterTag)
	);

	return (
		<Box>
			<Heading
				size="lg"
				mb={6}
			>
				Blog
			</Heading>

			{!posts ? (
				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={6}
				>
					{Array.from({ length: 4 }).map((_, i) => (
						<Card.Root
							key={i}
							borderRadius="2xl"
							overflow="hidden"
						>
							<Skeleton height="220px" />
							<Box p={4}>
								<Skeleton
									height="20px"
									mb={2}
								/>
								<Skeleton
									height="14px"
									width="40%"
								/>
								<Skeleton
									height="48px"
									mt={4}
								/>
							</Box>
						</Card.Root>
					))}
				</SimpleGrid>
			) : (
				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={6}
				>
					{items.map((p) => (
						<Card.Root
							key={p.slug}
							borderRadius="2xl"
							overflow="hidden"
							shadow="sm"
							_hover={{ shadow: "md", transform: "translateY(-2px)" }}
							transition="all 120ms"
						>
							{p.cover ? (
								<Image
									src={p.cover}
									alt=""
									objectFit="cover"
									maxH="260px"
									w="100%"
								/>
							) : null}

							<Box p={4}>
								<RouterLink
									to="/blog/$slug"
									params={{ slug: p.slug }}
									preload="intent"
								>
									<Text
										as="h2"
										fontWeight="semibold"
										fontSize="lg"
										color="blue.700"
									>
										{p.title}
									</Text>
								</RouterLink>

								<Text
									fontSize="sm"
									color="gray.600"
									mt={1}
								>
									{p.date ? new Date(p.date).toDateString() : ""}
									{p.excerpt
										? ` · ${estimateReadingTime(p.excerpt)} min read`
										: ""}
								</Text>

								{p.excerpt ? (
									<Text
										mt={3}
										color="gray.800"
									>
										{p.excerpt}
									</Text>
								) : null}
							</Box>
						</Card.Root>
					))}
				</SimpleGrid>
			)}
		</Box>
	);
}

function estimateReadingTime(text: string) {
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
