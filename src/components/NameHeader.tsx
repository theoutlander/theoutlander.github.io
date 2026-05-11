import React from "react";
import { css, cva } from "../../styled-system/css/index.mjs";
import {
	FaLinkedin,
	FaGithub,
	FaYoutube,
	FaTwitter,
	FaStackOverflow,
} from "react-icons/fa";
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
	flexDir: { base: "column", md: "row" },
	alignItems: { base: "flex-start", md: "center" },
	gap: { base: 4, md: 6 },
	p: { base: 4, md: 6 },
});

/** Home hero: no card chrome, photo and text align to top on larger screens */
const headerPlainOuter = css({
	display: "flex",
	flexDir: { base: "column", md: "row" },
	alignItems: { base: "center", md: "flex-start" },
	gap: { base: 6, md: 8 },
	width: "100%",
});

const avatar = css({
	w: { base: "160px", md: "120px" },
	h: { base: "160px", md: "120px" },
	maxW: { base: "160px", md: "120px" },
	maxH: { base: "160px", md: "120px" },
	borderRadius: "full",
	objectFit: "cover",
	borderWidth: "1px",
	borderColor: { base: "gray.200", _dark: "gray.700" },
	boxShadow: { base: "sm", _dark: "none" },
	alignSelf: { base: "center", md: "flex-start" },
	marginInline: { base: "auto", md: "0" },
	flexShrink: 0,
	flexGrow: 0,
});

const avatarPlain = css({
	borderWidth: "0",
	borderColor: "transparent",
	boxShadow: "none",
});

const titleBox = css({
	display: "flex",
	flexDir: "column",
	gap: 1,
	flex: 1,
	alignItems: { base: "center", md: "flex-start" },
	textAlign: { base: "center", md: "left" },
});

const nameCss = css({
	fontWeight: "semibold",
	color: { base: "gray.900", _dark: "gray.100" },
	fontSize: { base: "xl", md: "2xl" },
});

const subtitleCss = css({
	color: { base: "gray.600", _dark: "gray.400" },
	fontSize: { base: "sm", md: "md" },
	lineHeight: "1.4",
});

const badgeRow = css({
	display: "flex",
	gap: 2,
	mt: 2,
	flexWrap: "wrap",
	justifyContent: { base: "center", md: "flex-start" },
});

const iconRow = css({
	display: "flex",
	gap: 2,
	flexWrap: "wrap",
	justifyContent: { base: "center", md: "flex-start" },
});

const actionsRow = css({
	display: "flex",
	flexWrap: "wrap",
	flexDir: { base: "column", md: "row" },
	justifyContent: "space-between",
	alignItems: { base: "center", md: "center" },
	gap: 3,
	mt: 3,
	width: "100%",
});

const downloadRow = css({
	display: "flex",
	alignItems: "center",
	justifyContent: { base: "center", md: "flex-end" },
	gap: 2,
	width: { base: "100%", md: "auto" },
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
	width: { base: "100%", md: "auto" },
	maxWidth: { base: "100%", md: "220px" },
	justifyContent: { base: "center", md: "flex-start" },
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
	showSubtitle?: boolean;
	showTagPills?: boolean;
	showSocialLinks?: boolean;
	/** Optional list of tag labels to display instead of default skills */
	tags?: string[];
	/** No card border/background/shadow (e.g. home hero) */
	plain?: boolean;
	/** Rendered inside the text column (e.g. bio + CTAs on the home hero) */
	footer?: React.ReactNode;
}

export default function NameHeader({
	showDownloadButton = true,
	onDownload,
	showSubtitle = true,
	showTagPills = true,
	showSocialLinks = true,
	tags,
	plain = false,
	footer,
}: NameHeaderProps) {
	const outerClass = plain ? headerPlainOuter : [card, headerCard].join(" ");
	const avatarClass = plain ? [avatar, avatarPlain].join(" ") : avatar;
	const Wrapper: "div" | "section" = plain ? "div" : "section";

	return (
		<Wrapper className={outerClass}>
			<img
				src="/assets/images/profile/nick-karnik.jpeg"
				alt="Nick Karnik"
				className={avatarClass}
				loading="lazy"
			/>
			<div className={titleBox}>
				<span className={nameCss}>Nick Karnik</span>
				{showSubtitle && (
					<span className={subtitleCss}>
						Engineering Leader - AI & Product Strategy
					</span>
				)}
				{showTagPills && (
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
				)}
				{(showSocialLinks || showDownloadButton) && (
					<div className={actionsRow}>
						{showSocialLinks && (
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
									href="https://x.com/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's X profile"
									className={iconLinkContainer}
								>
									<div className={css(iconWrapper, getIconColorStyles("twitter"))}>
										<FaTwitter
											size={ICON_SIZE}
											color={iconColors.twitter.light}
										/>
									</div>
								</a>
								<a
									href="https://stackoverflow.com/users/460472/nick"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's Stack Overflow profile"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("stackoverflow"))}
									>
										<FaStackOverflow
											size={ICON_SIZE}
											color={iconColors.stackoverflow.light}
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
						)}
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
				)}
				{footer != null ? (
					<div
						className={css({
							width: "100%",
							display: "flex",
							flexDirection: "column",
							gap: "4",
							mt: plain ? "3" : "0",
						})}
					>
						{footer}
					</div>
				) : null}
			</div>
		</Wrapper>
	);
}
