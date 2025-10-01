import { css } from "../../styled-system/css/index.mjs";

export default function SkipLink() {
	return (
		<a
			href="#main-content"
			className={css({
				position: "absolute",
				top: "-40px",
				left: "6px",
				background: "brand.600",
				color: "white",
				padding: "8px 12px",
				textDecoration: "none",
				borderRadius: "4px",
				zIndex: "1000",
				fontSize: "sm",
				fontWeight: "medium",
				transition: "top 200ms ease-in-out",
				_focus: {
					top: "6px",
					outline: "2px solid white",
					outlineOffset: "2px",
				},
				"@media (prefers-reduced-motion: reduce)": {
					transition: "none",
				},
			})}
		>
			Skip to main content
		</a>
	);
}
