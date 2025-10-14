import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";
import {
	FaNodeJs,
	FaReact,
	FaGithub,
	FaLinkedin,
	FaTwitter,
	FaYoutube,
	FaStackOverflow,
} from "react-icons/fa";
import { SiTypescript } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

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
							alignItems: { base: "center", md: "flex-start" },
							justifyContent: { base: "center", md: "space-between" },
						})}
					>
						{/* Left column - Bio */}
						<div className={css({ flex: 1 })}>
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
								Engineering Leader & Staff Software Engineer
							</p>
							<div className={hstack({ gap: "2", wrap: "wrap", mb: "6" })}>
								<div className={hstack({ gap: "1" })}>
									<FaNodeJs
										color="#3C873A"
										title="Node.js"
										size={20}
									/>
									<span className={css({ fontSize: "xs", color: "gray.600" })}>
										Node
									</span>
								</div>
								<div className={hstack({ gap: "1" })}>
									<FaReact
										color="#61DAFB"
										title="React"
										size={20}
									/>
									<span className={css({ fontSize: "xs", color: "gray.600" })}>
										React
									</span>
								</div>
								<div className={hstack({ gap: "1" })}>
									<SiTypescript
										color="#3178C6"
										title="TypeScript"
										size={20}
									/>
									<span className={css({ fontSize: "xs", color: "gray.600" })}>
										TypeScript
									</span>
								</div>
							</div>
							<p className={css({ fontSize: "xs", color: "gray.600" })}>
								© 2025 Nick Karnik. All rights reserved.
							</p>
						</div>

						{/* Right column - Links */}
						<div className={css({ flex: 1 })}>
							<h3
								className={css({
									fontSize: "sm",
									fontWeight: "bold",
									mb: "4",
									color: { base: "gray.800", _dark: "dark.text" },
								})}
							>
								Connect
							</h3>
							<div className={hstack({ gap: "2", wrap: "wrap", mb: "4" })}>
								<a
									href="mailto:nick@karnik.io"
									target="_blank"
									rel="noopener"
									aria-label="Send email to Nick Karnik"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<MdEmail size={18} />
									</div>
								</a>
								<a
									href="https://github.com/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's GitHub profile"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<FaGithub size={18} />
									</div>
								</a>
								<a
									href="https://www.linkedin.com/in/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's LinkedIn profile"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<FaLinkedin size={18} />
									</div>
								</a>
								<a
									href="https://x.com/theoutlander"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's X profile"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<FaTwitter size={18} />
									</div>
								</a>
								<a
									href="https://youtube.com/@nick-karnik"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's YouTube channel"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<FaYoutube size={18} />
									</div>
								</a>
								<a
									href="https://stackoverflow.com/users/460472/nick"
									target="_blank"
									rel="noopener"
									aria-label="Visit Nick Karnik's Stack Overflow profile"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<FaStackOverflow size={18} />
									</div>
								</a>
								<a
									href="/assets/documents/resume-nick-karnik.pdf"
									target="_blank"
									rel="noopener"
									aria-label="Download Nick Karnik's resume (PDF)"
									className={css({
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minWidth: "44px",
										minHeight: "44px",
										borderRadius: "4px",
										_focus: {
											outline: "2px solid brand.600",
											outlineOffset: "2px",
										},
									})}
								>
									<div
										className={css({
											fontSize: "lg",
											color: { base: "gray.600", _dark: "dark.textSecondary" },
											_hover: { color: "brand.600" },
											transition: "color 200ms ease-in-out",
											"@media (prefers-reduced-motion: reduce)": {
												transition: "none",
											},
										})}
									>
										<HiOutlineDocumentText size={18} />
									</div>
								</a>
							</div>
							<p className={css({ fontSize: "xs", color: "gray.600" })}>
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
