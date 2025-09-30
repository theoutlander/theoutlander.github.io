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
				bg: "white",
				borderTop: "1px solid",
				borderColor: "gray.200",
				py: "12",
			})}
		>
			<div
				className={flex({
					direction: { base: "column", md: "row" },
					gap: "12",
					maxW: "6xl",
					mx: "auto",
					px: "6",
				})}
			>
				{/* Left column - Bio */}
				<div className={css({ flex: 1 })}>
					<h2
						className={css({ fontSize: "lg", fontWeight: "semibold", mb: "2" })}
					>
						Nick Karnik
					</h2>
					<p className={css({ fontSize: "md", color: "fg.muted", mb: "4" })}>
						Engineering Leader & Staff Software Engineer
					</p>
					<div className={hstack({ gap: "2", wrap: "wrap", mb: "6" })}>
						<div className={hstack({ gap: "1" })}>
							<FaNodeJs
								color="#3C873A"
								title="Node.js"
								size={20}
							/>
							<span className={css({ fontSize: "sm", color: "fg.muted" })}>
								Node
							</span>
						</div>
						<div className={hstack({ gap: "1" })}>
							<FaReact
								color="#61DAFB"
								title="React"
								size={20}
							/>
							<span className={css({ fontSize: "sm", color: "fg.muted" })}>
								React
							</span>
						</div>
						<div className={hstack({ gap: "1" })}>
							<SiTypescript
								color="#3178C6"
								title="TypeScript"
								size={20}
							/>
							<span className={css({ fontSize: "sm", color: "fg.muted" })}>
								TypeScript
							</span>
						</div>
					</div>
					<p className={css({ fontSize: "sm", color: "fg.muted" })}>
						© 2025 Nick Karnik. All rights reserved.
					</p>
				</div>

				{/* Right column - Links */}
				<div className={css({ flex: 1 })}>
					<h3
						className={css({ fontSize: "md", fontWeight: "semibold", mb: "4" })}
					>
						Connect
					</h3>
					<div className={hstack({ gap: "4", wrap: "wrap", mb: "4" })}>
						<a
							href="mailto:nick@karnik.io"
							target="_blank"
							rel="noopener"
							title="Email"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<MdEmail />
							</div>
						</a>
						<a
							href="https://github.com/theoutlander"
							target="_blank"
							rel="noopener"
							title="GitHub"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<FaGithub />
							</div>
						</a>
						<a
							href="https://www.linkedin.com/in/theoutlander"
							target="_blank"
							rel="noopener"
							title="LinkedIn"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<FaLinkedin />
							</div>
						</a>
						<a
							href="https://twitter.com/theoutlander"
							target="_blank"
							rel="noopener"
							title="Twitter"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<FaTwitter />
							</div>
						</a>
						<a
							href="https://youtube.com/@nick-karnik"
							target="_blank"
							rel="noopener"
							title="YouTube"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<FaYoutube />
							</div>
						</a>
						<a
							href="https://stackoverflow.com/users/460472/nick"
							target="_blank"
							rel="noopener"
							title="Stack Overflow"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<FaStackOverflow />
							</div>
						</a>
						<a
							href="/assets/documents/resume-nick-karnik.pdf"
							target="_blank"
							rel="noopener"
							title="Resume"
						>
							<div
								className={css({
									fontSize: "lg",
									color: "fg.muted",
									_hover: { color: "accent.600" },
								})}
							>
								<HiOutlineDocumentText />
							</div>
						</a>
					</div>
					<p className={css({ fontSize: "sm", color: "fg.muted" })}>
						Available for consulting at{" "}
						<a
							href="https://plutonic.consulting"
							target="_blank"
							rel="noopener"
							className={css({
								color: "accent.600",
								_hover: { textDecoration: "underline" },
							})}
						>
							Plutonic Consulting
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
