import { useEffect, useState } from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BackToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			// Show button when user is in the bottom 20% of the page
			const scrollTop = window.pageYOffset;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollPercent = (scrollTop + windowHeight) / documentHeight;
			
			if (scrollPercent > 0.8) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility, { passive: true });
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (!isVisible) {
		return null;
	}

	return (
		<button
			onClick={scrollToTop}
			aria-label="Back to top"
			className={css({
				position: "fixed",
				bottom: "24px",
				right: "24px",
				zIndex: 50,
				width: "48px",
				height: "48px",
				borderRadius: "50%",
				backgroundColor: "brand.600",
				color: "white",
				border: "none",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
				transition: "all 0.2s ease-in-out",
				_hover: {
					backgroundColor: "brand.700",
					transform: "translateY(-2px)",
					boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
				},
				_focus: {
					outline: "2px solid brand.600",
					outlineOffset: "2px",
				},
				"@media (prefers-reduced-motion: reduce)": {
					transition: "none",
					_hover: {
						transform: "none",
					},
				},
			})}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="m18 15-6-6-6 6" />
			</svg>
		</button>
	);
}
