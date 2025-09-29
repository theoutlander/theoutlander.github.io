import { useState, useEffect } from "react";
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
	Textarea,
	Input,
	Field,
	Alert,
} from "@chakra-ui/react";
import { FaComment, FaHeart, FaPaperPlane } from "react-icons/fa";

interface Comment {
	id: string;
	name: string;
	content: string;
	date: string;
}

interface SimpleCommentsProps {
	postSlug?: string;
}

export default function SimpleComments({
	postSlug = "default",
}: SimpleCommentsProps) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		content: "",
	});
	const [error, setError] = useState<string | null>(null);

	// Load comments from localStorage on component mount
	useEffect(() => {
		const storageKey = `simple-comments-${postSlug}`;
		const savedComments = localStorage.getItem(storageKey);
		if (savedComments) {
			try {
				setComments(JSON.parse(savedComments));
			} catch (err) {
				console.error("Failed to parse saved comments:", err);
			}
		}
	}, [postSlug]);

	// Save comments to localStorage whenever comments change
	useEffect(() => {
		if (comments.length > 0) {
			const storageKey = `simple-comments-${postSlug}`;
			localStorage.setItem(storageKey, JSON.stringify(comments));
		}
	}, [comments, postSlug]);

	const handleSubmitComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.content) {
			setError("Please fill in all fields");
			return;
		}

		const newComment: Comment = {
			id: Date.now().toString(),
			name: formData.name,
			content: formData.content,
			date: new Date().toISOString(),
		};

		setComments((prev) => [newComment, ...prev]);
		setFormData({ name: "", content: "" });
		setShowForm(false);
		setError(null);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

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
								{comments.length}{" "}
								{comments.length === 1 ? "Comment" : "Comments"}
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

					{error && (
						<Alert.Root status="error">
							<Alert.Indicator />
							{error}
						</Alert.Root>
					)}

					{!showForm && (
						<Button
							variant="solid"
							colorPalette="blue"
							onClick={() => setShowForm(true)}
							alignSelf="flex-start"
						>
							<Icon
								as={FaComment}
								mr={2}
							/>
							Add a Comment
						</Button>
					)}

					{showForm && (
						<Box
							p={6}
							bg="gray.50"
							borderRadius="xl"
							border="1px solid"
							borderColor="gray.200"
						>
							<form onSubmit={handleSubmitComment}>
								<VStack
									gap={4}
									align="stretch"
								>
									<Field.Root required>
										<Field.Label fontSize="sm">Name</Field.Label>
										<Input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											placeholder="Your name"
										/>
									</Field.Root>
									<Field.Root required>
										<Field.Label fontSize="sm">Comment</Field.Label>
										<Textarea
											value={formData.content}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													content: e.target.value,
												}))
											}
											placeholder="Write your comment here..."
											rows={4}
											resize="vertical"
										/>
									</Field.Root>
									<HStack gap={3}>
										<Button
											type="submit"
											variant="solid"
											colorPalette="blue"
										>
											<Icon
												as={FaPaperPlane}
												mr={2}
											/>
											Post Comment
										</Button>
										<Button
											variant="outline"
											onClick={() => setShowForm(false)}
										>
											Cancel
										</Button>
									</HStack>
								</VStack>
							</form>
						</Box>
					)}

					<Box
						minH="200px"
						borderRadius="xl"
						overflow="hidden"
						border="1px solid"
						borderColor="gray.200"
						boxShadow="sm"
						bg="white"
					>
						{comments.length === 0 ? (
							<Box
								p={8}
								textAlign="center"
							>
								<Icon
									as={FaComment}
									boxSize={12}
									color="gray.300"
								/>
								<Text
									mt={4}
									color="gray.600"
								>
									No comments yet. Be the first to comment!
								</Text>
							</Box>
						) : (
							<VStack
								gap={0}
								align="stretch"
							>
								{comments.map((comment) => (
									<Box
										key={comment.id}
										p={6}
										borderBottom="1px solid"
										borderColor="gray.100"
										_last={{ borderBottom: "none" }}
									>
										<VStack
											gap={3}
											align="stretch"
										>
											<HStack
												gap={3}
												align="start"
											>
												<VStack
													gap={1}
													align="start"
													flex={1}
												>
													<Text
														fontWeight="medium"
														fontSize="sm"
													>
														{comment.name}
													</Text>
													<Text
														color="gray.500"
														fontSize="xs"
													>
														{formatDate(comment.date)}
													</Text>
												</VStack>
											</HStack>
											<Text
												color="gray.800"
												lineHeight="1.6"
												whiteSpace="pre-wrap"
											>
												{comment.content}
											</Text>
										</VStack>
									</Box>
								))}
							</VStack>
						)}
					</Box>
				</VStack>
			</Container>
		</Box>
	);
}
