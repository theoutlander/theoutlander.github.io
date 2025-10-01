import React from "react";
import { css, cva } from "../../styled-system/css/index.mjs";
import {
	EnvelopeIcon,
	DocumentTextIcon,
	ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { FaLinkedin, FaGithub } from "react-icons/fa";

interface ContactSectionProps {
	className?: string;
}

// ====== shared primitives ======
const card = css({
	bg: { base: "white", _dark: "gray.900" },
	borderWidth: "1px",
	borderColor: { base: "gray.200", _dark: "gray.700" },
	borderRadius: "xl",
	boxShadow: { base: "sm", _dark: "none" },
});

const ghostBtn = cva({
	base: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 3,
		w: "full",
		px: 3,
		py: 2.5,
		fontSize: "sm",
		borderWidth: "0px",
		borderRadius: "md",
		transition: "all 0.2s ease",
		textDecoration: "none",
		"@media (prefers-reduced-motion: reduce)": {
			transition: "none",
		},
	},
	variants: {
		variant: {
			email: {
				color: { base: "brand.700", _dark: "brand.300" },
				_hover: {
					bg: { base: "blue.50", _dark: "blue.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(59, 130, 246, 0.15)",
						_dark: "0 4px 12px rgba(59, 130, 246, 0.1)",
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			linkedin: {
				color: { base: "brand.600", _dark: "brand.400" },
				_hover: {
					bg: { base: "blue.50", _dark: "blue.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(37, 99, 235, 0.15)",
						_dark: "0 4px 12px rgba(37, 99, 235, 0.1)",
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			github: {
				color: { base: "gray.700", _dark: "gray.300" },
				_hover: {
					bg: { base: "gray.50", _dark: "gray.800" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(0, 0, 0, 0.1)",
						_dark: "0 4px 12px rgba(255, 255, 255, 0.05)",
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			resume: {
				color: { base: "purple.700", _dark: "purple.300" },
				_hover: {
					bg: { base: "purple.50", _dark: "purple.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(147, 51, 234, 0.15)",
						_dark: "0 4px 12px rgba(147, 51, 234, 0.1)",
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
		},
	},
	defaultVariants: { variant: "email" },
});

const iconContainer = css({
	display: "flex",
	alignItems: "center",
	gap: 2,
	flex: 1,
});

const contactIcon = css({
	w: 5,
	h: 5,
	flexShrink: 0,
});

const sidebarTitle = css({
	fontSize: "sm",
	fontWeight: "semibold",
	color: { base: "gray.800", _dark: "gray.200" },
	mb: 3,
});

export default function ContactSection({ className }: ContactSectionProps) {
	return (
		<div className={[card, className].join(" ")}>
			<div className={css({ p: { base: 4, md: 5 } })}>
				<div className={sidebarTitle}>Contact</div>
				<a
					className={ghostBtn({ variant: "email" })}
					href="mailto:nick@karnik.io"
				>
					<div className={iconContainer}>
						<EnvelopeIcon className={contactIcon} />
						<span>Email</span>
					</div>
				</a>
				<a
					className={ghostBtn({ variant: "linkedin" })}
					href="https://www.linkedin.com/in/theoutlander"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className={iconContainer}>
						<FaLinkedin className={contactIcon} />
						<span>LinkedIn</span>
					</div>
					<ArrowTopRightOnSquareIcon
						className={css({ w: 4, h: 4, opacity: 0.6 })}
					/>
				</a>
				<a
					className={ghostBtn({ variant: "github" })}
					href="https://github.com/theoutlander"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className={iconContainer}>
						<FaGithub className={contactIcon} />
						<span>GitHub</span>
					</div>
					<ArrowTopRightOnSquareIcon
						className={css({ w: 4, h: 4, opacity: 0.6 })}
					/>
				</a>
				<a
					className={ghostBtn({ variant: "resume" })}
					href="/resume"
				>
					<div className={iconContainer}>
						<DocumentTextIcon className={contactIcon} />
						<span>Resume</span>
					</div>
				</a>
			</div>
		</div>
	);
}
