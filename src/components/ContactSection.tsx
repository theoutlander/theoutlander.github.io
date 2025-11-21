import React from "react";
import { css, cva } from "../../styled-system/css/index.mjs";
import {
	EnvelopeIcon,
	DocumentTextIcon,
	ArrowTopRightOnSquareIcon,
	CalendarIcon,
} from "@heroicons/react/24/outline";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { iconColors } from "../utils/iconColors";
import { CodementorIcon } from "./CodementorIcon";

// Shared icon size constant - matches resume icon size
const ICON_SIZE = 18;

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
				color: { base: iconColors.email.light, _dark: iconColors.email.dark },
				_hover: {
					bg: { base: "blue.50", _dark: "blue.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(59, 130, 246, 0.15)",
						_dark: "0 4px 12px rgba(59, 130, 246, 0.1)",
					},
					color: {
						base: iconColors.email.hoverLight,
						_dark: iconColors.email.hoverDark,
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			linkedin: {
				color: {
					base: iconColors.linkedin.light,
					_dark: iconColors.linkedin.dark,
				},
				_hover: {
					bg: { base: "blue.50", _dark: "blue.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(37, 99, 235, 0.15)",
						_dark: "0 4px 12px rgba(37, 99, 235, 0.1)",
					},
					color: {
						base: iconColors.linkedin.hoverLight,
						_dark: iconColors.linkedin.hoverDark,
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			github: {
				color: { base: iconColors.github.light, _dark: iconColors.github.dark },
				_hover: {
					bg: { base: "gray.50", _dark: "gray.800" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(0, 0, 0, 0.1)",
						_dark: "0 4px 12px rgba(255, 255, 255, 0.05)",
					},
					color: {
						base: iconColors.github.hoverLight,
						_dark: iconColors.github.hoverDark,
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			resume: {
				color: { base: iconColors.resume.light, _dark: iconColors.resume.dark },
				_hover: {
					bg: { base: "purple.50", _dark: "purple.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(147, 51, 234, 0.15)",
						_dark: "0 4px 12px rgba(147, 51, 234, 0.1)",
					},
					color: {
						base: iconColors.resume.hoverLight,
						_dark: iconColors.resume.hoverDark,
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			calendar: {
				color: {
					base: iconColors.calendar.light,
					_dark: iconColors.calendar.dark,
				},
				_hover: {
					bg: { base: "green.50", _dark: "green.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(34, 197, 94, 0.15)",
						_dark: "0 4px 12px rgba(34, 197, 94, 0.1)",
					},
					color: {
						base: iconColors.calendar.hoverLight,
						_dark: iconColors.calendar.hoverDark,
					},
				},
				"@media (prefers-reduced-motion: reduce)": {
					_hover: {
						transform: "none",
					},
				},
			},
			codementor: {
				color: {
					base: iconColors.codementor.light,
					_dark: iconColors.codementor.dark,
				},
				_hover: {
					bg: { base: "orange.50", _dark: "orange.900/20" },
					transform: "translateY(-1px)",
					boxShadow: {
						base: "0 4px 12px rgba(249, 115, 22, 0.15)",
						_dark: "0 4px 12px rgba(249, 115, 22, 0.1)",
					},
					color: {
						base: iconColors.codementor.hoverLight,
						_dark: iconColors.codementor.hoverDark,
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
	flexShrink: 0,
});

const sidebarTitle = css({
	fontSize: "sm",
	fontWeight: "semibold",
	color: { base: "gray.800", _dark: "gray.200" },
	mb: 3,
	pb: 3,
	borderBottomWidth: "1px",
	borderColor: "gray.100",
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
						<EnvelopeIcon
							className={contactIcon}
							style={{ width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px` }}
						/>
						<span>Email</span>
					</div>
				</a>
				<a
					className={ghostBtn({ variant: "calendar" })}
					href="/calendar"
				>
					<div className={iconContainer}>
						<CalendarIcon
							className={contactIcon}
							style={{ width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px` }}
						/>
						<span>Schedule Meeting</span>
					</div>
				</a>
				<a
					className={ghostBtn({ variant: "linkedin" })}
					href="https://www.linkedin.com/in/theoutlander/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className={iconContainer}>
						<FaLinkedin
							size={ICON_SIZE}
							className={css({ flexShrink: 0 })}
						/>
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
						<FaGithub
							size={ICON_SIZE}
							className={css({ flexShrink: 0 })}
						/>
						<span>GitHub</span>
					</div>
					<ArrowTopRightOnSquareIcon
						className={css({ w: 4, h: 4, opacity: 0.6 })}
					/>
				</a>
				<a
					className={ghostBtn({ variant: "codementor" })}
					href="https://www.codementor.io/@theoutlander"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className={iconContainer}>
						<CodementorIcon
							size={ICON_SIZE}
							className={contactIcon}
						/>
						<span>Codementor</span>
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
						<DocumentTextIcon
							className={contactIcon}
							style={{ width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px` }}
						/>
						<span>Resume</span>
					</div>
				</a>
			</div>
		</div>
	);
}
