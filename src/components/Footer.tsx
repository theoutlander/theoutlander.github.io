import { css } from "../../styled-system/css/index.mjs";
import {
	FaGithub,
	FaGamepad,
	FaLinkedin,
	FaTwitter,
	FaYoutube,
	FaStackOverflow,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { SOCIAL_LINKS } from "../data/person";
import { HiOutlineDocumentText } from "react-icons/hi";
import { getIconColorStyles } from "../utils/iconColors";
import { CodementorIcon } from "./CodementorIcon";

// Shared icon size constant - matches resume icon size
const ICON_SIZE = 18;

// Shared container style for all icons - matches resume icon container
const iconLinkContainer = css({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	minWidth: "40px",
	minHeight: "40px",
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
});

// Shared link style with mobile optimizations
// On mobile each link looks like a label/button (box per link)
const linkStyle = css({
	display: "flex",
	alignItems: "center",
	justifyContent: { base: "center", md: "flex-start" },
	gap: { base: "0.75rem", md: "2" },
	fontSize: { base: "sm", md: "sm" },
	color: { base: "gray.700", _dark: "dark.text" },
	textDecoration: "none",
	cursor: "pointer",
	width: "100%",
	minHeight: { base: "44px", md: "auto" },
	minWidth: { base: "44px", md: "0" },
	px: { base: "4", md: "3" },
	py: { base: "0.75rem", md: "2.5" },
	borderRadius: { base: "md", md: "md" },
	whiteSpace: "nowrap",
	transition: "all 200ms ease-in-out",
	"@media (prefers-reduced-motion: reduce)": {
		transition: "none",
	},
	// Mobile: each link is its own outlined box, stacked
	bg: { base: "transparent", md: "transparent" },
	borderWidth: { base: "1px", md: "0" },
	borderColor: { base: "gray.300", _dark: "gray.600", md: "transparent" },
	borderStyle: { base: "solid", md: "none" },
	_hover: {
		color: "brand.600",
		textDecoration: "underline",
		bg: { base: "gray.50", _dark: "gray.800/50", md: "transparent" },
		borderColor: { base: "gray.400", _dark: "gray.500", md: "transparent" },
	},
	_active: {
		transform: { base: "scale(0.98)", md: "none" },
	},
	_focus: {
		outline: "2px solid brand.600",
		outlineOffset: "2px",
		borderRadius: { base: "md", md: "md" },
	},
	"@media (hover: none) and (pointer: coarse)": {
		minHeight: "44px",
		py: "0.75rem",
	},
});

// Wrapper for link columns: flex stack on mobile, no box (each link has its own box)
const linksBoxMobile = css({
	display: { base: "flex", md: "contents" },
	flexDirection: { base: "column", md: "row" },
	alignItems: { base: "stretch", md: "stretch" },
	gap: { base: "0.5rem", md: "0" },
	width: { base: "100%", md: "auto" },
});

export default function Footer() {
	const currentYear = new Date().getFullYear();
	
	return (
		<footer
			className={css({
				bg: { base: "white", _dark: "dark.surface" },
				borderTop: "1px solid",
				borderColor: { base: "gray.200", _dark: "dark.border" },
				pt: { base: "6", md: "10" },
				pb: { base: "8", md: "10" },
				mt: "8",
				flexShrink: 0,
				width: "100%",
			})}
		>
			<div
				className={css({
					maxW: "5xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
					<div
						className={css({
							display: { base: "flex", md: "grid" },
							flexDirection: { base: "column", md: "row" },
							gridTemplateColumns: { md: "1fr 1fr 1fr" },
							gap: { base: "0", md: "5rem" },
							alignItems: { base: "center", md: "stretch" },
							"& > *:first-child": {
								mb: { base: "4rem", md: "0" },
							},
						})}
					>
						{/* Column 1 - Name & Title */}
						<div
							className={css({
								width: "100%",
								textAlign: { base: "center", md: "left" },
								display: "flex",
								flexDirection: "column",
								alignItems: { base: "center", md: "flex-start" },
								paddingRight: { base: "0", md: "5rem" },
								borderRight: { base: "none", md: "1px solid" },
								borderColor: { base: "transparent", md: "gray.200", _dark: "dark.border" },
								height: "100%",
								minHeight: { md: "100%" },
							})}
						>
							<div
								className={css({
									fontSize: { base: "2.5rem", md: "3.5rem"},
									fontWeight: "700",
									color: { base: "gray.900", _dark: "gray.100" },
									lineHeight: "1.1",
									marginBottom: { base: "1.5rem", md: "2rem" },
									letterSpacing: "-0.5px",
								})}
							>
								Nick<br />
								Karnik
							</div>
						</div>

						{/* <div className={linksBoxMobile}> */}
						{/* Column 2 - Contact & Professional Links */}
						<div
							className={css({
								width: { base: "100%", md: "22rem" },
								textAlign: { base: "center", md: "left" },
								display: "flex",
								flexDirection: "column",
								alignItems: { base: "center", md: "flex-start" },
								gap: { base: "0.5rem", md: "0.5rem" },
								margin: { base: "10px", md: "0" },
								paddingRight: { base: "0", md: "2rem" },
								borderRight: { base: "none", md: "1px solid" },
								borderColor: { base: "transparent", md: "gray.200", _dark: "dark.border" },
								marginLeft: { base: "0", md: "0" },
							})}
						>
							<a
								href="mailto:nick@karnik.io"
								className={linkStyle}
							>
								<div className={css(iconWrapper, getIconColorStyles("email"))}>
									<MdEmail size={ICON_SIZE} />
								</div>
								<span>nick@karnik.io</span>
							</a>
							<a
								href="https://maya.karnik.io"
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div className={css(iconWrapper, getIconColorStyles("resume"))}>
									<FaGamepad size={ICON_SIZE} />
								</div>
								<span>Maya's Game Lab</span>
							</a>
							<a
								href="/resume.pdf"
								download="Nick_Karnik_Resume.pdf"
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div className={css(iconWrapper, getIconColorStyles("resume"))}>
									<HiOutlineDocumentText size={ICON_SIZE} />
								</div>
								<span>Resume</span>
							</a>
							<a
								href={SOCIAL_LINKS.stackoverflow}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(
										iconWrapper,
										getIconColorStyles("stackoverflow")
									)}
								>
									<FaStackOverflow size={ICON_SIZE} />
								</div>
								<span>Stack Overflow</span>
							</a>
							<a
								href={SOCIAL_LINKS.codementor}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(
										iconWrapper,
										getIconColorStyles("codementor")
									)}
								>
									<CodementorIcon size={ICON_SIZE} />
								</div>
								<span>Codementor</span>
							</a>
						</div>

						{/* Column 3 - Social Links */}
						<div
							className={css({
								width: { base: "100%", md: "22rem" },
								textAlign: { base: "center", md: "left" },
								display: "flex",
								flexDirection: "column",
								alignItems: { base: "center", md: "flex-start" },
								gap: { base: "0.5rem", md: "0.5rem" },
								// paddingLeft: { base: "0", md: "0.5rem" },
							})}
						>
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(iconWrapper, getIconColorStyles("github"))}
								>
									<FaGithub size={ICON_SIZE} />
								</div>
								<span>GitHub</span>
							</a>
							<a
								href={SOCIAL_LINKS.linkedin}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(iconWrapper, getIconColorStyles("linkedin"))}
								>
									<FaLinkedin size={ICON_SIZE} />
								</div>
								<span>LinkedIn</span>
							</a>
							<a
								href={SOCIAL_LINKS.twitter}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(iconWrapper, getIconColorStyles("twitter"))}
								>
									<FaTwitter size={ICON_SIZE} />
								</div>
								<span>Twitter</span>
							</a>
							<a
								href={SOCIAL_LINKS.youtube}
								target="_blank"
								rel="noopener"
								className={linkStyle}
							>
								<div
									className={css(iconWrapper, getIconColorStyles("youtube"))}
								>
									<FaYoutube size={ICON_SIZE} />
								</div>
								<span>YouTube</span>
							</a>
						</div>
						{/* </div> */}
					</div>

					{/* Footer bottom: copyright */}
					<div
						className={css({
							mt: { base: "2rem", md: "2rem" },
							pt: { base: "0.75rem", md: "1rem" },
							borderTop: "1px solid",
							borderColor: { base: "gray.200", _dark: "gray.700" },
							textAlign: "center",
						})}
						role="contentinfo"
						aria-label="Footer legal"
					>
						<span
							className={css({
								fontSize: { base: "0.75rem", md: "0.8125rem" },
								fontWeight: "400",
								letterSpacing: "0.02em",
								color: { base: "gray.500", _dark: "gray.500" },
								lineHeight: "1.5",
							})}
						>
							© {currentYear}{" "}
							<span
								className={css({
									fontWeight: "600",
									color: { base: "gray.700", _dark: "gray.300" },
								})}
							>
								Nick Karnik
							</span>
							. All rights reserved.
						</span>
					</div>
			</div>
		</footer>
	);
}
