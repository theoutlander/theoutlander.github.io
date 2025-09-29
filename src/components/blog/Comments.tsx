import { useEffect, useRef, useState } from "react";
import {
	Box,
	Heading,
	Text,
	VStack,
	HStack,
	Button,
	Icon,
	Separator,
	Container,
	Badge,
} from "@chakra-ui/react";
import { FaComment, FaHeart, FaCog } from "react-icons/fa";
import UtterancesComments from "./UtterancesComments";
import HashnodeComments from "./HashnodeComments";
import SimpleComments from "./SimpleComments";
import { COMMENTS_CONFIG } from "../../lib/comments";

interface CommentsProps {
	postTitle: string;
	postUrl: string;
}

type CommentSystem = "hashnode" | "giscus" | "utterances" | "simple";

export default function Comments({ postTitle, postUrl }: CommentsProps) {
	const commentsRef = useRef<HTMLDivElement>(null);
	const [commentSystem, setCommentSystem] =
		useState<CommentSystem>("utterances");

	useEffect(() => {
		// Only load Giscus on client side
		if (typeof window === "undefined" || commentSystem !== "giscus") return;

		const script = document.createElement("script");
		script.src = "https://giscus.app/client.js";
		script.setAttribute("data-repo", COMMENTS_CONFIG.githubRepo);
		script.setAttribute("data-repo-id", COMMENTS_CONFIG.giscus.repoId);
		script.setAttribute("data-category", COMMENTS_CONFIG.giscus.category);
		script.setAttribute("data-category-id", COMMENTS_CONFIG.giscus.categoryId);
		script.setAttribute("data-mapping", COMMENTS_CONFIG.giscus.mapping);
		script.setAttribute("data-strict", COMMENTS_CONFIG.giscus.strict);
		script.setAttribute(
			"data-reactions-enabled",
			COMMENTS_CONFIG.giscus.reactionsEnabled
		);
		script.setAttribute(
			"data-emit-metadata",
			COMMENTS_CONFIG.giscus.emitMetadata
		);
		script.setAttribute(
			"data-input-position",
			COMMENTS_CONFIG.giscus.inputPosition
		);
		script.setAttribute("data-theme", COMMENTS_CONFIG.giscus.theme);
		script.setAttribute("data-lang", COMMENTS_CONFIG.giscus.lang);
		script.setAttribute("data-loading", COMMENTS_CONFIG.giscus.loading);
		script.crossOrigin = "anonymous";
		script.async = true;

		// Capture the ref value
		const currentRef = commentsRef.current;

		// Clear previous comments
		if (currentRef) {
			currentRef.innerHTML = "";
			currentRef.appendChild(script);
		}

		return () => {
			// Cleanup
			if (currentRef) {
				currentRef.innerHTML = "";
			}
		};
	}, [postTitle, postUrl, commentSystem]);

	// If using Hashnode, render the Hashnode component
	if (commentSystem === "hashnode") {
		return <HashnodeComments postUrl={postUrl} />;
	}

	// If using Utterances, render the Utterances component
	if (commentSystem === "utterances") {
		return (
			<UtterancesComments
				postTitle={postTitle}
				postUrl={postUrl}
			/>
		);
	}

	// If using Simple comments, render the Simple component
	if (commentSystem === "simple") {
		// Extract slug from postUrl for post-specific comments
		const postSlug = postUrl.split("/").pop() || "default";
		return <SimpleComments postSlug={postSlug} />;
	}

	return (
		<Box
			mt={12}
			pt={8}
		>
			<Separator mb={8} />

			<Container
				maxW="3xl"
				px={0}
			>
				<VStack
					align="stretch"
					gap={6}
				>
					<HStack
						gap={3}
						align="center"
						justify="space-between"
					>
						<HStack
							gap={3}
							align="center"
						>
							<Icon
								as={FaComment}
								color="blue.500"
								boxSize={5}
							/>
							<Heading
								size="lg"
								color="gray.800"
							>
								Comments
							</Heading>
							<Badge
								colorPalette="blue"
								variant="subtle"
							>
								Hashnode Comments
							</Badge>
						</HStack>
						<HStack gap={3}>
							<Icon
								as={FaHeart}
								color="red.400"
								boxSize={4}
							/>
							<HStack gap={2}>
								<Icon
									as={FaCog}
									color="gray.500"
									boxSize={3}
								/>
								<Box>
									<Text
										fontSize="xs"
										color="gray.500"
										mb={1}
									>
										Comment System
									</Text>
									<select
										id="comment-system-select"
										value={commentSystem}
										onChange={(e) =>
											setCommentSystem(e.target.value as CommentSystem)
										}
										className="comment-system-select"
										aria-label="Select comment system"
									>
										<option value="hashnode">Hashnode Comments</option>
										<option value="giscus">Giscus Comments</option>
										<option value="utterances">Utterances Comments</option>
										<option value="simple">Simple Comments</option>
									</select>
								</Box>
							</HStack>
						</HStack>
					</HStack>

					<Text
						color="gray.600"
						fontSize="md"
						lineHeight="1.6"
					>
						Share your thoughts and join the discussion! Leave a comment below.
					</Text>

					<Box
						p={6}
						bg="gradient-to-r"
						bgGradient="linear(to-r, blue.50, purple.50)"
						borderRadius="xl"
						border="1px solid"
						borderColor="blue.100"
					>
						<VStack
							gap={4}
							align="stretch"
						>
							<HStack
								gap={3}
								align="center"
							>
								<Icon
									as={FaComment}
									color="gray.700"
									boxSize={5}
								/>
								<Text
									fontSize="md"
									fontWeight="medium"
									color="gray.700"
								>
									Ready to join the conversation?
								</Text>
							</HStack>

							<HStack
								gap={3}
								wrap="wrap"
							>
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										// Scroll to comments section
										commentsRef.current?.scrollIntoView({ behavior: "smooth" });
									}}
								>
									Scroll to Comments
								</Button>
							</HStack>
						</VStack>
					</Box>

					<Box
						ref={commentsRef}
						minH="300px"
						borderRadius="xl"
						overflow="hidden"
						border="1px solid"
						borderColor="gray.200"
						boxShadow="sm"
						bg="white"
					/>
				</VStack>
			</Container>
		</Box>
	);
}
