import { useEffect, useRef } from "react";
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
import { FaComment, FaHeart } from "react-icons/fa";
import { COMMENTS_CONFIG } from "../../lib/comments";

interface UtterancesCommentsProps {
	postTitle: string;
	postUrl: string;
}

export default function UtterancesComments({
	postTitle,
	postUrl,
}: UtterancesCommentsProps) {
	const commentsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only load Utterances on client side
		if (typeof window === "undefined") return;

		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.setAttribute("repo", COMMENTS_CONFIG.githubRepo);
		script.setAttribute("issue-term", COMMENTS_CONFIG.utterances.issueTerm);
		script.setAttribute("theme", COMMENTS_CONFIG.utterances.theme);
		script.setAttribute("crossorigin", "anonymous");
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
	}, [postTitle, postUrl]);

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
								Live Comments
							</Badge>
						</HStack>
						<Icon
							as={FaHeart}
							color="red.400"
							boxSize={4}
						/>
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
