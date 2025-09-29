import { createFileRoute } from "@tanstack/react-router";
import {
	Box,
	Heading,
	Text,
	HStack,
	VStack,
	Avatar,
	Link as CLink,
	SimpleGrid,
	Card,
	Tag,
	Separator,
	useToken,
	Badge,
} from "@chakra-ui/react";
import { FiMail, FiExternalLink, FiDownload, FiCalendar } from "react-icons/fi";
import { Helmet } from "react-helmet-async";

export const Route = createFileRoute("/resume")({
	component: ResumePage,
});

function ResumePage() {
	const accent = "blue.600";
	const cardBorder = useToken("colors", "gray.200");
	const muted = useToken("colors", "gray.600");

	return (
		<>
			<Helmet>
				<title>Resume — Nick Karnik</title>
				<meta
					name="description"
					content="Nick Karnik - Engineer and Engineering Manager specializing in TypeScript, React, and Developer Experience"
				/>
				<link
					rel="canonical"
					href="https://nick.karnik.io/resume"
				/>
			</Helmet>
			<Box
				maxW="4xl"
				mx="auto"
				p={6}
			>
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
							<Avatar.Root size="2xl">
								<Avatar.Image
									src={undefined}
									alt="Nick Karnik"
								/>
								<Avatar.Fallback>NK</Avatar.Fallback>
							</Avatar.Root>
							<VStack
								align="start"
								gap={2}
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
									<Tag.Root
										size="md"
										variant="subtle"
										colorPalette="blue"
									>
										TypeScript
									</Tag.Root>
									<Tag.Root
										size="md"
										variant="subtle"
										colorPalette="green"
									>
										React
									</Tag.Root>
									<Tag.Root
										size="md"
										variant="subtle"
										colorPalette="purple"
									>
										DX
									</Tag.Root>
									<Tag.Root
										size="md"
										variant="subtle"
										colorPalette="orange"
									>
										AI
									</Tag.Root>
								</HStack>
							</VStack>
						</HStack>
						<VStack
							align="end"
							gap={3}
						>
							<CLink
								href="/assets/Resume_Nick_Karnik_Sep_2025.pdf"
								target="_blank"
								display="inline-flex"
								alignItems="center"
								gap={2}
								px={4}
								py={2}
								border="1px solid"
								borderColor="blue.200"
								borderRadius="md"
								color="blue.600"
								_hover={{ bg: "blue.50" }}
							>
								<FiDownload />
								Download PDF
							</CLink>
							<HStack gap={2}>
								<CLink
									href="mailto:nick@karnik.io"
									display="inline-flex"
									alignItems="center"
									gap={2}
									px={3}
									py={2}
									borderRadius="md"
									color="gray.600"
									_hover={{ bg: "gray.50" }}
								>
									<FiMail />
									Email
								</CLink>
								<CLink
									href="https://www.linkedin.com/in/theoutlander"
									target="_blank"
									display="inline-flex"
									alignItems="center"
									gap={2}
									px={3}
									py={2}
									borderRadius="md"
									color="gray.600"
									_hover={{ bg: "gray.50" }}
								>
									<FiExternalLink />
									LinkedIn
								</CLink>
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
										gap={1}
									>
										<Heading size="md">Founder & Fractional CTO</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Plutonic Consulting
										</Text>
									</VStack>
									<Badge
										colorPalette="green"
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
									May 2025 - Present
								</Text>
								<Text mb={3}>
									Providing fractional CTO support, AI strategy, and scaling
									guidance to founders. Helping teams move faster with clear
									product bets, strong execution, and systems that are simple to
									maintain. Focus on pragmatic AI integration and developer
									experience optimization.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"AI Strategy",
										"Technical Leadership",
										"Fractional CTO",
										"Team Scaling",
									].map((skill) => (
										<Tag.Root
											key={skill}
											size="sm"
											variant="outline"
										>
											{skill}
										</Tag.Root>
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
										gap={1}
									>
										<Heading size="md">
											Staff Software Engineer / Engineering Manager
										</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Google
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									May 2022 - Apr 2025
								</Text>
								<Text mb={3}>
									Led technical direction and hands-on engineering for Gemini
									Code Assist, integrated into VSCode and IntelliJ IDEs.
									Implemented a symbol table generator across multiple
									languages, increasing context for LLM, reducing tokens, and
									significantly improving code completion acceptance rates.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"Go",
										"TypeScript",
										"Node.js",
										"Kubernetes",
										"GCP",
										"LLM",
									].map((skill) => (
										<Tag.Root
											key={skill}
											size="sm"
											variant="outline"
										>
											{skill}
										</Tag.Root>
									))}
								</HStack>
							</Box>

							<Separator my={6} />

							<Box mb={6}>
								<HStack
									justify="space-between"
									align="start"
									mb={2}
								>
									<VStack
										align="start"
										gap={1}
									>
										<Heading size="md">Sr. Engineering Manager</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Tableau Software
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Oct 2019 - Apr 2022
								</Text>
								<Text mb={3}>
									Built a robust CI/CD pipeline (TACO) enabling over 100
									partners to test and deploy Tableau connectors efficiently.
									Delivered REST and native Salesforce connectors and owned the
									Web Data Connector platform. Managed a 17-person team.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"TypeScript",
										"Node.js",
										"Chromium",
										"CI/CD",
										"Team Leadership",
									].map((skill) => (
										<Tag.Root
											key={skill}
											size="sm"
											variant="outline"
										>
											{skill}
										</Tag.Root>
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
										gap={1}
									>
										<Heading size="md">Director Of Engineering</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											T-Mobile
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Nov 2018 - Oct 2019
								</Text>
								<Text mb={3}>
									Managed multiple Retail Mobility projects. Expanded the team
									in record time by hiring 25 diverse engineers within six
									weeks. Worked with Apple to implement remote device management
									across ~7500 T-Mobile stores.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"Team Leadership",
										"Rapid Hiring",
										"Apple Integration",
										"Retail Systems",
										"Project Management",
									].map((skill) => (
										<Tag.Root
											key={skill}
											size="sm"
											variant="outline"
										>
											{skill}
										</Tag.Root>
									))}
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
									Gemini Code Assist
								</Heading>
								<Text
									fontSize="sm"
									color={muted}
									mb={2}
								>
									2022 - 2025
								</Text>
								<Text mb={3}>
									Led technical direction and hands-on engineering for Google's
									AI coding assistant, integrated into VSCode and IntelliJ IDEs.
									Implemented a symbol table generator across multiple
									languages, increasing context for LLM, reducing tokens, and
									significantly improving code completion acceptance rates.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"Go",
										"TypeScript",
										"Node.js",
										"Kubernetes",
										"GCP",
										"LLM",
									].map((tech) => (
										<Tag.Root
											key={tech}
											size="sm"
											variant="subtle"
										>
											{tech}
										</Tag.Root>
									))}
								</HStack>
							</Box>

							<Separator my={4} />

							<Box mb={4}>
								<Heading
									size="md"
									mb={2}
								>
									TACO Toolkit & Connector SDK
								</Heading>
								<Text
									fontSize="sm"
									color={muted}
									mb={2}
								>
									2019 - 2022
								</Text>
								<Text mb={3}>
									Built a robust CI/CD pipeline (TACO) enabling over 100
									partners to test and deploy Tableau connectors efficiently.
									Created a Connector SDK widely adopted across Tableau's
									ecosystem, simplifying web data connector development.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"TypeScript",
										"Node.js",
										"Chromium",
										"CI/CD",
										"SDK Development",
									].map((tech) => (
										<Tag.Root
											key={tech}
											size="sm"
											variant="subtle"
										>
											{tech}
										</Tag.Root>
									))}
								</HStack>
							</Box>

							<Separator my={4} />

							<Box>
								<Heading
									size="md"
									mb={2}
								>
									RoomToday Platform
								</Heading>
								<Text
									fontSize="sm"
									color={muted}
									mb={2}
								>
									2014 - 2016
								</Text>
								<Text mb={3}>
									Co-founded and built a real-time, last-minute hotel booking
									platform. Raised $1.6M and led the acquisition by Simasindo
									and Northcliff Ventures. Developed mobile apps and real-time
									property management systems used by hotel partners across Asia
									and Europe.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"React Native",
										"Real-time Systems",
										"Mobile Apps",
										"Startup Leadership",
										"Fundraising",
									].map((tech) => (
										<Tag.Root
											key={tech}
											size="sm"
											variant="subtle"
										>
											{tech}
										</Tag.Root>
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
										{[
											"Go",
											"TypeScript",
											"JavaScript",
											"C#",
											"C++",
											"Python",
										].map((lang) => (
											<Tag.Root
												key={lang}
												size="sm"
												variant="outline"
											>
												{lang}
											</Tag.Root>
										))}
									</HStack>
								</Box>

								<Box>
									<Text
										fontWeight="semibold"
										mb={2}
									>
										Frontend & Mobile
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"React",
											"React Native",
											"VSCode Extensions",
											"IntelliJ Extensions",
											"Chrome Extensions",
										].map((tech) => (
											<Tag.Root
												key={tech}
												size="sm"
												variant="outline"
											>
												{tech}
											</Tag.Root>
										))}
									</HStack>
								</Box>

								<Box>
									<Text
										fontWeight="semibold"
										mb={2}
									>
										Backend & Cloud
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Node.js",
											"Kubernetes",
											"Google Cloud",
											"Azure",
											"GraphQL",
											"PostgreSQL",
										].map((tech) => (
											<Tag.Root
												key={tech}
												size="sm"
												variant="outline"
											>
												{tech}
											</Tag.Root>
										))}
									</HStack>
								</Box>

								<Box>
									<Text
										fontWeight="semibold"
										mb={2}
									>
										AI & Leadership
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Large Language Models",
											"Generative AI",
											"Engineering Management",
											"Team Leadership",
											"CI/CD",
										].map((tool) => (
											<Tag.Root
												key={tool}
												size="sm"
												variant="outline"
											>
												{tool}
											</Tag.Root>
										))}
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
									Computer Science
								</Heading>
								<Text
									color={muted}
									fontSize="sm"
									mb={2}
								>
									Self-directed learning and industry experience
								</Text>
								<Text
									fontSize="sm"
									color={muted}
								>
									Ongoing
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
								<CLink
									href="mailto:nick@karnik.io"
									display="flex"
									alignItems="center"
									gap={2}
									px={4}
									py={2}
									border="1px solid"
									borderColor="gray.200"
									borderRadius="md"
									justifyContent="start"
									_hover={{ bg: "gray.50" }}
								>
									<FiMail />
									nick@karnik.io
								</CLink>
								<CLink
									href="https://www.linkedin.com/in/theoutlander"
									target="_blank"
									display="flex"
									alignItems="center"
									gap={2}
									px={4}
									py={2}
									border="1px solid"
									borderColor="gray.200"
									borderRadius="md"
									justifyContent="start"
									_hover={{ bg: "gray.50" }}
								>
									<FiExternalLink />
									LinkedIn
								</CLink>
								<CLink
									href="https://github.com/theoutlander"
									target="_blank"
									display="flex"
									alignItems="center"
									gap={2}
									px={4}
									py={2}
									border="1px solid"
									borderColor="gray.200"
									borderRadius="md"
									justifyContent="start"
									_hover={{ bg: "gray.50" }}
								>
									<FiExternalLink />
									GitHub
								</CLink>
								<CLink
									href="https://calendly.com/nick-karnik"
									target="_blank"
									display="flex"
									alignItems="center"
									gap={2}
									px={4}
									py={2}
									border="1px solid"
									borderColor="gray.200"
									borderRadius="md"
									justifyContent="start"
									_hover={{ bg: "gray.50" }}
								>
									<FiCalendar />
									Schedule Call
								</CLink>
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
		</>
	);
}
