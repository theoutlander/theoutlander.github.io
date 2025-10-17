import { useEffect, useRef, useState } from "react";
import { FaComment, FaHeart, FaCog } from "react-icons/fa";
import UtterancesComments from "./UtterancesComments";
import SimpleComments from "./SimpleComments";
import { COMMENTS_CONFIG } from "../../lib/comments";
import { css } from "../../../styled-system/css/index.mjs";
import {
	commentsSection,
	commentsContainer,
	commentsHeader,
	commentsTitle,
	commentsContent,
	commentsActions,
} from "../../../styled-system/recipes/index.mjs";

interface CommentsProps {
	postTitle: string;
	postUrl: string;
}

type CommentSystem = "giscus" | "utterances" | "simple";

export default function Comments({ postTitle, postUrl }: CommentsProps) {
	const commentsRef = useRef<HTMLDivElement>(null);
	const [commentSystem, setCommentSystem] =
		useState<CommentSystem>("utterances");

	useEffect(() => {
		// Only load Giscus on client side
		if (typeof window === "undefined" || commentSystem !== "giscus") return;

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
	}, [postTitle, postUrl, commentSystem]);


	// If using Utterances, render the Utterances component
	if (commentSystem === "utterances") {
		return (
			<UtterancesComments
				postTitle={postTitle}
				postUrl={postUrl}
			/>
		);
	}

	// If using Simple comments, render the Simple component
	if (commentSystem === "simple") {
		// Extract slug from postUrl for post-specific comments
		const postSlug = postUrl.split("/").pop() || "default";
		return <SimpleComments postSlug={postSlug} />;
	}

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
						<div
							className={css({
								display: "flex",
								gap: "12px",
								alignItems: "center",
							})}
						>
							<FaComment
								size={20}
								color="#3182ce"
							/>
							<h2
								className={css({
									fontSize: "1.5rem",
									fontWeight: "600",
									color: "#1a202c",
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
								{commentSystem === "giscus" ? "Giscus Comments" : 
								 commentSystem === "utterances" ? "Utterances Comments" : 
								 "Simple Comments"}
							</span>
						</div>
						<div className={css({ display: "flex", gap: "12px" })}>
							<FaHeart
								size={16}
								color="#fc8181"
							/>
							<div className={css({ display: "flex", gap: "8px" })}>
								<FaCog
									size={12}
									color="#a0aec0"
								/>
								<div>
									<p
										className={css({
											fontSize: "12px",
											color: "#a0aec0",
											margin: "0 0 4px 0",
										})}
									>
										Comment System
									</p>
									<select
										id="comment-system-select"
										value={commentSystem}
										onChange={(e) =>
											setCommentSystem(e.target.value as CommentSystem)
										}
										aria-label="Select comment system"
										className={css({
											padding: "4px 8px",
											border: "1px solid #e2e8f0",
											borderRadius: "4px",
											fontSize: "14px",
										})}
									>
										<option value="giscus">Giscus Comments</option>
										<option value="utterances">Utterances Comments</option>
										<option value="simple">Simple Comments</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<p
						className={css({
							color: "#718096",
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
						<div
							className={css({
								display: "flex",
								flexDirection: "column",
								gap: "16px",
							})}
						>
							<div
								className={css({
									display: "flex",
									gap: "12px",
									alignItems: "center",
								})}
							>
								<FaComment
									size={20}
									color="#4a5568"
								/>
								<p
									className={css({
										fontSize: "16px",
										fontWeight: "500",
										color: "#4a5568",
										margin: 0,
									})}
								>
									Ready to join the conversation?
								</p>
							</div>

							<div
								className={css({
									display: "flex",
									gap: "12px",
									flexWrap: "wrap",
								})}
							>
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
