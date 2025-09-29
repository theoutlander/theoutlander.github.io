// src/components/blog/BlogCard.tsx
import { Card, Text, Image, HStack, Tag } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { m } from "framer-motion";
import type { Post } from "./RoutePost";

export default function BlogCard({ post }: { post: Post }) {
	return (
		<Card.Root
			as={m.article}
			borderRadius="2xl"
			overflow="hidden"
			shadow="sm"
			whileHover={{ y: -2 }}
			transition={{ type: "spring", stiffness: 320, damping: 30 }}
		>
			{post.cover ? (
				<Image
					src={post.cover}
					alt=""
					objectFit="cover"
					maxH="240px"
					w="full"
				/>
			) : null}
			<Card.Body>
				<RouterLink
					to="/blog/$slug"
					params={{ slug: post.slug }}
					preload="intent"
				>
					<Text
						as="h2"
						fontWeight="semibold"
						fontSize="lg"
						color="brand.700"
					>
						{post.title}
					</Text>
				</RouterLink>
				<Text
					fontSize="sm"
					color="gray.600"
					mt={1}
				>
					{post.date ? new Date(post.date).toDateString() : ""} ·{" "}
					{estimateReadingTime(post.excerpt || "")} min read
				</Text>
				{post.excerpt ? (
					<Text
						mt={3}
						color="gray.800"
					>
						{post.excerpt}
					</Text>
				) : null}
				{post.tags?.length ? (
					<HStack
						mt={4}
						spacing={2}
						wrap="wrap"
					>
						{post.tags.slice(0, 3).map((t) => (
							<RouterLink
								key={t}
								to="/blog/t/$tag"
								params={{ tag: t }}
							>
								<Tag
									size="sm"
									colorScheme="gray"
									cursor="pointer"
									_hover={{ bg: "gray.100" }}
								>
									{t}
								</Tag>
							</RouterLink>
						))}
					</HStack>
				) : null}
			</Card.Body>
		</Card.Root>
	);
}
function estimateReadingTime(text: string) {
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
