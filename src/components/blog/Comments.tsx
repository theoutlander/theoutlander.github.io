import { useEffect, useRef } from "react";
import { FaComment, FaHeart } from "react-icons/fa";
import { COMMENTS_CONFIG } from "../../lib/comments";
import { css } from "../../../styled-system/css/index.mjs";
import {
	commentsSection,
	commentsContainer,
	commentsHeader,
} from "../../../styled-system/recipes/index.mjs";


interface CommentsProps {
	postTitle: string;
	postUrl: string;
}

export default function Comments({ postTitle, postUrl }: CommentsProps) {
	const commentsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only load Giscus on client side
		if (typeof window === "undefined") return;

		const script = document.createElement("script");
		script.src = "https://giscus.app/client.js";
		script.setAttribute("data-repo", COMMENTS_CONFIG.githubRepo);
		script.setAttribute("data-repo-id", COMMENTS_CONFIG.giscus.repoId);
		script.setAttribute("data-category", COMMENTS_CONFIG.giscus.category);
		script.setAttribute("data-category-id", COMMENTS_CONFIG.giscus.categoryId);
		script.setAttribute("data-mapping", COMMENTS_CONFIG.giscus.mapping);
		script.setAttribute("data-strict", COMMENTS_CONFIG.giscus.strict);
		script.setAttribute(
			"data-reactions-enabled",
			COMMENTS_CONFIG.giscus.reactionsEnabled
		);
		script.setAttribute(
			"data-emit-metadata",
			COMMENTS_CONFIG.giscus.emitMetadata
		);
		script.setAttribute(
			"data-input-position",
			COMMENTS_CONFIG.giscus.inputPosition
		);
		script.setAttribute("data-theme", COMMENTS_CONFIG.giscus.theme);
		script.setAttribute("data-lang", COMMENTS_CONFIG.giscus.lang);
		script.setAttribute("data-loading", COMMENTS_CONFIG.giscus.loading);
		script.crossOrigin = "anonymous";
		script.async = true;

		// Capture the ref value
		const currentRef = commentsRef.current;

		// Clear previous comments
		if (currentRef) {
			currentRef.innerHTML = "";
			currentRef.appendChild(script);
		}

		return () => {
			// Cleanup
			if (currentRef) {
				currentRef.innerHTML = "";
			}
		};
	}, [postTitle, postUrl]);

	return (
		<div className={css({ mt: 8, pt: 6, borderTop: "1px solid #e2e8f0" })}>
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					gap: 3,
					mb: 4,
				})}
			>
				<FaComment size={20} color="#3182ce" />
				<h2
					className={css({
						fontSize: "1.25rem",
						fontWeight: "600",
						color: "#1a202c",
						margin: 0,
					})}
				>
					Comments
				</h2>
			</div>

			<div
				ref={commentsRef}
				className={css({
					borderRadius: "8px",
					overflow: "hidden",
					border: "1px solid #e2e8f0",
					backgroundColor: "white",
				})}
			/>
		</div>
	);
}
