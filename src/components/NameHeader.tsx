import { css, cva } from "../../styled-system/css/index.mjs";
import { FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { HiOutlineCalendar } from "react-icons/hi";
import { HiOutlineDocumentText } from "react-icons/hi";

// ====== shared primitives ======
const card = css({
	bg: { base: "white", _dark: "gray.900" },
	borderWidth: "1px",
	borderColor: { base: "gray.200", _dark: "gray.700" },
	borderRadius: "xl",
	boxShadow: { base: "sm", _dark: "none" },
});

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
		whiteSpace: "nowrap",
	},
	variants: {
		tone: {
			gray: { bg: "gray.50", borderColor: "gray.200", color: "gray.700" },
			blue: { bg: "brand.50", borderColor: "brand.200", color: "brand.700" },
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
		},
	},
	defaultVariants: { tone: "gray" },
});

// ====== header styles ======
const headerCard = css({
	display: "flex",
	alignItems: "center",
	gap: 4,
	p: { base: 4, md: 6 },
});

const avatar = css({
	w: 12,
	h: 12,
	borderRadius: "full",
	objectFit: "cover",
	borderWidth: "1px",
	borderColor: { base: "gray.200", _dark: "gray.700" },
});

const titleBox = css({
	display: "flex",
	flexDir: "column",
	gap: 1,
	flex: 1,
});

const nameCss = css({
	fontWeight: "semibold",
	color: { base: "gray.900", _dark: "gray.100" },
});

const subtitleCss = css({
	color: { base: "gray.600", _dark: "gray.400" },
	fontSize: "sm",
});

const badgeRow = css({
	display: "flex",
	gap: 2,
	mt: 2,
	flexWrap: "wrap",
});

const iconRow = css({
	display: "flex",
	gap: 2,
	flexWrap: "wrap",
	justifyContent: "flex-start",
	mt: 2,
});

const iconButton = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: { base: "brand.600", _dark: "brand.400" },
	textDecoration: "none",
	px: 3,
	py: 1.5,
	fontSize: "sm",
	borderRadius: "md",
	bg: "white",
	border: "1px solid",
	borderColor: { base: "gray.200", _dark: "gray.700" },
	position: "relative",
	_hover: {
		bg: "gray.50",
		transform: "translateY(-1px)",
		boxShadow: "sm",
	},
	"&::after": {
		content: "attr(aria-label)",
		position: "absolute",
		bottom: "calc(100% + 6px)",
		left: "50%",
		transform: "translateX(-50%) translateY(4px)",
		bg: { base: "gray.900", _dark: "gray.800" },
		color: "white",
		fontSize: "xs",
		px: 2,
		py: 1,
		borderRadius: "sm",
		boxShadow: "sm",
		whiteSpace: "nowrap",
		opacity: 0,
		pointerEvents: "none",
		transition: "opacity 150ms ease, transform 150ms ease",
		zIndex: 20,
	},
	"&:hover::after": {
		opacity: 1,
		transform: "translateX(-50%) translateY(0)",
	},
	"&:focus-visible::after": {
		opacity: 1,
		transform: "translateX(-50%) translateY(0)",
	},
});

const actionButton = css({
display: "flex",
alignItems: "center",
justifyContent: "center",
color: { base: "brand.600", _dark: "brand.400" },
textDecoration: "none",
px: 3,
py: 1.5,
fontSize: "sm",
borderRadius: "md",
bg: "white",
border: "1px solid",
borderColor: { base: "gray.200", _dark: "gray.700" },
cursor: "pointer",
position: "relative",
_hover: {
bg: "gray.50",
 transform: "translateY(-1px)",
			boxShadow: "sm",
		},
		"&::after": {
			content: "attr(aria-label)",
			position: "absolute",
			bottom: "calc(100% + 6px)",
			left: "50%",
			transform: "translateX(-50%) translateY(4px)",
			bg: { base: "gray.900", _dark: "gray.800" },
			color: "white",
			fontSize: "xs",
			px: 2,
			py: 1,
			borderRadius: "sm",
			boxShadow: "sm",
			whiteSpace: "nowrap",
			opacity: 0,
			pointerEvents: "none",
			transition: "opacity 150ms ease, transform 150ms ease",
			zIndex: 20,
		},
		"&:hover::after": {
			opacity: 1,
			transform: "translateX(-50%) translateY(0)",
		},
		"&:focus-visible::after": {
			opacity: 1,
			transform: "translateX(-50%) translateY(0)",
		},
});

// ====== data ======
const skills = [
	{ label: "TypeScript", tone: "blue" as const },
	{ label: "React", tone: "purple" as const },
	{ label: "Developer Experience", tone: "gray" as const },
	{ label: "NodeJS", tone: "green" as const },
	{ label: "AI", tone: "orange" as const },
];

const contactLinks = [
	{
		href: "mailto:nick@karnik.io",
		icon: MdEmail,
		title: "Email",
	},
	{
		href: "https://www.linkedin.com/in/theoutlander/",
		icon: FaLinkedin,
		title: "LinkedIn",
		external: true,
	},
	{
		href: "https://github.com/theoutlander",
		icon: FaGithub,
		title: "GitHub",
		external: true,
	},
	{
		href: "/schedule",
		icon: HiOutlineCalendar,
		title: "Schedule a Call",
		external: false,
	},
	{
		href: "https://youtube.com/@nick-karnik",
		icon: FaYoutube,
		title: "YouTube",
		external: true,
	},
];

const actionButtons = [
	{
		icon: HiOutlineDocumentText,
		title: "Download Resume (PDF)",
		action: "download",
		href: "/assets/documents/resume-nick-karnik.pdf",
		filename: "resume-nick-karnik.pdf",
	},
];

interface NameHeaderProps {
	showDownloadButton?: boolean;
	onDownload?: () => void;
}

export default function NameHeader({
	showDownloadButton = true,
	onDownload,
}: NameHeaderProps) {
	return (
		<section className={[card, headerCard].join(" ")}>
			<img
				src="/assets/images/profile/nick-karnik.jpeg"
				alt="Nick Karnik"
				className={avatar}
				loading="lazy"
			/>
			<div className={titleBox}>
				<span className={nameCss}>Nick Karnik</span>
				<span className={subtitleCss}>
					Staff Software Engineer & Engineering Leader
				</span>
				<div className={badgeRow}>
					{skills.map((skill) => (
						<span
							key={skill.label}
							className={pill({ tone: skill.tone })}
						>
							{skill.label}
						</span>
					))}
				</div>
				<div className={iconRow}>
					{contactLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target={link.external ? "_blank" : undefined}
							rel={link.external ? "noopener noreferrer" : undefined}
							className={iconButton}
							aria-label={link.title}
						>
							<link.icon size={18} />
						</a>
					))}
					{showDownloadButton &&
						actionButtons.map((button) => (
						<a
								key={button.title}
								className={actionButton}
								href={button.href}
								download={button.filename}
							aria-label={button.title}
							>
								<button.icon size={18} />
							</a>
						))}
				</div>
			</div>
		</section>
	);
}
