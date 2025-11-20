import React from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BlogIntro() {
	const blogIntroStyles = css({
		maxW: "760px",
		mx: "auto",
		mb: 6,
		p: 4,
		textAlign: "left",
		"& p": {
			m: 0,
			lineHeight: "1.6",
		},
		"& .lead": {
			fontWeight: "600",
			color: "#000",
			fontSize: "lg",
		},
		"& .sub": {
			mt: 4,
			color: "#666",
			fontSize: "md",
		},
		"& .cta": {
			mt: 3,
			fontSize: "0.95rem",
			color: "#666",
		},
		"& .cta a": {
			textDecoration: "underline",
			color: "#000",
			fontWeight: "500",
		},
		"@media (max-width: 480px)": {
			p: 2,
			"& .sub": {
				mt: "0.8rem",
			},
			"& .cta": {
				mt: "0.6rem",
			},
		},
	});

	const strongStyles = css({
		fontWeight: "700",
		color: "#000",
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
					engineering leadership, AI strategy, and building high-performance
					teams.
				</strong>{" "}
			</p>
			<p className="cta">
				I'm currently focused on full-time engineering leadership roles in AI,
				platform, and product engineering.
			</p>
		</div>
	);
}
