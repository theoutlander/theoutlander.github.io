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

// Company logo component
function CompanyLogo({
	company,
	size = "20px",
}: {
	company: string;
	size?: string;
}) {
	const logoStyle = {
		width: size,
		height: size,
		display: "inline-block",
		objectFit: "contain" as const,
		borderRadius: "6px",
	};

	const logos: Record<string, React.ReactElement> = {
		google: (
			<img
				src="/assets/images/companies/google.svg"
				alt="Google"
				style={logoStyle}
			/>
		),
		microsoft: (
			<img
				src="/assets/images/companies/microsoft.svg"
				alt="Microsoft"
				style={logoStyle}
			/>
		),
		salesforce: (
			<img
				src="/assets/images/companies/salesforce.svg"
				alt="Salesforce"
				style={logoStyle}
			/>
		),
		ycombinator: (
			<img
				src="/assets/images/companies/ycombinator.svg"
				alt="Y Combinator"
				style={logoStyle}
			/>
		),
		umd: (
			<img
				src="/assets/images/companies/umd.svg"
				alt="University of Maryland"
				style={logoStyle}
			/>
		),
		gates: (
			<img
				src="/assets/images/companies/gates.svg"
				alt="Gates Foundation"
				style={logoStyle}
			/>
		),
		tmobile: (
			<img
				src="/assets/images/companies/tmobile.svg"
				alt="T-Mobile"
				style={logoStyle}
			/>
		),
		tableau: (
			<img
				src="/assets/images/companies/tableau.svg"
				alt="Tableau"
				style={logoStyle}
			/>
		),
		jobbatical: (
			<img
				src="/assets/images/companies/jobbatical.svg"
				alt="Jobbatical"
				style={logoStyle}
			/>
		),
		treasure: (
			<img
				src="/assets/images/companies/treasure.svg"
				alt="Treasure Technologies"
				style={logoStyle}
			/>
		),
		penseev: (
			<img
				src="/assets/images/companies/penseev.svg"
				alt="Penseev"
				style={logoStyle}
			/>
		),
		compass: (
			<img
				src="/assets/images/companies/compass.svg"
				alt="Compass Technologies"
				style={logoStyle}
			/>
		),
	};

	const logo = logos[company.toLowerCase()];
	if (!logo) return null;

	return logo;
}

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
					content="Nick Karnik - Staff Software Engineer & Engineering Leader with 25+ years building scalable platforms at Google, Microsoft, Salesforce, Tableau, and startups"
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
									src="/assets/images/profile/nick-karnik.jpeg"
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
									Staff Software Engineer & Engineering Leader
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
										Developer Experience
									</Tag.Root>
									<Tag.Root
										size="md"
										variant="subtle"
										colorPalette="teal"
									>
										NodeJS
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
								href="/resume.pdf"
								target="_blank"
								download="resume-nick-karnik.pdf"
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
							<CompanyLogo
								company="google"
								size="180px"
								align="center"
								content="center"
							/>
							{/* Previous Roles */}
							<HStack
								align="start"
								gap={6}
								mb={6}
							>
								<Box
									flex={1}
									p={6}
								>
									<VStack
										align="start"
										gap={1}
										mb={2}
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
							</HStack>

							<Separator my={6} />

							<HStack gap={3} justify="center" mb={4}>
								<CompanyLogo
									company="salesforce"
									size="180px"
								/>
								<CompanyLogo
									company="tableau"
									size="180px"
								/>
							</HStack>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">Senior Engineering Manager</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Salesforce (Tableau – Connectivity Platform)
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Oct 2019 - Apr 2022
									</Text>
									<Text mb={3}>
										Built CI pipeline (TACO) enabling 100+ partners to test
										connectors across Tableau/Salesforce stack. Delivered REST
										and native Salesforce connectors; owned Web Data Connector
										platform. Managed a team of 35+; drove hiring, mentoring,
										and technical strategy. Created Connector SDK adopted across
										the Tableau ecosystem.
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
							</HStack>

							<Separator my={6} />

							<Box display="flex" justify="center" mb={4}>
								<CompanyLogo
									company="tmobile"
									size="180px"
								/>
							</Box>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">Director Of Engineering</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Streamline Digital at T-Mobile
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Nov 2018 - Oct 2019
									</Text>
									<Text mb={3}>
										Hired a diverse team of 25 engineers in six weeks; managed
										four product teams totaling 35+ engineers across T-Mobile
										Retail Mobility. Delivered custom desktop & mobile
										applications for the T-Mobile / Sprint merger. Architected
										and implemented a portable Test Automation Framework that
										runs in-app.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Team Leadership",
											"Rapid Hiring",
											"Mobile Development",
											"Test Automation",
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
							</HStack>

							<Separator my={6} />

							<Box 
								flex={1}
								p={6}
								mb={6}
							>
								<VStack
									align="start"
									gap={1}
									mb={2}
								>
									<Heading size="md">Principal / Founder</Heading>
									<Text
										color={muted}
										fontSize="sm"
									>
										Fullstack Consulting
									</Text>
								</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Mar 2018 - Nov 2018
									</Text>
									<Text mb={3}>
										Trained 100+ students in React, Node, GraphQL; created
										technical content for YouTube and dev.to. Consulted on MVPs
										and scale-up projects with clients including Hims, ForHers,
										CopBot, and Sensei Ag. Built and delivered mobile
										applications using React Native for early-stage clients.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"React Native",
											"GraphQL",
											"Training",
											"Consulting",
											"Mobile Apps",
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
							</HStack>

							<Separator my={6} />

							<Box display="flex" justify="center" mb={4}>
								<CompanyLogo
									company="treasure"
									size="180px"
								/>
							</Box>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">CTO</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Treasure Technologies
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Sep 2017 - Mar 2018
									</Text>
									<Text mb={3}>
										Built a fin-tech analytics product integrating with banks
										via Plaid and custom APIs. Accepted into Nasdaq
										Entrepreneurial Program; led engineering and technical
										vision.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"FinTech",
											"Plaid API",
											"Banking Integration",
											"Technical Leadership",
											"Startup",
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
							</HStack>

							<Separator my={6} />

							<Box display="flex" justify="center" mb={4}>
								<CompanyLogo
									company="jobbatical"
									size="180px"
								/>
							</Box>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">CTO</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Jobbatical
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Apr 2017 - Aug 2017
									</Text>
									<Text mb={3}>
										Migrated monolith to microservices; rebuilt CI/CD,
										monitoring, and deployment pipelines. Led platform
										modernization and org scaling during growth phase.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Microservices",
											"CI/CD",
											"Platform Architecture",
											"DevOps",
											"Scaling",
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
							</HStack>

							<Separator my={6} />

							<Box display="flex" justify="center" mb={4}>
								<CompanyLogo
									company="penseev"
									size="180px"
								/>
							</Box>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">Technical Architect</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Penseev
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										May 2011 - Oct 2016
									</Text>
									<Text mb={3}>
										Technical architect for Shoebox, a digital memories platform
										that aggregates social and personal data, allowing users to
										search through time-based content and maintain passive
										journals. Built ability to index any data source with
										time-based browsing and sharing capabilities.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Data Aggregation",
											"Search Technology",
											"Social Data",
											"Time-based Browsing",
											"Platform Architecture",
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
							</HStack>

							<Separator my={6} />

							<Box display="flex" justify="center" mb={4}>
								<CompanyLogo
									company="gates"
									size="180px"
								/>
							</Box>
							<Box 
								flex={1}
								p={6}
							>
									<VStack
										align="start"
										gap={1}
										mb={2}
									>
										<Heading size="md">Senior Software Engineer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											IDM (IV Labs, now part of Gates Foundation)
										</Text>
									</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Sep 2012 - Oct 2016
									</Text>
									<Text mb={3}>
										Built simulation and visualization tools for malaria, HIV,
										TB, polio, and more. Developed software and spatial models
										featured in Bill Gates' TED Talk "The next outbreak? We're
										not ready." Collaborated with organizations like WHO,
										ministries of health, NGOs, and universities.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"Data Visualization",
											"Simulation",
											"Global Health",
											"Scientific Computing",
											"WHO Collaboration",
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
							</HStack>

							<Separator my={6} />

							<Box 
								flex={1}
								p={6}
								mb={6}
							>
								<VStack
									align="start"
									gap={1}
									mb={2}
								>
									<Heading size="md">Software Engineer</Heading>
									<Text
										color={muted}
										fontSize="sm"
									>
										Blue Hippo Funding
									</Text>
								</VStack>
									<Text
										fontSize="sm"
										color={muted}
										mb={3}
									>
										Jul 2003 - Oct 2003
									</Text>
									<Text mb={3}>
										Developed CRM system in VB.NET, C#, and ASP.NET using SQL
										2000. Focused on UI ergonomics and data access design
										patterns. Built service to monitor orders and dynamically
										generate PDF files for warehouse printing. Integrated with
										Cisco Phone Switch for call tracking.
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"VB.NET",
											"C#",
											"ASP.NET",
											"SQL Server",
											"CRM Systems",
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
							</HStack>

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
										<Heading size="md">Software Engineer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											The Globalist
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Jan 2002 - Jul 2003
								</Text>
								<Text mb={3}>
									Developed CRM system in C# using SQL Server 2000. Gathered
									requirements from end users and designed ergonomic UI for
									business and contact data access. Integrated task and
									appointment scheduler with Microsoft Outlook. Built error
									reporting system with XML web service integration.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"C#",
										"SQL Server",
										"Outlook Integration",
										"Crystal Reports",
										"XML Web Services",
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
										<Heading size="md">Web Application Developer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Meds Publishing
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									May 2000 - May 2001
								</Text>
								<Text mb={3}>
									Converted VB 6 applications to ASP applications. Gained early
									experience in web development and application modernization.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"VB 6",
										"ASP",
										"Web Development",
										"Application Migration",
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
										<Heading size="md">Web Developer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											University of Maryland - Engineering Research Center
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Oct 1999 - May 2000
								</Text>
								<Text mb={3}>
									Designed, implemented and tested a faculty expertise
									management tool in ASP using Access 2000. Maintained
									Engineering Research Center's website during undergraduate
									studies.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"ASP",
										"Access 2000",
										"Web Development",
										"Database Design",
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
										<Heading size="md">Lead Software Engineer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Compass Technologies
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Nov 2005 - Aug 2006
								</Text>
								<Text mb={3}>
									Architected and developed next-generation Access Control
									Security System (165,000 lines of code) for enterprise and
									educational institutions. Optimized real-time alarm processing
									from 20,000 to 150,000 transactions per hour. Led team
									expansion and retained $4+ million in business through product
									demonstrations and technical leadership.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"C++",
										"C#",
										"TCP/IP",
										"Distributed Systems",
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
										<CompanyLogo
											company="microsoft"
											size="60px"
										/>
										<Heading size="md">Software Development Engineer</Heading>
										<Text
											color={muted}
											fontSize="sm"
										>
											Microsoft (Bing & Exchange)
										</Text>
									</VStack>
								</HStack>
								<Text
									fontSize="sm"
									color={muted}
									mb={3}
								>
									Aug 2006 - Aug 2012
								</Text>
								<Text mb={3}>
									Led multiple Bing teams including Bing Together, Task
									Framework, Ecosystem, Core Answers, Seasonal Answers,
									Structured Data, Commerce Relevance, and Commerce Data
									Pipeline. Architected Big Data Validation Framework
									(Engineering Excellence Award Nominee). Built JS memory
									profiling tools for Outlook Web Access; developed Naive Bayes
									sentiment classifiers for Bing Shopping. Designed and
									implemented tools that simplified common tasks including UX &
									PBXML Browser, Related KIF Generator, Automated Property Bag
									Validator, and Single Box Setup.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"Big Data",
										"JavaScript",
										"Machine Learning",
										"Outlook Web Access",
										"Bing",
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

							<Box mb={4}>
								<CompanyLogo
									company="ycombinator"
									size="60px"
								/>
								<Heading
									size="md"
									mb={2}
								>
									Videoly Platform
								</Heading>
								<Text
									fontSize="sm"
									color={muted}
									mb={2}
								>
									2007 - 2009
								</Text>
								<Text mb={3}>
									Co-founded video mail platform allowing users to send video
									messages via webcam or upload existing videos through email
									accounts. Accepted into YCombinator 2007. Experimented with
									ad-based and paid revenue models for consumer space and B2B
									platform services.
								</Text>
								<HStack
									wrap="wrap"
									gap={2}
								>
									{[
										"Ruby on Rails",
										"Flex",
										"Amazon EC2/S3",
										"YCombinator",
										"Video Streaming",
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
											"TypeScript",
											"JavaScript",
											"Python",
											"C#",
											"Go",
											"C++",
											"Java",
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
										Web & Mobile
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"NodeJS",
											"Electron",
											"Express",
											"React",
											"React Native",
											"GraphQL",
											"Playwright",
											"VSCode Extensions",
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
										Databases & Cloud
									</Text>
									<HStack
										wrap="wrap"
										gap={2}
									>
										{[
											"MongoDB",
											"Docker",
											"ElasticSearch",
											"Neo4J",
											"PostgreSQL",
											"Redis",
											"SQL Server",
											"AWS",
											"Google Cloud",
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
											"AI-Assisted Development",
											"Large Language Models",
											"Developer Tooling",
											"Platform Architecture",
											"Scalable Systems",
											"Full-Stack Engineering",
											"Mobile Development",
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
								<CompanyLogo
									company="umd"
									size="60px"
								/>
								<Heading
									size="md"
									mb={1}
								>
									B.S., Computer Science
								</Heading>
								<Text
									color={muted}
									fontSize="sm"
									mb={1}
								>
									University of Maryland, College Park
								</Text>
								<Text
									fontSize="sm"
									color={muted}
								>
									Minor in Business
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
								<CLink
									href="https://youtube.com/@theoutlander"
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
									YouTube (reviving soon!)
								</CLink>
							</VStack>
						</Card.Root>

						{/* Honors & Highlights */}
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
								Honors & Highlights
							</Heading>

							<VStack
								align="stretch"
								gap={3}
							>
								<Text fontSize="sm">
									• Patent: Intelligent Intent Detection from Social Network
									Messages
								</Text>
								<Text fontSize="sm">
									• Microsoft Engineering Excellence Award Nominee
								</Text>
								<Text fontSize="sm">
									• Winner: Bing Hackday Spring '10 for best idea
								</Text>
								<Text fontSize="sm">
									• Bing Fall Hackday '10 project productized and patented
								</Text>
								<Text fontSize="sm">• Accepted into Y Combinator (2007)</Text>
								<Text fontSize="sm">
									• Presented at executive symposiums hosted by Intellectual
									Ventures and affiliated global health organizations
								</Text>
								<Text fontSize="sm">
									• Mentor, blogger, open-source contributor
								</Text>
							</VStack>
						</Card.Root>
					</VStack>
				</SimpleGrid>
			</Box>
		</>
	);
}

export const Route = createFileRoute("/resume")({
	component: ResumePage,
});
