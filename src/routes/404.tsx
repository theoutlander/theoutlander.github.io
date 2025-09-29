import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Box,
	Container,
	VStack,
	Heading,
	Text,
	Button,
	HStack,
	Icon,
	Center,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

// Fun 404 illustrations using Chakra UI components
const NotFoundIllustration = () => {
	return (
		<Box
			position="relative"
			w="full"
			maxW="400px"
			mx="auto"
		>
			{/* Main 404 text with fun styling */}
			<Center>
				<VStack gap={4}>
					<Box
						animation="scaleIn 0.8s ease-out 0.2s both"
						transformOrigin="center"
					>
						<Heading
							size="4xl"
							fontWeight="bold"
							bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
							bgClip="text"
							textAlign="center"
							fontFamily="mono"
						>
							404
						</Heading>
					</Box>

					{/* Fun floating elements */}
					<Box
						position="relative"
						w="200px"
						h="100px"
					>
						<Box
							position="absolute"
							top="20px"
							left="20px"
							w="20px"
							h="20px"
							bg="blue.300"
							borderRadius="50%"
							animation="fadeInFloat 0.6s ease-out 0.5s both, float 3s ease-in-out infinite 1s"
						/>
						<Box
							position="absolute"
							top="40px"
							right="30px"
							w="15px"
							h="15px"
							bg="purple.300"
							borderRadius="50%"
							animation="fadeInFloat 0.6s ease-out 0.7s both, float 3s ease-in-out infinite 2s"
						/>
						<Box
							position="absolute"
							bottom="20px"
							left="50px"
							w="12px"
							h="12px"
							bg="pink.300"
							borderRadius="50%"
							animation="fadeInFloat 0.6s ease-out 0.9s both, float 3s ease-in-out infinite 3s"
						/>
					</Box>
				</VStack>
			</Center>

			{/* CSS for animations */}
			<style>
				{`
					@keyframes scaleIn {
						0% { 
							opacity: 0
							transform: scale(0.8);
						}
						100% { 
							opacity: 1
							transform: scale(1)
						}
					}
					@keyframes fadeInFloat {
						0% { 
							opacity: 0
							transform: translateY(20px);
						}
						100% { 
							opacity: 1
							transform: translateY(0);
						}
					}
					@keyframes fadeInUp {
						0% { 
							opacity: 0
							transform: translateY(30px);
						}
						100% { 
							opacity: 1
							transform: translateY(0);
						}
					}
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-20px); }
					}
				`}
			</style>
		</Box>
	);
};

const FunMessages = [
	"Oops! This page went on a coffee break ☕",
	"Looks like this page got lost in the digital void 🚀",
	"This page is playing hide and seek... and winning! 🎯",
	"The page you're looking for has been abducted by aliens 👽",
	"This page decided to take a vacation to the Bahamas 🏝️",
	"404: Page not found, but we found this cool message instead! 🎉",
	"This page is currently attending a virtual conference 📹",
	"The page you seek has been moved to a parallel universe 🌌",
];

const HelpfulSuggestions = [
	{ text: "Check the URL for typos", icon: "🔍" },
	{ text: "Go back to the homepage", icon: "🏠" },
	{ text: "Browse our blog posts", icon: "📝" },
	{ text: "Learn more about me", icon: "👨‍💻" },
];

export const Route = createFileRoute("/404")({
	component: function NotFoundPage() {
		const randomMessage =
			FunMessages[Math.floor(Math.random() * FunMessages.length)];

		return (
			<>
				<Helmet>
					<title>Lost in Space | Nick Karnik</title>
					<meta
						name="description"
						content="Looks like you've wandered into the digital void! Let's get you back on track."
					/>
					<meta
						name="robots"
						content="noindex, nofollow"
					/>
				</Helmet>

				<Container
					maxW="4xl"
					py={20}
				>
					<VStack
						gap={12}
						align="center"
					>
						{/* Fun 404 illustration */}
						<NotFoundIllustration />

						{/* Main content */}
						<VStack
							gap={6}
							textAlign="center"
							maxW="2xl"
						>
							<Box animation="fadeInUp 0.6s ease-out 0.3s both">
								<Heading
									size="xl"
									color="gray.600"
								>
									{randomMessage}
								</Heading>
							</Box>

							<Box animation="fadeInUp 0.6s ease-out 0.5s both">
								<Text
									fontSize="lg"
									color="gray.500"
									lineHeight="tall"
								>
									Don't worry, even the best developers encounter 404s! Let's
									get you back to something more interesting.
								</Text>
							</Box>
						</VStack>

						{/* Action buttons */}
						<Box animation="fadeInUp 0.6s ease-out 0.7s both">
							<VStack
								gap={4}
								w="full"
								maxW="md"
							>
								<HStack
									gap={4}
									wrap="wrap"
									justify="center"
								>
									<Link to="/">
										<Button
											colorScheme="blue"
											size="lg"
										>
											<Icon
												viewBox="0 0 24 24"
												boxSize={5}
												mr={2}
											>
												<path
													fill="currentColor"
													d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
												/>
											</Icon>
											Go Home
										</Button>
									</Link>
									<Link to="/blog">
										<Button
											variant="outline"
											size="lg"
										>
											<Icon
												viewBox="0 0 24 24"
												boxSize={5}
												mr={2}
											>
												<path
													fill="currentColor"
													d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
												/>
											</Icon>
											Read Blog
										</Button>
									</Link>
								</HStack>

								<Link to="/about">
									<Button
										variant="ghost"
										size="md"
									>
										<Icon
											viewBox="0 0 24 24"
											boxSize={4}
											mr={2}
										>
											<path
												fill="currentColor"
												d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
											/>
										</Icon>
										About Me
									</Button>
								</Link>
							</VStack>
						</Box>

						{/* Helpful suggestions */}
						<Box
							animation="fadeInUp 0.6s ease-out 0.9s both"
							bg="white"
							p={6}
							borderRadius="xl"
							boxShadow="lg"
							w="full"
							maxW="md"
						>
							<VStack gap={4}>
								<Heading
									size="sm"
									color="gray.600"
								>
									💡 Quick Tips
								</Heading>
								<VStack
									gap={2}
									align="start"
									w="full"
								>
									{HelpfulSuggestions.map((suggestion, index) => (
										<HStack
											key={index}
											gap={3}
										>
											<Text fontSize="lg">{suggestion.icon}</Text>
											<Text
												fontSize="sm"
												color="gray.600"
											>
												{suggestion.text}
											</Text>
										</HStack>
									))}
								</VStack>
							</VStack>
						</Box>

						{/* Fun footer message */}
						<Box animation="fadeInUp 0.6s ease-out 1.1s both">
							<Text
								fontSize="sm"
								color="gray.400"
								textAlign="center"
							>
								P.S. If you're a developer, you probably know this feeling all
								too well! 😅
							</Text>
						</Box>
					</VStack>
				</Container>
			</>
		);
	},
});
