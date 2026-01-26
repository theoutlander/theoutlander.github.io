import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";
import {
	FaGithub,
	FaLinkedin,
	FaTwitter,
	FaYoutube,
	FaStackOverflow,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
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

// Custom cursor SVG for links (interactive circle with plus)
const linkCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="%236366f1" stroke="%23e2e8f0" stroke-width="1"/><path d="M10 6V14M6 10H14" stroke="%23e2e8f0" stroke-width="1"/></svg>') 10 10, pointer`;

// Shared link style with mobile optimizations and custom cursor
const linkStyle = css({
	display: "flex",
	alignItems: "center",
	gap: "2",
	fontSize: "sm",
	color: { base: "gray.700", _dark: "dark.text" },
	textDecoration: "none",
	cursor: linkCursor,
	minHeight: { base: "44px", md: "auto" },
	px: { base: "0.5rem", md: "3" },
	py: { base: "0.5rem", md: "2.5" },
	borderRadius: { base: "4px", md: "md" },
	whiteSpace: "nowrap",
	transition: "all 200ms ease-in-out",
	"@media (prefers-reduced-motion: reduce)": {
		transition: "none",
	},
	_hover: {
		color: "brand.600",
		textDecoration: "underline",
	},
	_active: {
		transform: { base: "scale(0.98)", md: "none" },
	},
	_focus: {
		outline: "2px solid brand.600",
		outlineOffset: "2px",
		borderRadius: { base: "4px", md: "md" },
	},
	"@media (hover: none) and (pointer: coarse)": {
		minHeight: "44px",
		px: "0.5rem",
		py: "0.5rem",
	},
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
			})}
		>
			<div
				className={css({
					maxW: "6xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
					<div
						className={css({
							display: { base: "flex", md: "grid" },
							flexDirection: { base: "column", md: "row" },
							gridTemplateColumns: { md: "1fr 1fr 1fr" },
							gap: { base: "2rem", md: "2rem" },
							alignItems: { base: "flex-start", md: "stretch" },
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
								paddingRight: { base: "0", md: "2rem" },
								borderRight: { base: "none", md: "1px solid" },
								borderColor: { base: "transparent", md: "gray.200", _dark: "dark.border" },
								height: "100%",
								minHeight: { md: "100%" },
							})}
						>
							<h2
								className={css({
									fontSize: "md",
									fontWeight: "bold",
									mb: "2",
									color: { base: "gray.800", _dark: "dark.text" },
								})}
							>
								Nick Karnik
							</h2>
							<p
								className={css({ fontSize: "sm", color: "gray.600", mb: "4" })}
							>
								Engineering Leader - AI & Product Strategy
							</p>
							<p
								className={css({
									fontSize: "xs",
									color: "gray.600",
									mb: "2",
									textAlign: { base: "center", md: "left" },
								})}
							>
								Available for consulting at{" "}
								<a
									href="https://plutonic.consulting"
									target="_blank"
									rel="noopener"
									className={css({
										color: "brand.600",
										textDecoration: "none",
										cursor: linkCursor,
										minHeight: { base: "44px", md: "auto" },
										padding: { base: "0.25rem", md: "0" },
										borderRadius: "4px",
										transition: "all 200ms ease-in-out",
										"@media (prefers-reduced-motion: reduce)": {
											transition: "none",
										},
										_hover: {
											textDecoration: "underline",
											color: "brand.600",
											backgroundColor: { base: "gray.50", _dark: "gray.800" },
										},
										_active: {
											backgroundColor: { base: "gray.100", _dark: "gray.700" },
										},
										_focus: {
											outline: "2px solid brand.700",
											outlineOffset: "2px",
											borderRadius: "4px",
										},
										"@media (hover: none) and (pointer: coarse)": {
											minHeight: "44px",
											padding: "0.25rem",
										},
									})}
								>
									Plutonic Consulting
								</a>
							</p>
							<p
								className={css({
									fontSize: "xs",
									color: "gray.600",
									textAlign: { base: "center", md: "left" },
								})}
							>
								© {currentYear} Nick Karnik. All rights reserved.
							</p>
						</div>

						{/* Column 2 - Contact & Professional Links */}
						<div
							className={css({
								width: "100%",
								textAlign: { base: "center", md: "left" },
								display: "flex",
								flexDirection: "column",
								alignItems: { base: "center", md: "flex-start" },
								gap: "0.5rem",
								paddingRight: { base: "0", md: "2rem" },
								borderRight: { base: "none", md: "1px solid" },
								borderColor: { base: "transparent", md: "gray.200", _dark: "dark.border" },
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
								href="/assets/documents/resume-nick-karnik.pdf"
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
								href="https://stackoverflow.com/users/460472/nick"
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
								href="https://www.codementor.io/@theoutlander"
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
								width: "100%",
								textAlign: { base: "center", md: "left" },
								display: "flex",
								flexDirection: "column",
								alignItems: { base: "center", md: "flex-start" },
								gap: "0.5rem",
							})}
						>
							<a
								href="https://github.com/theoutlander"
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
								href="https://www.linkedin.com/in/theoutlander"
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
								href="https://x.com/theoutlander"
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
								href="https://youtube.com/@nick-karnik"
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
					</div>
			</div>
		</footer>
	);
}
