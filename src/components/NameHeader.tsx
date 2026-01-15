import React from "react";
import { css, cva } from "../../styled-system/css/index.mjs";
import { FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { getIconColorStyles, iconColors } from "../utils/iconColors";
import { CodementorIcon } from "./CodementorIcon";

// Shared icon size constant - matches resume icon size
const ICON_SIZE = 18;

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

// Helper to map plain string tags to the closest visual tone
type PillTone = "gray" | "blue" | "green" | "purple" | "orange";
function inferToneFromLabel(label: string): PillTone {
	const lower = label.toLowerCase();
	if (lower.includes("ai")) return "orange";
	if (lower.includes("lead")) return "blue";
	if (lower.includes("product")) return "purple";
	if (lower.includes("developer")) return "green";
	return "gray";
}

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
});

const actionsRow = css({
	display: "flex",
	flexWrap: "wrap",
	justifyContent: "space-between",
	alignItems: "center",
	gap: 3,
	mt: 3,
});

const downloadRow = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 2,
});

const downloadButton = css({
	display: "inline-flex",
	alignItems: "center",
	gap: 2,
	paddingInline: 3,
	paddingBlock: 2,
	borderRadius: "md",
	backgroundColor: { base: "brand.600", _dark: "brand.500" },
	color: "white",
	fontWeight: "semibold",
	textDecoration: "none",
	boxShadow: "sm",
	transition: "all 150ms ease-in-out",
	_hover: {
		backgroundColor: { base: "brand.700", _dark: "brand.400" },
		boxShadow: "md",
		transform: "translateY(-1px)",
	},
	_active: {
		transform: "translateY(0)",
	},
	_focusVisible: {
		outline: "2px solid",
		outlineColor: "brand.700",
		outlineOffset: "2px",
	},
});

// Shared icon container style - matches resume icon container
const iconLinkContainer = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	minWidth: "44px",
	minHeight: "44px",
	borderRadius: "4px",
	cursor: "pointer",
	transition: "color 200ms ease-in-out",
	"@media (prefers-reduced-motion: reduce)": {
		transition: "none",
	},
	_focus: {
		outline: "2px solid brand.600",
		outlineOffset: "2px",
	},
});

// Shared icon wrapper style
const iconWrapper = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "currentColor",
	"& svg": {
		color: "currentColor",
	},
	"& *": {
		color: "currentColor",
	},
});

// ====== data ======
const skills = [
	{ label: "✨ AI", tone: "orange" as const },
	{ label: "👥 Leadership", tone: "blue" as const },
	{ label: "📦 Product", tone: "purple" as const },
	{ label: "🛠 Developer Experience", tone: "green" as const },
];

interface NameHeaderProps {
	showDownloadButton?: boolean;
	onDownload?: () => void;
	/** Optional list of tag labels to display instead of default skills */
	tags?: string[];
}

export default function NameHeader({
	showDownloadButton = true,
	onDownload,
	tags,
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
					Engineering Leader - AI & Product Strategy
				</span>
				<div className={badgeRow}>
					{tags && tags.length > 0
						? tags.map((label) => (
								<span
									key={label}
									className={pill({ tone: inferToneFromLabel(label) })}
								>
									{label}
								</span>
						  ))
						: skills.map((skill) => (
								<span
									key={skill.label}
									className={pill({ tone: skill.tone })}
								>
									{skill.label}
								</span>
						  ))}
				</div>
				<div className={actionsRow}>
					<div className={iconRow}>
						<a
							href="https://github.com/theoutlander"
							target="_blank"
							rel="noopener"
							aria-label="Visit Nick Karnik's GitHub profile"
							className={iconLinkContainer}
						>
							<div className={css(iconWrapper, getIconColorStyles("github"))}>
								<FaGithub
									size={ICON_SIZE}
									color={iconColors.github.light}
								/>
							</div>
						</a>
						<a
							href="https://www.linkedin.com/in/theoutlander"
							target="_blank"
							rel="noopener"
							aria-label="Visit Nick Karnik's LinkedIn profile"
							className={iconLinkContainer}
						>
							<div className={css(iconWrapper, getIconColorStyles("linkedin"))}>
								<FaLinkedin
									size={ICON_SIZE}
									color={iconColors.linkedin.light}
								/>
							</div>
						</a>
						<a
							href="https://youtube.com/@nick-karnik"
							target="_blank"
							rel="noopener"
							aria-label="Visit Nick Karnik's YouTube channel"
							className={iconLinkContainer}
						>
							<div className={css(iconWrapper, getIconColorStyles("youtube"))}>
								<FaYoutube
									size={ICON_SIZE}
									color={iconColors.youtube.light}
								/>
							</div>
						</a>
						<a
							href="https://www.codementor.io/@theoutlander"
							target="_blank"
							rel="noopener"
							aria-label="Visit Nick Karnik's Codementor profile"
							className={iconLinkContainer}
						>
							<div className={css(iconWrapper, getIconColorStyles("codementor"))}>
								<CodementorIcon
									size={ICON_SIZE}
									color={iconColors.codementor.light}
								/>
							</div>
						</a>
					</div>
					{showDownloadButton && (
						<div className={downloadRow}>
							<a
								href="/assets/documents/resume-nick-karnik.pdf"
								target="_blank"
								rel="noopener"
								aria-label="Download Nick Karnik's resume (PDF)"
								className={downloadButton}
								download
							>
								<HiOutlineDocumentText size={ICON_SIZE} />
								<span>Download Resume</span>
							</a>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
