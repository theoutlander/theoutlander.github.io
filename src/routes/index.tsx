import { createFileRoute } from "@tanstack/react-router";
import {
	Box,
	Heading,
	Text,
	HStack,
	VStack,
	Avatar,
	Link as CLink,
	Button,
	Container,
	SimpleGrid,
	Card,
	Tag,
	useToken,
} from "@chakra-ui/react";
import {
	FiMail,
	FiExternalLink,
	FiArrowRight,
	FiCode,
	FiUsers,
	FiTrendingUp,
} from "react-icons/fi";
import { Link as RouterLink } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";

type Post = {
	slug: string;
	title: string;
	excerpt?: string;
	date?: string;
	cover?: string;
	tags?: string[];
};

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const [posts, setPosts] = useState<Post[] | null>(null);
	const muted = useToken("colors", "gray.600");

	useEffect(() => {
		fetch("/data/hashnode.json")
			.then((r) => r.json())
			.then(setPosts)
			.catch(() => setPosts([]));
	}, []);

	const latestPosts = (posts ?? []).slice(0, 2);

	return (
		<>
			<Helmet>
				<title>
					Nick Karnik - Staff Software Engineer & Engineering Leader
				</title>
				<meta
					name="description"
					content="Staff software engineer and engineering leader sharing insights on engineering, AI, and technology. Read my latest thoughts and experiences."
				/>
				<meta
					property="og:title"
					content="Nick Karnik - Staff Software Engineer & Engineering Leader"
				/>
				<meta
					property="og:description"
					content="Staff software engineer and engineering leader sharing insights on engineering, AI, and technology. Read my latest thoughts and experiences."
				/>
				<meta
					property="og:type"
					content="website"
				/>
				<meta
					property="og:url"
					content="https://nick.karnik.io"
				/>
			</Helmet>

			{/* Hero Section */}
			<Box
				py={{ base: 16, md: 24 }}
				bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
				borderRadius="3xl"
				mb={16}
				position="relative"
				overflow="hidden"
			>
				{/* Background decoration */}
				<Box
					position="absolute"
					top="-50%"
					right="-20%"
					width="300px"
					height="300px"
					bg="blue.100"
					borderRadius="full"
					opacity={0.3}
				/>
				<Box
					position="absolute"
					bottom="-30%"
					left="-10%"
					width="200px"
					height="200px"
					bg="purple.100"
					borderRadius="full"
					opacity={0.2}
				/>

				<Container
					maxW="5xl"
					position="relative"
				>
					<SimpleGrid
						columns={{ base: 1, lg: 2 }}
						gap={12}
						alignItems="center"
					>
						<VStack
							align="start"
							gap={6}
							textAlign="left"
						>
							<Box>
								<Heading
									size="2xl"
									mb={4}
									color="gray.800"
								>
									Hi, I'm Nick Karnik
								</Heading>
								<Text
									fontSize="xl"
									color={muted}
									mb={6}
									lineHeight={1.6}
								>
									Engineer and EM, shipping fast with TypeScript. I help teams
									move faster with clear product bets, strong execution, and
									systems that are simple to maintain.
								</Text>
							</Box>

							<HStack
								gap={3}
								wrap="wrap"
							>
								<Tag.Root
									size="md"
									variant="solid"
									bg="blue.500"
									color="white"
								>
									TypeScript
								</Tag.Root>
								<Tag.Root
									size="md"
									variant="solid"
									bg="green.500"
									color="white"
								>
									React
								</Tag.Root>
								<Tag.Root
									size="md"
									variant="solid"
									bg="purple.500"
									color="white"
								>
									DX
								</Tag.Root>
								<Tag.Root
									size="md"
									variant="solid"
									bg="orange.500"
									color="white"
								>
									AI
								</Tag.Root>
							</HStack>

							<HStack
								gap={4}
								wrap="wrap"
							>
								<RouterLink to="/blog">
									<Button
										size="lg"
										bg="blue.500"
										color="white"
										_hover={{ bg: "blue.600", transform: "translateY(-1px)" }}
										shadow="lg"
									>
										Read My Blog
										<FiArrowRight style={{ marginLeft: "8px" }} />
									</Button>
								</RouterLink>
								<RouterLink to="/about">
									<Button
										size="lg"
										variant="outline"
										borderColor="gray.300"
										_hover={{ bg: "gray.50", transform: "translateY(-1px)" }}
										shadow="sm"
									>
										About Me
									</Button>
								</RouterLink>
							</HStack>
						</VStack>

						<Box textAlign="center">
							<Avatar.Root
								size="2xl"
								mb={6}
								mx="auto"
								shadow="2xl"
								border="4px solid"
								borderColor="white"
							>
								<Avatar.Image
									src="/assets/images/profile/nick-karnik.jpeg"
									alt="Nick Karnik"
								/>
								<Avatar.Fallback
									fontSize="4xl"
									bg="blue.500"
									color="white"
								>
									NK
								</Avatar.Fallback>
							</Avatar.Root>
							<Text
								fontSize="lg"
								color={muted}
								fontWeight="medium"
							>
								Currently: Advising founders on pragmatic AI and DX
							</Text>
						</Box>
					</SimpleGrid>
				</Container>
			</Box>

			{/* Stats Section */}
			<Box mb={16}>
				<Heading
					size="xl"
					textAlign="center"
					mb={10}
					color="gray.800"
				>
					Professional Experience
				</Heading>
				<SimpleGrid
					columns={{ base: 1, md: 3 }}
					gap={8}
				>
					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "blue.200",
						}}
						transition="all 200ms ease"
					>
						<Text
							fontSize="sm"
							color={muted}
							mb={2}
							fontWeight="medium"
						>
							Years Experience
						</Text>
						<Heading
							size="2xl"
							color="blue.600"
							mb={1}
						>
							8+
						</Heading>
						<Text
							fontSize="sm"
							color={muted}
						>
							Engineering & Leadership
						</Text>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "green.200",
						}}
						transition="all 200ms ease"
					>
						<Text
							fontSize="sm"
							color={muted}
							mb={2}
							fontWeight="medium"
						>
							Technologies
						</Text>
						<Heading
							size="2xl"
							color="green.600"
							mb={1}
						>
							15+
						</Heading>
						<Text
							fontSize="sm"
							color={muted}
						>
							TypeScript, React, Node, AI
						</Text>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "purple.200",
						}}
						transition="all 200ms ease"
					>
						<Text
							fontSize="sm"
							color={muted}
							mb={2}
							fontWeight="medium"
						>
							Teams Led
						</Text>
						<Heading
							size="2xl"
							color="purple.600"
							mb={1}
						>
							5+
						</Heading>
						<Text
							fontSize="sm"
							color={muted}
						>
							Engineering Teams
						</Text>
					</Card.Root>
				</SimpleGrid>
			</Box>

			{/* Core Competencies */}
			<Box mb={16}>
				<Heading
					size="xl"
					textAlign="center"
					mb={10}
					color="gray.800"
				>
					Core Competencies
				</Heading>
				<SimpleGrid
					columns={{ base: 1, md: 2, lg: 3 }}
					gap={8}
				>
					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "blue.200",
						}}
						transition="all 200ms ease"
					>
						<HStack mb={4}>
							<Box
								p={3}
								bg="blue.100"
								borderRadius="xl"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FiCode
									color="blue.600"
									size={24}
								/>
							</Box>
							<Heading size="lg">Full-Stack Development</Heading>
						</HStack>
						<Text
							color={muted}
							mb={4}
							lineHeight={1.6}
						>
							Building with React + Node, shipping weekly. Focus on TypeScript,
							modern tooling, and great developer experience.
						</Text>
						<HStack
							wrap="wrap"
							gap={2}
						>
							{["TypeScript", "React", "Node.js", "Vite", "Chakra"].map(
								(tech) => (
									<Tag.Root
										key={tech}
										size="sm"
										variant="subtle"
										colorScheme="blue"
									>
										{tech}
									</Tag.Root>
								)
							)}
						</HStack>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "green.200",
						}}
						transition="all 200ms ease"
					>
						<HStack mb={4}>
							<Box
								p={3}
								bg="green.100"
								borderRadius="xl"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FiUsers
									color="green.600"
									size={24}
								/>
							</Box>
							<Heading size="lg">Engineering Leadership</Heading>
						</HStack>
						<Text
							color={muted}
							mb={4}
							lineHeight={1.6}
						>
							Leading teams to move faster with clear product bets, strong
							execution, and systems that are simple to maintain.
						</Text>
						<HStack
							wrap="wrap"
							gap={2}
						>
							{["Team Building", "Process", "Architecture", "Mentoring"].map(
								(skill) => (
									<Tag.Root
										key={skill}
										size="sm"
										variant="subtle"
										colorScheme="green"
									>
										{skill}
									</Tag.Root>
								)
							)}
						</HStack>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "purple.200",
						}}
						transition="all 200ms ease"
					>
						<HStack mb={4}>
							<Box
								p={3}
								bg="purple.100"
								borderRadius="xl"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FiTrendingUp
									color="purple.600"
									size={24}
								/>
							</Box>
							<Heading size="lg">AI Advisory</Heading>
						</HStack>
						<Text
							color={muted}
							mb={4}
							lineHeight={1.6}
						>
							Advising founders on pragmatic AI and developer experience to
							build better products and faster teams.
						</Text>
						<HStack
							wrap="wrap"
							gap={2}
						>
							{["AI Strategy", "Product", "DX", "Consulting"].map((area) => (
								<Tag.Root
									key={area}
									size="sm"
									variant="subtle"
									colorScheme="purple"
								>
									{area}
								</Tag.Root>
							))}
						</HStack>
					</Card.Root>
				</SimpleGrid>
			</Box>

			{/* Current Focus */}
			<Card.Root
				border="1px solid"
				borderColor="gray.200"
				p={8}
				borderRadius="2xl"
				mb={16}
			>
				<Heading
					size="xl"
					textAlign="center"
					mb={8}
					color="gray.800"
				>
					Currently
				</Heading>
				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={8}
				>
					<VStack
						align="start"
						gap={4}
					>
						<Heading
							size="lg"
							color="blue.600"
						>
							AI Advisory
						</Heading>
						<Text
							color={muted}
							lineHeight={1.6}
						>
							Helping founders navigate the AI landscape with practical,
							actionable advice on integrating AI into their products and
							workflows.
						</Text>
					</VStack>
					<VStack
						align="start"
						gap={4}
					>
						<Heading
							size="lg"
							color="green.600"
						>
							Active Development
						</Heading>
						<Text
							color={muted}
							lineHeight={1.6}
						>
							Building with React + Node, shipping weekly. Focus on modern
							tooling, developer experience, and scalable architecture.
						</Text>
					</VStack>
				</SimpleGrid>
			</Card.Root>

			{/* Latest Posts Section */}
			<Box mb={16}>
				<Box
					textAlign="center"
					mb={10}
				>
					<Heading
						size="xl"
						mb={3}
						color="gray.800"
					>
						Latest Thoughts
					</Heading>
					<Text
						fontSize="lg"
						color={muted}
						maxW="2xl"
						mx="auto"
					>
						Sharing insights on engineering, AI, and technology from my
						experience building and leading teams.
					</Text>
				</Box>

				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={8}
				>
					{latestPosts.map((post) => (
						<Card.Root
							key={post.slug}
							borderRadius="2xl"
							overflow="hidden"
							shadow="sm"
							border="1px solid"
							borderColor="gray.200"
							_hover={{
								shadow: "xl",
								transform: "translateY(-4px)",
								borderColor: "blue.200",
							}}
							transition="all 200ms ease"
							cursor="pointer"
						>
							<Box p={8}>
								<RouterLink
									to="/blog/$slug"
									params={{ slug: post.slug }}
									preload="intent"
								>
									<Heading
										as="h3"
										size="lg"
										color="blue.700"
										mb={3}
										_hover={{ color: "blue.600" }}
										transition="color 200ms"
									>
										{post.title}
									</Heading>
								</RouterLink>

								<HStack
									mb={4}
									gap={2}
								>
									<Text
										fontSize="sm"
										color="gray.500"
										fontWeight="medium"
									>
										{post.date
											? new Date(post.date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
											  })
											: ""}
									</Text>
									<Text color="gray.300">•</Text>
									<Text
										fontSize="sm"
										color="gray.500"
									>
										{post.excerpt
											? Math.max(
													1,
													Math.round(post.excerpt.split(" ").length / 200)
											  )
											: 3}{" "}
										min read
									</Text>
								</HStack>

								{post.excerpt && (
									<Text
										color="gray.700"
										fontSize="md"
										lineHeight={1.6}
									>
										{post.excerpt}
									</Text>
								)}
							</Box>
						</Card.Root>
					))}
				</SimpleGrid>

				<Box
					textAlign="center"
					mt={8}
				>
					<RouterLink to="/blog">
						<Button
							size="lg"
							variant="outline"
							_hover={{ bg: "blue.50", borderColor: "blue.300" }}
						>
							View All Posts
							<FiArrowRight style={{ marginLeft: "8px" }} />
						</Button>
					</RouterLink>
				</Box>
			</Box>

			{/* Quick Links */}
			<Box mb={16}>
				<Heading
					size="xl"
					textAlign="center"
					mb={10}
					color="gray.800"
				>
					Explore More
				</Heading>
				<SimpleGrid
					columns={{ base: 1, md: 3 }}
					gap={8}
				>
					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "blue.200",
						}}
						transition="all 200ms ease"
					>
						<Box
							w={12}
							h={12}
							bg="blue.100"
							borderRadius="xl"
							display="flex"
							alignItems="center"
							justifyContent="center"
							mx="auto"
							mb={4}
						>
							<Text
								fontSize="xl"
								color="blue.600"
							>
								👨‍💻
							</Text>
						</Box>
						<Heading
							size="lg"
							mb={4}
							color="gray.800"
						>
							About Me
						</Heading>
						<Text
							color={muted}
							mb={6}
							lineHeight={1.6}
						>
							Learn more about my background, experience, and what drives me as
							an engineer and leader.
						</Text>
						<RouterLink to="/about">
							<Button
								variant="outline"
								size="md"
								_hover={{ bg: "blue.50", borderColor: "blue.300" }}
							>
								Read More
							</Button>
						</RouterLink>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "green.200",
						}}
						transition="all 200ms ease"
					>
						<Box
							w={12}
							h={12}
							bg="green.100"
							borderRadius="xl"
							display="flex"
							alignItems="center"
							justifyContent="center"
							mx="auto"
							mb={4}
						>
							<Text
								fontSize="xl"
								color="green.600"
							>
								📝
							</Text>
						</Box>
						<Heading
							size="lg"
							mb={4}
							color="gray.800"
						>
							All Posts
						</Heading>
						<Text
							color={muted}
							mb={6}
							lineHeight={1.6}
						>
							Browse my complete collection of thoughts on engineering, AI, and
							technology.
						</Text>
						<RouterLink to="/blog">
							<Button
								variant="outline"
								size="md"
								_hover={{ bg: "green.50", borderColor: "green.300" }}
							>
								Browse Posts
							</Button>
						</RouterLink>
					</Card.Root>

					<Card.Root
						border="1px solid"
						borderColor="gray.200"
						p={8}
						borderRadius="2xl"
						textAlign="center"
						_hover={{
							shadow: "lg",
							transform: "translateY(-2px)",
							borderColor: "purple.200",
						}}
						transition="all 200ms ease"
					>
						<Box
							w={12}
							h={12}
							bg="purple.100"
							borderRadius="xl"
							display="flex"
							alignItems="center"
							justifyContent="center"
							mx="auto"
							mb={4}
						>
							<Text
								fontSize="xl"
								color="purple.600"
							>
								💬
							</Text>
						</Box>
						<Heading
							size="lg"
							mb={4}
							color="gray.800"
						>
							Get In Touch
						</Heading>
						<Text
							color={muted}
							mb={6}
							lineHeight={1.6}
						>
							Let's discuss engineering challenges, AI opportunities, or new
							projects.
						</Text>
						<VStack gap={3}>
							<CLink
								href="mailto:nick@karnik.io"
								display="inline-flex"
								alignItems="center"
								gap={2}
								px={6}
								py={3}
								bg="purple.500"
								color="white"
								borderRadius="lg"
								_hover={{ bg: "purple.600", transform: "translateY(-1px)" }}
								fontSize="md"
								fontWeight="medium"
								shadow="md"
							>
								<FiMail />
								Email Me
							</CLink>
							<CLink
								href="/resume.pdf"
								target="_blank"
								display="inline-flex"
								alignItems="center"
								gap={2}
								px={6}
								py={3}
								border="2px solid"
								borderColor="purple.500"
								color="purple.500"
								borderRadius="lg"
								_hover={{ bg: "purple.50", transform: "translateY(-1px)" }}
								fontSize="md"
								fontWeight="medium"
							>
								<FiExternalLink />
								Download Resume
							</CLink>
						</VStack>
					</Card.Root>
				</SimpleGrid>
			</Box>
		</>
	);
}
