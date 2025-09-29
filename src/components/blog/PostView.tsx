import {
	Box,
	Heading,
	Image,
	Text,
	HStack,
	Tag,
	Container,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
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
	const postUrl = `https://nick.karnik.io/blog/${post.title
		.toLowerCase()
		.replace(/\s+/g, "-")}`;

	return (
		<>
			<Helmet>
				<title>{post.title}</title>
				<link
					rel="canonical"
					href={postUrl}
				/>
				{post.excerpt && (
					<meta
						name="description"
						content={post.excerpt}
					/>
				)}
				{post.cover && (
					<meta
						property="og:image"
						content={post.cover}
					/>
				)}
				<meta
					property="og:title"
					content={post.title}
				/>
				<meta
					property="og:type"
					content="article"
				/>
				<meta
					property="og:url"
					content={postUrl}
				/>
				{post.excerpt && (
					<meta
						property="og:description"
						content={post.excerpt}
					/>
				)}
				<meta
					name="twitter:card"
					content="summary_large_image"
				/>
				<meta
					name="twitter:title"
					content={post.title}
				/>
				{post.excerpt && (
					<meta
						name="twitter:description"
						content={post.excerpt}
					/>
				)}
				{post.cover && (
					<meta
						name="twitter:image"
						content={post.cover}
					/>
				)}
			</Helmet>
			<ProgressTop />
			{/* Structured data */}
			<PostJsonLd
				title={post.title}
				url={postUrl}
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
