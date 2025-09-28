import { useEffect, useState } from "react";
import {
	Box,
	Heading,
	Text,
	VStack,
	Link,
	Image,
	Card,
} from "@chakra-ui/react";
import type { Post } from "./RoutePost";

export default function BlogList() {
	const [posts, setPosts] = useState<Post[]>([]);
	useEffect(() => {
		fetch("/data/hashnode.json")
			.then((r) => r.json())
			.then(setPosts)
			.catch(() => setPosts([]));
	}, []);
	return (
		<Box
			maxW="4xl"
			mx="auto"
			p={6}
		>
			<Heading
				size="lg"
				mb={4}
			>
				Blog
			</Heading>
			<VStack
				gap={4}
				align="stretch"
			>
				{posts.map((p) => (
					<Card.Root
						key={p.slug}
						p={4}
					>
						{p.cover ? (
							<Image
								src={p.cover}
								alt=""
								mb={3}
								borderRadius="lg"
							/>
						) : null}
						<Link
							href={`/blog/${p.slug}`}
							fontWeight="semibold"
							textDecoration="underline"
						>
							{p.title}
						</Link>
						<Text
							fontSize="sm"
							opacity={0.7}
						>
							{p.date ? new Date(p.date).toDateString() : ""}
						</Text>
						<Text mt={2}>{p.excerpt}</Text>
					</Card.Root>
				))}
			</VStack>
		</Box>
	);
}
