import { useEffect, useState } from "react";
import { css } from "../../styled-system/css";

export default function ProgressTop() {
	const [value, setValue] = useState(0);
	useEffect(() => {
		const onScroll = () => {
			const h = document.documentElement;
			const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
			setValue(Math.max(0, Math.min(100, scrolled)));
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return (
		<div
			className={css({
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 20,
				height: "4px",
				backgroundColor: "#f7fafc",
			})}
		>
			<div
				className={css({
					height: "100%",
					backgroundColor: "#3182ce",
					width: `${value}%`,
					transition: "width 0.1s ease-out",
				})}
			/>
		</div>
	);
}
