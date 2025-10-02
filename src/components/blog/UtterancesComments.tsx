import { useEffect, useRef } from "react";
import { FaComment, FaHeart } from "react-icons/fa";
import { COMMENTS_CONFIG } from "../../lib/comments";
import { css } from "../../styled-system/css/index.mjs";
import {
	commentsSection,
	commentsContainer,
	commentsHeader,
	commentsTitle,
	commentsContent,
	commentsActions,
} from "../../styled-system/recipes/index.mjs";

interface UtterancesCommentsProps {
	postTitle: string;
	postUrl: string;
}

export default function UtterancesComments({
	postTitle,
	postUrl,
}: UtterancesCommentsProps) {
	const commentsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only load Utterances on client side
		if (typeof window === "undefined") return;

		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.setAttribute("repo", COMMENTS_CONFIG.githubRepo);
		script.setAttribute("issue-term", COMMENTS_CONFIG.utterances.issueTerm);
		script.setAttribute("theme", COMMENTS_CONFIG.utterances.theme);
		script.setAttribute("crossorigin", "anonymous");
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
		<div className={commentsSection()}>
			<hr
				className={css({
					border: "none",
					borderTop: "1px solid #e2e8f0",
					mb: "32px",
				})}
			/>

			<div className={commentsContainer()}>
				<div className={commentsHeader()}>
					<div
						className={css({
							display: "flex",
							gap: "12px",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
						})}
					>
						<div className={commentsTitle()}>
							<FaComment
								size={20}
								color="#3182ce"
							/>
							<h2
								className={css({
									fontSize: "1.5rem",
									fontWeight: "600",
									color: "text.primary",
									margin: 0,
								})}
							>
								Comments
							</h2>
							<span
								className={css({
									backgroundColor: "#ebf8ff",
									color: "#3182ce",
									padding: "4px 8px",
									borderRadius: "4px",
									fontSize: "12px",
									fontWeight: "500",
								})}
							>
								Live Comments
							</span>
						</div>
						<FaHeart
							size={16}
							color="#fc8181"
						/>
					</div>

					<p
						className={css({
							color: "text.secondary",
							fontSize: "16px",
							lineHeight: "1.6",
							margin: 0,
						})}
					>
						Share your thoughts and join the discussion! Leave a comment below.
					</p>

					<div
						className={css({
							padding: "24px",
							background: "linear-gradient(to right, #ebf8ff, #faf5ff)",
							borderRadius: "12px",
							border: "1px solid #bee3f8",
						})}
					>
						<div className={commentsContent()}>
							<div className={commentsTitle()}>
								<FaComment
									size={20}
									color="#4a5568"
								/>
								<p
									className={css({
										fontSize: "16px",
										fontWeight: "500",
										color: "text.muted",
										margin: 0,
									})}
								>
									Ready to join the conversation?
								</p>
							</div>

							<div className={commentsActions()}>
								<button
									className={css({
										padding: "8px 16px",
										border: "1px solid #e2e8f0",
										borderRadius: "6px",
										backgroundColor: "white",
										color: "#1a202c",
										fontSize: "14px",
										cursor: "pointer",
										transition: "all 0.2s",
									})}
									onClick={() => {
										// Scroll to comments section
										commentsRef.current?.scrollIntoView({ behavior: "smooth" });
									}}
								>
									Scroll to Comments
								</button>
							</div>
						</div>
					</div>

					<div
						ref={commentsRef}
						className={css({
							minHeight: "300px",
							borderRadius: "12px",
							overflow: "hidden",
							border: "1px solid #e2e8f0",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							backgroundColor: "white",
						})}
					/>
				</div>
			</div>
		</div>
	);
}
