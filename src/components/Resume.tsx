import { css, cva } from "../../styled-system/css/index.mjs";
import { CompanyLogo } from "./CompanyLogo";
import { FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaDownload } from "react-icons/fa";
import NameHeader from "./NameHeader";
import ContactSection from "./ContactSection";

// ----- Color tokens for light/dark mode -----
const surface = { light: "white", dark: "gray.900" };
const textMain = { light: "gray.900", dark: "gray.100" };
const textSub = { light: "gray.600", dark: "gray.400" };
const border = { light: "gray.200", dark: "gray.700" };

// ----- Company name mapping -----
const getCompanyKey = (companyName: string): string => {
	const mappings: Record<string, string> = {
		"Plutonic Consulting": "plutonic",
		Google: "google",
		Salesforce: "salesforce",
		"T-Mobile": "tmobile",
		"Fullstack Consulting": "fullstack",
		"Treasure Technologies": "treasure",
		Jobbatical: "jobbatical",
		"Gates Foundation": "idm",
		Microsoft: "microsoft",
		Tableau: "tableau",
		"Y Combinator": "ycombinator",
		RoomToday: "roomtoday",
		"COMPASS Technologies": "compass-technologies",
		"Blue Hippo Funding": "bluehippo-funding",
		"The Globalist": "theglobalist",
		"Meds Publishing": "meds-publishing",
		"University of Maryland": "umd",
		"Videoly Platform": "videoly platform",
		"RoomToday Platform": "roomtoday platform",
	};
	return (
		mappings[companyName] ||
		companyName
			.toLowerCase()
			.replace(/\s+/g, "")
			.replace(/[^a-z0-9-]/g, "")
	);
};

// ----- Pills (chips) -----
const pill = cva({
	base: {
		display: "inline-flex",
		alignItems: "center",
		px: 2.5,
		py: 1,
		borderRadius: "full",
		fontSize: "xs",
		fontWeight: "medium",
		borderWidth: "1px",
		borderColor: "gray.200",
		bg: "gray.50",
		color: "gray.700",
		whiteSpace: "nowrap",
	},
	variants: {
		tone: {
			default: {},
			blue: { bg: "accent.50", borderColor: "accent.200", color: "accent.700" },
			green: { bg: "green.50", borderColor: "green.200", color: "green.700" },
			purple: {
				bg: "purple.50",
				borderColor: "purple.200",
				color: "purple.700",
			},
			orange: {
				bg: "orange.50",
				borderColor: "orange.200",
				color: "orange.700",
			},
			gray: { bg: "gray.50", borderColor: "gray.200", color: "gray.700" },
		},
	},
	defaultVariants: { tone: "default" },
});

// ----- Card shell -----
const card = css({
	bg: { base: surface.light, _dark: surface.dark },
	borderWidth: "1px",
	borderColor: { base: border.light, _dark: border.dark },
	borderRadius: "xl",
	boxShadow: { base: "sm", _dark: "none" },
});

// ----- Page container -----
const wrap = css({
	maxW: "1024px",
	mx: "auto",
	px: { base: 4, md: 6 },
	py: 8,
});

// ----- Grid (2 columns) -----
const grid = css({
	display: "grid",
	gridTemplateColumns: { base: "1fr", md: "2fr 1fr" },
	gap: 6,
	mt: 6,
});

// ----- Section headers -----
const sectionHeader = css({
	px: { base: 4, md: 6 },
	pt: { base: 4, md: 5 },
	pb: 3,
	borderBottomWidth: "1px",
	borderColor: "gray.100",
	fontWeight: "semibold",
	color: "gray.800",
});

// ----- Experience list -----
const expItem = css({
	display: "flex",
	flexDir: "column",
	gap: 2,
	p: { base: 4, md: 6 },
	borderTopWidth: "1px",
	borderColor: "gray.100",
});

const expHeader = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 3,
	flexWrap: "wrap",
});

const expTitle = css({
	fontWeight: "semibold",
	color: { base: textMain.light, _dark: textMain.dark },
});
const expSub = css({
	color: { base: textSub.light, _dark: textSub.dark },
	fontSize: "sm",
});
const expMeta = css({
	color: { base: "gray.500", _dark: "gray.400" },
	fontSize: "sm",
});
const tagRow = css({ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 });

// ----- Project items -----
const projectItem = css({
	display: "flex",
	flexDir: "column",
	gap: 2,
	p: { base: 4, md: 6 },
	borderTopWidth: "1px",
	borderColor: "gray.100",
});

// ----- Skills -----
const skillsWrap = css({
	display: "flex",
	flexDir: "column",
	gap: 3,
	p: { base: 4, md: 6 },
});

const skillGroup = css({
	display: "flex",
	flexDir: "column",
	gap: 2,
});

const skillTitle = css({
	fontSize: "sm",
	fontWeight: "semibold",
	color: { base: "gray.800", _dark: "gray.200" },
});

const pillWrap = css({
	display: "flex",
	gap: 2,
	flexWrap: "wrap",
});

// ----------------------------------------------------------------

type Exp = {
	role: string;
	company: string;
	dates: string;
	current?: boolean;
	blurb: string;
	tags: string[];
};

const experience: Exp[] = [
	{
		role: "Founder & Fractional CTO",
		company: "Plutonic Consulting",
		dates: "May 2025 – Present",
		current: true,
		blurb:
			"Providing fractional CTO support, AI strategy, and scaling guidance to founders. Helping teams move faster with clear product bets, strong execution, and systems that are simple to maintain. Focus on pragmatic AI integration and developer experience optimization.",
		tags: [
			"AI Strategy",
			"Technical Leadership",
			"Fractional CTO",
			"Team Scaling",
		],
	},
	{
		role: "Staff Software Engineer / Engineering Manager",
		company: "Google",
		dates: "May 2022 – Apr 2025",
		blurb:
			"Led technical direction and hands-on engineering for Gemini Code Assist, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.",
		tags: ["Go", "TypeScript", "Node.js", "Kubernetes", "GCP", "LLM"],
	},
	{
		role: "Senior Engineering Manager",
		company: "Salesforce",
		dates: "Oct 2019 – Apr 2022",
		blurb:
			"Built CI pipeline (TACO) enabling 100+ partners to test connectors across Tableau/Salesforce stack. Delivered REST and native Salesforce connectors; owned Web Data Connector platform. Managed a team of 35+; drove hiring, mentoring, and technical strategy. Created Connector SDK adopted across the Tableau ecosystem.",
		tags: ["TypeScript", "Node.js", "Chromium", "CI/CD", "Team Leadership"],
	},
	{
		role: "Director Of Engineering",
		company: "T-Mobile",
		dates: "Nov 2018 – Oct 2019",
		blurb:
			"Hired a diverse team of 25 engineers in six weeks; managed four product teams totaling 35+ engineers across T-Mobile Retail Mobility. Delivered custom desktop & mobile applications for the T-Mobile / Sprint merger. Architected and implemented a portable Test Automation Framework that runs in-app.",
		tags: [
			"Team Leadership",
			"Rapid Hiring",
			"Mobile Development",
			"Test Automation",
		],
	},
	{
		role: "Principal / Founder",
		company: "Fullstack Consulting",
		dates: "Mar 2018 – Nov 2018",
		blurb:
			"Trained 100+ students in React, Node, GraphQL; created technical content for YouTube and dev.to. Consulted on MVPs and scale-up projects with clients including Hims, ForHers, CopBot, and Sensei Ag. Built and delivered mobile applications using React Native for early-stage clients.",
		tags: ["React Native", "GraphQL", "Training", "Consulting", "Mobile Apps"],
	},
	{
		role: "CTO",
		company: "Treasure Technologies",
		dates: "Sep 2017 – Mar 2018",
		blurb:
			"Built a fin-tech analytics product integrating with banks via Plaid and custom APIs. Accepted into Nasdaq Entrepreneurial Program; led engineering and technical vision.",
		tags: [
			"FinTech",
			"Plaid API",
			"Banking Integration",
			"Technical Leadership",
		],
	},
	{
		role: "CTO",
		company: "Jobbatical",
		dates: "Apr 2017 – Aug 2017",
		blurb:
			"Migrated monolith to microservices; rebuilt CI/CD, monitoring, and deployment pipelines. Led platform modernization and org scaling during growth phase.",
		tags: ["Microservices", "CI/CD", "Platform Architecture", "DevOps"],
	},
	{
		role: "Senior Software Engineer",
		company: "Gates Foundation",
		dates: "Sep 2012 – Oct 2016",
		blurb:
			"Built simulation and visualization tools for malaria, HIV, TB, polio, and more. Developed software and spatial models featured in Bill Gates' TED Talk \"The next outbreak? We're not ready.\" Collaborated with organizations like WHO, ministries of health, NGOs, and universities.",
		tags: [
			"Data Visualization",
			"Simulation",
			"Global Health",
			"Scientific Computing",
		],
	},
	{
		role: "Software Development Engineer",
		company: "Microsoft",
		dates: "Aug 2006 – Aug 2012",
		blurb:
			"Led multiple Bing teams including Bing Together, Task Framework, Ecosystem, Core Answers, Seasonal Answers, Structured Data, Commerce Relevance, and Commerce Data Pipeline. Architected Big Data Validation Framework (Engineering Excellence Award Nominee). Built JS memory profiling tools for Outlook Web Access; developed Naive Bayes sentiment classifiers for Bing Shopping.",
		tags: [
			"Big Data",
			"JavaScript",
			"Machine Learning",
			"Outlook Web Access",
			"Bing",
		],
	},
	{
		role: "Lead Software Engineer",
		company: "COMPASS Technologies",
		dates: "Nov 2005 – Aug 2006",
		blurb:
			"Architected and developed next-generation Access Control Security System using C++ and C#. Optimized real-time alarm processing for distributed systems. Led team expansion and mentored junior developers in TCP/IP networking and security protocols.",
		tags: ["C++", "C#", "TCP/IP", "Distributed Systems", "Team Leadership"],
	},
	{
		role: "Software Engineer",
		company: "Blue Hippo Funding",
		dates: "Jul 2003 – Oct 2003",
		blurb:
			"Developed CRM system in VB.NET, C#, and ASP.NET using SQL 2000. Focused on UI ergonomics and data access design patterns. Built service to monitor orders and dynamically generate PDF files for warehouse printing. Integrated with Cisco Phone Switch for call tracking.",
		tags: ["VB.NET", "C#", "ASP.NET", "SQL Server", "CRM Systems"],
	},
	{
		role: "Software Engineer",
		company: "The Globalist",
		dates: "Jan 2002 – Jul 2003",
		blurb:
			"Developed CRM system in C# using SQL Server 2000. Gathered requirements from end users and designed ergonomic UI for business and contact data access. Integrated task and appointment scheduler with Microsoft Outlook. Built error reporting system with XML web service integration.",
		tags: [
			"C#",
			"SQL Server",
			"Outlook Integration",
			"Crystal Reports",
			"XML Web Services",
		],
	},
	{
		role: "Web Application Developer",
		company: "Meds Publishing",
		dates: "May 2000 – May 2001",
		blurb:
			"Converted VB 6 applications to ASP applications. Gained early experience in web development and application modernization. Worked on database design and user interface improvements for medical publishing platform.",
		tags: ["VB 6", "ASP", "Web Development", "Application Migration"],
	},
	{
		role: "Web Developer",
		company: "University of Maryland",
		dates: "Oct 1999 – May 2000",
		blurb:
			"Designed, implemented and tested a faculty expertise management tool in ASP using Access 2000. Maintained Engineering Research Center's website during undergraduate studies. Gained foundational experience in web technologies and database design.",
		tags: ["ASP", "Access 2000", "Web Development", "Database Design"],
	},
];

// Notable Projects data
const projects = [
	{
		name: "Gemini Code Assist",
		company: "gemini-code-assist",
		dates: "2022 - 2025",
		description:
			"Led technical direction and hands-on engineering for Google's AI coding assistant, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.",
		tags: ["Go", "TypeScript", "Node.js", "Kubernetes", "GCP", "LLM"],
	},
	{
		name: "TACO Toolkit & Connector SDK",
		company: "Tableau",
		dates: "2019 - 2022",
		description:
			"Built a robust CI/CD pipeline (TACO) enabling over 100 partners to test and deploy Tableau connectors efficiently. Created a Connector SDK widely adopted across Tableau's ecosystem, simplifying web data connector development.",
		tags: ["TypeScript", "Node.js", "Chromium", "CI/CD", "SDK Development"],
	},
	{
		name: "Malaria Simulation Platform",
		company: "Gates Foundation",
		dates: "2012 - 2016",
		description:
			"Developed advanced simulation and visualization tools for malaria, HIV, TB, and polio research. Created software and spatial models featured in Bill Gates' TED Talk \"The next outbreak? We're not ready.\" Collaborated with WHO, ministries of health, NGOs, and universities worldwide.",
		tags: [
			"Scientific Computing",
			"Data Visualization",
			"Global Health",
			"Simulation",
			"Research",
		],
	},
	{
		name: "Videoly Platform",
		company: "Videoly Platform",
		dates: "2007 - 2009",
		description:
			"Co-founded video mail platform allowing users to send video messages via webcam or upload existing videos through email accounts. Accepted into YCombinator 2007. Experimented with ad-based and paid revenue models for consumer space and B2B platform services.",
		tags: [
			"Ruby on Rails",
			"Flex",
			"Amazon EC2/S3",
			"YCombinator",
			"Video Streaming",
		],
	},
	{
		name: "RoomToday Platform",
		company: "RoomToday Platform",
		dates: "2014 - 2016",
		description:
			"Co-founded and built a real-time, last-minute hotel booking platform. Raised $1.6M and led the acquisition by Simasindo and Northcliff Ventures. Developed mobile apps and real-time property management systems used by hotel partners across Asia and Europe.",
		tags: ["React Native", "Real-time Systems", "Mobile Apps", "Startup"],
	},
];

// Skills data
const skills = {
	Languages: ["TypeScript", "JavaScript", "Python", "C#", "Go", "C++", "Java"],
	"Web & Mobile": [
		"NodeJS",
		"Electron",
		"Express",
		"React",
		"React Native",
		"GraphQL",
		"Playwright",
		"VSCode Extensions",
	],
	"Databases & Cloud": [
		"MongoDB",
		"Docker",
		"ElasticSearch",
		"Neo4J",
		"PostgreSQL",
		"Redis",
		"SQL Server",
		"AWS",
		"Google Cloud",
	],
	"AI & Leadership": [
		"AI-Assisted Development",
		"Large Language Models",
		"Team Scaling",
		"DX",
	],
};

export default function Resume() {
	return (
		<main className={wrap}>
			{/* Header card */}
			<NameHeader showDownloadButton={true} />

			{/* Top Grid - Experience and Skills */}
			<section
				className={css({
					display: "grid",
					gridTemplateColumns: { base: "1fr", md: "2fr 1fr" },
					gap: 6,
					mt: 6,
				})}
			>
				{/* Experience column */}
				<article className={[card, "resume-card"].join(" ")}>
					<h3 className={sectionHeader}>Experience</h3>

					{experience.map((e, idx) => (
						<div
							key={idx}
							className={expItem}
						>
							<div className={css({ textAlign: "left", mb: 4 })}>
								<CompanyLogo company={getCompanyKey(e.company)} />
							</div>
							<div className={expHeader}>
								<div>
									<div className={expTitle}>{e.role}</div>
									<div className={expSub}>{e.company}</div>
								</div>
								<div className={expMeta}>
									{e.dates}{" "}
									{e.current ? (
										<span className={pill({ tone: "green" })}>Current</span>
									) : null}
								</div>
							</div>

							<p className={css({ color: "gray.700", lineHeight: "1.65" })}>
								{e.blurb}
							</p>

							<div className={tagRow}>
								{e.tags.map((t) => (
									<span
										key={t}
										className={pill()}
									>
										{t}
									</span>
								))}
							</div>
						</div>
					))}
				</article>

				{/* Right column - Skills, Education, Contact */}
				<aside className={css({ display: "flex", flexDir: "column", gap: 6 })}>
					{/* Skills */}
					<article className={[card, "resume-card"].join(" ")}>
						<h3 className={sectionHeader}>Technical Skills</h3>

						<div className={skillsWrap}>
							{Object.entries(skills).map(([group, items]) => (
								<div
									key={group}
									className={skillGroup}
								>
									<span className={skillTitle}>{group}</span>
									<div className={pillWrap}>
										{items.map((it) => (
											<span
												key={it}
												className={pill()}
											>
												{it}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					</article>

					{/* Education */}
					<article className={[card, "resume-card"].join(" ")}>
						<h3 className={sectionHeader}>Education</h3>
						<div className={css({ p: { base: 4, md: 6 } })}>
							<div className={css({ textAlign: "left", mb: 4 })}>
								<CompanyLogo company="umd" />
							</div>
							<div className={css({ mb: 4 })}>
								<h4
									className={css({
										fontSize: "lg",
										fontWeight: "semibold",
										color: { base: textMain.light, _dark: textMain.dark },
										mb: 1,
									})}
								>
									University of Maryland
								</h4>
								<p
									className={css({
										color: { base: textSub.light, _dark: textSub.dark },
										fontSize: "sm",
										mb: 1,
									})}
								>
									B.S., Computer Science
								</p>
								<p
									className={css({
										color: { base: textSub.light, _dark: textSub.dark },
										fontSize: "sm",
									})}
								>
									University of Maryland, College Park
								</p>
								<p
									className={css({
										color: { base: textSub.light, _dark: textSub.dark },
										fontSize: "sm",
										mt: 1,
									})}
								>
									Minor in Business
								</p>
							</div>
						</div>
					</article>

					{/* Contact */}
					<ContactSection />
				</aside>
			</section>

			{/* Notable Projects - Aligned with Experience column */}
			<section
				className={css({
					display: "grid",
					gridTemplateColumns: { base: "1fr", md: "2fr 1fr" },
					gap: 6,
					mt: 6,
				})}
			>
				<article className={[card, "resume-card"].join(" ")}>
					<h3 className={sectionHeader}>Notable Projects</h3>

					<div
						className={css({
							display: "flex",
							flexDir: "column",
							gap: 0,
						})}
					>
						{projects.map((project, idx) => (
							<div
								key={idx}
								className={expItem}
							>
								<div className={css({ textAlign: "left", mb: 4 })}>
									<CompanyLogo company={getCompanyKey(project.company)} />
								</div>
								<div className={expHeader}>
									<div>
										<div className={expTitle}>{project.name}</div>
										<div className={expSub}>{project.company}</div>
									</div>
									<div className={expMeta}>{project.dates}</div>
								</div>

								<p className={css({ color: "gray.700", lineHeight: "1.65" })}>
									{project.description}
								</p>

								<div className={tagRow}>
									{project.tags.map((t) => (
										<span
											key={t}
											className={pill()}
										>
											{t}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</article>
				<div></div>
			</section>
		</main>
	);
}
