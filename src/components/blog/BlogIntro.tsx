import React from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BlogIntro() {
	return (
		<section
			className={css({
				mt: 6,
				mb: 4,
				mx: "auto",
				maxW: "760px",
				textAlign: "left",
				"& p": {
					my: 2,
					lineHeight: "1.5",
				},
				"& p:first-of-type": {
					fontWeight: "700",
					color: { base: "gray.900", _dark: "gray.100" },
					fontSize: "lg",
					my: 3,
				},
				"& p:nth-of-type(2)": {
					color: { base: "gray.600", _dark: "gray.400" },
					fontSize: "md",
					my: 2,
					"& strong": {
						fontWeight: "700",
						color: { base: "gray.800", _dark: "gray.200" },
					},
				},
				"& p:last-of-type": {
					color: { base: "gray.500", _dark: "gray.500" },
					fontSize: "sm",
					my: 2,
					fontWeight: "400",
				},
				"& a": {
					textDecoration: "underline",
					color: { base: "blue.600", _dark: "blue.400" },
					fontWeight: "500",
					_hover: {
						color: { base: "blue.700", _dark: "blue.300" },
					},
				},
			})}
		>
			<p>
				I'm an engineering and product leader who's spent 25+ years building at
				Google, Microsoft, and Salesforce.
			</p>
			<p>
				I write about <strong>building products, leading teams,</strong> and{" "}
				<strong>learning through technology.</strong>
			</p>
			<p>
				For consulting or advisory work, visit{" "}
				<a href="https://plutonic.consulting">Plutonic Consulting</a>.
			</p>
		</section>
	);
}
