import React from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BlogIntro() {
	return (
		<section
			className={css({
				maxW: "760px",
				mx: "auto",
				mb: 3,
				"& p": {
					my: 2,
					lineHeight: "1.5",
					color: "inherit",
				},
				"& .cta": {
					color: { base: "gray.600", _dark: "gray.400" },
				},
				"& a": {
					textDecoration: "underline",
					color: { base: "blue.600", _dark: "blue.400" },
					_hover: {
						color: { base: "blue.700", _dark: "blue.300" },
					},
				},
			})}
		>
			<p>
				I'm an engineering and product leader who's spent 25+ years building at Google, Microsoft, and Salesforce.
			</p>
			<p>
				I write about <strong>building products</strong>, <strong>leading teams</strong>, and <strong>learning through technology</strong>.
			</p>
			<p className="cta">
				→ For consulting or advisory work, visit <a href="https://plutonic.consulting">Plutonic Consulting</a>.
			</p>
		</section>
	);
}