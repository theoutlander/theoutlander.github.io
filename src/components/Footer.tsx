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
});

export default function Footer() {
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
						maxW: "768px",
						mx: "auto",
					})}
				>
					<div
						className={flex({
							direction: { base: "column", md: "row" },
							gap: { base: "8", md: "12" },
							alignItems: { base: "flex-start", md: "flex-start" },
							justifyContent: { base: "flex-start", md: "space-between" },
						})}
					>
						{/* Left column - Bio */}
						<div
							className={css({
								flex: 1,
								width: "100%",
								textAlign: "left",
								alignSelf: "stretch",
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-start",
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
									paddingLeft: "12px",
								})}
							>
								© 2025 Nick Karnik. All rights reserved.
							</p>
						</div>

						{/* Right column - Links */}
						<div
							className={css({
								flex: 1,
								width: "100%",
								textAlign: "left",
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-start",
							})}
						>
							<div
								className={css({
									display: "flex",
									flexWrap: "wrap",
									gap: "2",
									mb: "4",
									justifyContent: "flex-start",
								})}
							>
								<a
									href="mailto:nick@karnik.io"
									target="_blank"
									rel="noopener"
									aria-label="Send email to Nick Karnik"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("email"))}
									>
										<MdEmail size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="https://github.com/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's GitHub profile"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("github"))}
									>
										<FaGithub size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="https://www.linkedin.com/in/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's LinkedIn profile"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("linkedin"))}
									>
										<FaLinkedin size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="https://x.com/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's X profile"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("twitter"))}
									>
										<FaTwitter size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="https://youtube.com/@nick-karnik"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's YouTube channel"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("youtube"))}
									>
										<FaYoutube size={ICON_SIZE} />
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
										className={css(
											iconWrapper,
											getIconColorStyles("stackoverflow")
										)}
									>
										<FaStackOverflow size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="https://www.codementor.io/@theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's Codementor profile"
									className={iconLinkContainer}
								>
									<div
										className={css(
											iconWrapper,
											getIconColorStyles("codementor")
										)}
									>
										<CodementorIcon size={ICON_SIZE} />
									</div>
								</a>
								<a
									href="/assets/documents/resume-nick-karnik.pdf"
									target="_blank"
									rel="noopener"
									aria-label="Download Nick Karnik's resume (PDF)"
									className={iconLinkContainer}
								>
									<div
										className={css(iconWrapper, getIconColorStyles("resume"))}
									>
										<HiOutlineDocumentText size={ICON_SIZE} />
									</div>
								</a>
							</div>
							<p
								className={css({
									fontSize: "xs",
									color: "gray.600",
									paddingLeft: "12px",
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
										_hover: {
											textDecoration: "underline",
											color: "brand.600",
										},
										_focus: {
											outline: "2px solid brand.700",
											outlineOffset: "2px",
											borderRadius: "2px",
										},
										transition: "color 200ms ease-in-out",
										"@media (prefers-reduced-motion: reduce)": {
											transition: "none",
										},
									})}
								>
									Plutonic Consulting
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
