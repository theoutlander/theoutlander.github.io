import React from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BlogIntro() {
	const blogIntroStyles = css({
		maxW: "760px",
		mx: "auto",
		mb: 6, // Slightly more bottom margin
		p: 4, // Add some padding
		textAlign: "left",
		"& p": {
			m: 0,
			lineHeight: "1.6", // Slightly better line height
		},
		"& .lead": {
			fontWeight: "600",
			color: { base: "gray.900", _dark: "gray.100" },
			fontSize: "lg",
		},
		"& .sub": {
			mt: 4, // ~0.9rem breathing room from lead
			color: { base: "gray.600", _dark: "gray.400" },
			fontSize: "md",
		},
		"& .cta": {
			mt: 3, // ~0.7rem from sub
			fontSize: "0.95rem",
			color: { base: "gray.500", _dark: "gray.400" },
		},
		"& .cta a": {
			textDecoration: "underline",
			color: { base: "blue.600", _dark: "blue.400" },
			fontWeight: "500",
			_hover: {
				color: { base: "blue.700", _dark: "blue.300" },
			},
		},
		// Mobile adjustments - reduce spacing slightly
		"@media (max-width: 480px)": {
			p: 2, // Less padding on mobile
			"& .sub": {
				mt: "0.8rem", // Slightly tighter on mobile
			},
			"& .cta": {
				mt: "0.6rem", // Slightly tighter on mobile
			},
		},
	});

	const strongStyles = css({
		fontWeight: "700",
		color: { base: "gray.800", _dark: "gray.200" },
	});

	return (
		<div className={`blog-intro ${blogIntroStyles}`}>
			<p className="lead">
				I'm an engineering leader with 25+ years at{" "}
				<strong className={strongStyles}>
					Google, Microsoft, Salesforce, Tableau, and startups.
				</strong>
				. 
			</p>
			<p className="sub">
				I write about{" "}
				<strong className={strongStyles}>
					engineering leadership, AI strategy, and building high-performance teams.
				</strong>{" "}
			</p>
			<p className="cta">
				I'm currently focused on full-time engineering leadership roles in AI, platform, and product engineering.
			</p>
		</div>
	);
}
