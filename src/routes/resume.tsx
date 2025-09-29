import { createFileRoute } from "@tanstack/react-router";
import {
	Box,
	Heading,
	Text,
	HStack,
	VStack,
	Avatar,
	Button,
	Link as CLink,
	SimpleGrid,
	Card,
	Tag,
	Separator,
	useToken,
	Badge,
	Flex,
} from "@chakra-ui/react";
import {
	FiMail,
	FiExternalLink,
	FiDownload,
	FiMapPin,
	FiCalendar,
} from "react-icons/fi";

export const Route = createFileRoute("/resume")({
	component: ResumePage,
});

function ResumePage() {
	const accent = "blue.600";
	const cardBorder = useToken("colors", "gray.200");
	const muted = useToken("colors", "gray.600");

	return (
		<Box
			maxW="4xl"
			mx="auto"
			p={6}
		>
			<head>
				<title>Resume — Nick Karnik</title>
				<meta
					name="description"
					content="Nick Karnik - Engineer and Engineering Manager specializing in TypeScript, React, and Developer Experience"
				/>
				<link
					rel="canonical"
					href="https://nick.karnik.io/resume"
				/>
			</head>

			{/* Header */}
			<Card.Root
				border="1px solid"
				borderColor={cardBorder}
				p={8}
				borderRadius="2xl"
				mb={8}
			>
				<HStack
					justify="space-between"
					align="start"
					wrap="wrap"
					gap={6}
				>
					<HStack
						gap={6}
						align="start"
					>
						<Avatar
							name="Nick Karnik"
							size="2xl"
						/>
						<VStack
							align="start"
							spacing={2}
						>
							<Heading size="xl">Nick Karnik</Heading>
							<Text
								fontSize="lg"
								color={muted}
							>
								Engineer & Engineering Manager
							</Text>
							<HStack
								gap={2}
								wrap="wrap"
							>
								<Tag
									size="md"
									variant="subtle"
									colorScheme="blue"
								>
									TypeScript
								</Tag>
								<Tag
									size="md"
									variant="subtle"
									colorScheme="green"
								>
									React
								</Tag>
								<Tag
									size="md"
									variant="subtle"
									colorScheme="purple"
								>
									DX
								</Tag>
								<Tag
									size="md"
									variant="subtle"
									colorScheme="orange"
								>
									AI
								</Tag>
							</HStack>
						</VStack>
					</HStack>
					<VStack
						align="end"
						gap={3}
					>
						<Button
							as={CLink}
							href="/assets/Resume_Nick_Karnik_Sep_2025.pdf"
							leftIcon={<FiDownload />}
							colorScheme="blue"
							variant="outline"
						>
							Download PDF
						</Button>
						<HStack gap={2}>
							<Button
								as={CLink}
								href="mailto:nick@karnik.io"
								leftIcon={<FiMail />}
								size="sm"
								variant="ghost"
							>
								Email
							</Button>
							<Button
								as={CLink}
								href="https://www.linkedin.com/in/theoutlander"
								isExternal
								leftIcon={<FiExternalLink />}
								size="sm"
								variant="ghost"
							>
								LinkedIn
							</Button>
						</HStack>
					</VStack>
				</HStack>
			</Card.Root>

			{/* Main Content */}
			<SimpleGrid
				columns={{ base: 1, lg: 3 }}
				gap={8}
			>
				{/* Left Column - Experience */}
				<Box gridColumn={{ lg: "span 2" }}>
					{/* Experience */}
					<Card.Root
						border="1px solid"
						borderColor={cardBorder}
						p={6}
						borderRadius="2xl"
						mb={6}
					>
						<Heading
							size="lg"
							mb={6}
							color={accent}
						>
							Experience
						</Heading>

						{/* Current Role */}
						<Box mb={6}>
							<HStack
								justify="space-between"
								align="start"
								mb={2}
							>
								<VStack
									align="start"
									spacing={1}
								>
									<Heading size="md">Engineering Advisor</Heading>
									<Text
										color={muted}
										fontSize="sm"
									>
										Plutonic Consulting
									</Text>
								</VStack>
								<Badge
									colorScheme="green"
									variant="subtle"
								>
									Current
								</Badge>
							</HStack>
							<Text
								fontSize="sm"
								color={muted}
								mb={3}
							>
								Sep 2024 - Present
							</Text>
							<Text mb={3}>
								Advising founders on pragmatic AI integration and developer
								experience optimization. Helping teams move faster with clear
								product bets, strong execution, and maintainable systems.
							</Text>
							<HStack
								wrap="wrap"
								gap={2}
							>
								{[
									"AI Strategy",
									"Technical Leadership",
									"Product Development",
									"Team Building",
								].map((skill) => (
									<Tag
										key={skill}
										size="sm"
										variant="outline"
									>
										{skill}
									</Tag>
								))}
							</HStack>
						</Box>

						<Separator my={6} />

						{/* Previous Roles */}
						<Box mb={6}>
							<HStack
								justify="space-between"
								align="start"
								mb={2}
							>
								<VStack
									align="start"
									spacing={1}
								>
									<Heading size="md">Senior Engineering Manager</Heading>
									<Text
										color={muted}
										fontSize="sm"
									>
										Previous Company
									</Text>
								</VStack>
							</HStack>
							<Text
								fontSize="sm"
								color={muted}
								mb={3}
							>
								Jan 2022 - Aug 2024
							</Text>
							<Text mb={3}>
								Led engineering teams building scalable web applications.
								Focused on developer experience, code quality, and team
								productivity improvements.
							</Text>
							<HStack
								wrap="wrap"
								gap={2}
							>
								{[
									"Team Leadership",
									"React",
									"Node.js",
									"TypeScript",
									"AWS",
								].map((skill) => (
									<Tag
										key={skill}
										size="sm"
										variant="outline"
									>
										{skill}
									</Tag>
								))}
							</HStack>
						</Box>

						<Separator my={6} />

						<Box>
							<HStack
								justify="space-between"
								align="start"
								mb={2}
							>
								<VStack
									align="start"
									spacing={1}
								>
									<Heading size="md">Senior Software Engineer</Heading>
									<Text
										color={muted}
										fontSize="sm"
									>
										Previous Company
									</Text>
								</VStack>
							</HStack>
							<Text
								fontSize="sm"
								color={muted}
								mb={3}
							>
								Mar 2020 - Dec 2021
							</Text>
							<Text mb={3}>
								Built and maintained high-performance web applications.
								Contributed to architecture decisions and mentored junior
								developers.
							</Text>
							<HStack
								wrap="wrap"
								gap={2}
							>
								{["JavaScript", "React", "GraphQL", "PostgreSQL", "Docker"].map(
									(skill) => (
										<Tag
											key={skill}
											size="sm"
											variant="outline"
										>
											{skill}
										</Tag>
									)
								)}
							</HStack>
						</Box>
					</Card.Root>

					{/* Projects */}
					<Card.Root
						border="1px solid"
						borderColor={cardBorder}
						p={6}
						borderRadius="2xl"
						mb={6}
					>
						<Heading
							size="lg"
							mb={6}
							color={accent}
						>
							Notable Projects
						</Heading>

						<Box mb={4}>
							<Heading
								size="md"
								mb={2}
							>
								Developer Experience Platform
							</Heading>
							<Text
								fontSize="sm"
								color={muted}
								mb={2}
							>
								2023 - 2024
							</Text>
							<Text mb={3}>
								Built a comprehensive DX platform that reduced developer
								onboarding time by 60% and improved code quality metrics across
								the organization.
							</Text>
							<HStack
								wrap="wrap"
								gap={2}
							>
								{["TypeScript", "Vite", "Chakra UI", "Monorepo", "CI/CD"].map(
									(tech) => (
										<Tag
											key={tech}
											size="sm"
											variant="subtle"
										>
											{tech}
										</Tag>
									)
								)}
							</HStack>
						</Box>

						<Separator my={4} />

						<Box>
							<Heading
								size="md"
								mb={2}
							>
								AI-Powered Code Review Tool
							</Heading>
							<Text
								fontSize="sm"
								color={muted}
								mb={2}
							>
								2024
							</Text>
							<Text mb={3}>
								Developed an AI tool that automates code review processes,
								reducing review time by 40% while maintaining high code quality
								standards.
							</Text>
							<HStack
								wrap="wrap"
								gap={2}
							>
								{[
									"OpenAI API",
									"React",
									"Node.js",
									"GitHub API",
									"Machine Learning",
								].map((tech) => (
									<Tag
										key={tech}
										size="sm"
										variant="subtle"
									>
										{tech}
									</Tag>
								))}
							</HStack>
						</Box>
					</Card.Root>
				</Box>

				{/* Right Column - Skills & Info */}
				<VStack
					align="stretch"
					gap={6}
				>
					{/* Skills */}
					<Card.Root
						border="1px solid"
						borderColor={cardBorder}
						p={6}
						borderRadius="2xl"
					>
						<Heading
							size="lg"
							mb={4}
							color={accent}
						>
							Technical Skills
						</Heading>

						<VStack
							align="stretch"
							gap={4}
						>
							<Box>
								<Text
									fontWeight="semibold"
									mb={2}
								>
									Languages
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{["TypeScript", "JavaScript", "Python", "SQL"].map((lang) => (
										<Tag
											key={lang}
											size="sm"
											variant="outline"
										>
											{lang}
										</Tag>
									))}
								</HStack>
							</Box>

							<Box>
								<Text
									fontWeight="semibold"
									mb={2}
								>
									Frontend
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{["React", "Next.js", "Vite", "Chakra UI", "Tailwind"].map(
										(tech) => (
											<Tag
												key={tech}
												size="sm"
												variant="outline"
											>
												{tech}
											</Tag>
										)
									)}
								</HStack>
							</Box>

							<Box>
								<Text
									fontWeight="semibold"
									mb={2}
								>
									Backend
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{["Node.js", "Express", "GraphQL", "PostgreSQL", "Redis"].map(
										(tech) => (
											<Tag
												key={tech}
												size="sm"
												variant="outline"
											>
												{tech}
											</Tag>
										)
									)}
								</HStack>
							</Box>

							<Box>
								<Text
									fontWeight="semibold"
									mb={2}
								>
									Tools & Platforms
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{["AWS", "Docker", "Git", "GitHub Actions", "Vercel"].map(
										(tool) => (
											<Tag
												key={tool}
												size="sm"
												variant="outline"
											>
												{tool}
											</Tag>
										)
									)}
								</HStack>
							</Box>
						</VStack>
					</Card.Root>

					{/* Education */}
					<Card.Root
						border="1px solid"
						borderColor={cardBorder}
						p={6}
						borderRadius="2xl"
					>
						<Heading
							size="lg"
							mb={4}
							color={accent}
						>
							Education
						</Heading>

						<Box>
							<Heading
								size="md"
								mb={1}
							>
								Bachelor of Science
							</Heading>
							<Text
								color={muted}
								fontSize="sm"
								mb={2}
							>
								Computer Science
							</Text>
							<Text
								fontSize="sm"
								color={muted}
							>
								2016 - 2020
							</Text>
						</Box>
					</Card.Root>

					{/* Contact */}
					<Card.Root
						border="1px solid"
						borderColor={cardBorder}
						p={6}
						borderRadius="2xl"
					>
						<Heading
							size="lg"
							mb={4}
							color={accent}
						>
							Contact
						</Heading>

						<VStack
							align="stretch"
							gap={3}
						>
							<Button
								as={CLink}
								href="mailto:nick@karnik.io"
								leftIcon={<FiMail />}
								variant="outline"
								justifyContent="start"
							>
								nick@karnik.io
							</Button>
							<Button
								as={CLink}
								href="https://www.linkedin.com/in/theoutlander"
								isExternal
								leftIcon={<FiExternalLink />}
								variant="outline"
								justifyContent="start"
							>
								LinkedIn
							</Button>
							<Button
								as={CLink}
								href="https://github.com/theoutlander"
								isExternal
								leftIcon={<FiExternalLink />}
								variant="outline"
								justifyContent="start"
							>
								GitHub
							</Button>
							<Button
								as={CLink}
								href="https://calendly.com/nick-karnik"
								isExternal
								leftIcon={<FiCalendar />}
								variant="outline"
								justifyContent="start"
							>
								Schedule Call
							</Button>
						</VStack>
					</Card.Root>
				</VStack>
			</SimpleGrid>

			{/* Footer */}
			<Box
				textAlign="center"
				mt={10}
				color={muted}
				fontSize="sm"
			>
				© {new Date().getFullYear()} Nick Karnik
			</Box>
		</Box>
	);
}
