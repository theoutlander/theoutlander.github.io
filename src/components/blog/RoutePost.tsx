import { useEffect, useState } from "react";
import { Box, Heading, Text, Link, Image } from "@chakra-ui/react";

export type Post = {
	id: string;
	slug: string;
	title: string;
	url: string;
	date?: string | null;
	excerpt?: string;
	cover?: string | null;
	tags?: string[];
};

export default function RoutePost({ slug }: { slug: string }) {
	const [post, setPost] = useState<Post | null>(null);

	useEffect(() => {
		fetch("/data/hashnode.json")
			.then((r) => r.json())
			.then((all: Post[]) => setPost(all.find((p) => p.slug === slug) ?? null))
			.catch(() => setPost(null));
	}, [slug]);

	if (!post) return <Box p={6}>Loading…</Box>;

	return (
		<Box
			maxW="3xl"
			mx="auto"
			p={6}
		>
			{post.cover ? (
				<Image
					src={post.cover}
					alt=""
					mb={4}
					borderRadius="xl"
				/>
			) : null}
			<Heading size="lg">{post.title}</Heading>
			<Text
				opacity={0.7}
				mt={1}
			>
				{post.date ? new Date(post.date).toDateString() : ""}
			</Text>
			<Text mt={4}>{post.excerpt}</Text>
			<Text mt={6}>
				Full post on Hashnode:{" "}
				<Link
					href={post.url}
					isExternal
				>
					{post.url}
				</Link>
			</Text>
		</Box>
	);
}
