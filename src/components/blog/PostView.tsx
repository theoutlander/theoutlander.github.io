import {
	Box,
	Heading,
	Image,
	Text,
	HStack,
	Tag,
	Container,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ProgressTop from "../ui/ProgressTop";
import PostJsonLd from "../seo/PostJsonLd";

type Post = {
	title: string;
	date: string | null;
	cover: string | null;
	excerpt: string;
	html: string;
	url: string;
	tags: string[];
};

export default function PostView({ post }: { post: Post }) {
	return (
		<>
			<ProgressTop />
			{/* Structured data */}
			<PostJsonLd
				title={post.title}
				url={`https://nick.karnik.io/blog/${post.title
					.toLowerCase()
					.replace(/\s+/g, "-")}`}
				date={post.date}
				excerpt={post.excerpt}
			/>

			<Container
				maxW="3xl"
				px={6}
			>
				{post.cover ? (
					<Image
						src={post.cover}
						alt=""
						mb={8}
						borderRadius="xl"
						w="full"
					/>
				) : null}

				<Heading
					size="xl"
					mb={4}
					lineHeight="1.2"
				>
					{post.title}
				</Heading>

				<HStack
					gap={3}
					mb={6}
				>
					<Text
						fontSize="sm"
						color="gray.600"
					>
						{post.date ? new Date(post.date).toDateString() : ""}
					</Text>
					{post.tags?.slice(0, 4).map((t) => (
						<Tag.Root
							key={t}
							size="sm"
							colorScheme="gray"
						>
							{t}
						</Tag.Root>
					))}
				</HStack>

				<Text
					color="gray.800"
					mb={8}
					fontSize="lg"
					lineHeight="1.7"
				>
					{post.excerpt}
				</Text>

				{/* Full article content */}
				<Box
					prose
					maxW="none"
					lineHeight="1.7"
					fontSize="lg"
					color="gray.800"
				>
					{post.html ? (
						<div dangerouslySetInnerHTML={{ __html: post.html }} />
					) : (
						<Text
							color="gray.500"
							fontStyle="italic"
						>
							Content not available
						</Text>
					)}
				</Box>
			</Container>
		</>
	);
}
