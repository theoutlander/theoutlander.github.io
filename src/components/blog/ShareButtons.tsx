import React, { useState } from "react";
import { css } from "../../../styled-system/css/index.mjs";
import { FaTwitter, FaLinkedin, FaFacebook, FaLink } from "react-icons/fa";
import { getIconColorStyles } from "../../utils/iconColors";

type ShareButtonsProps = {
	title: string;
	url: string;
	variant?: "default" | "compact";
};

const ICON_SIZE = 20;

export default function ShareButtons({ title, url, variant = "default" }: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);
	const fullUrl = url.startsWith("http") ? url : `https://nick.karnik.io${url}`;
	const encodedUrl = encodeURIComponent(fullUrl);
	const encodedTitle = encodeURIComponent(title);

	const shareLinks = {
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = fullUrl;
			textArea.style.position = "fixed";
			textArea.style.opacity = "0";
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const isCompact = variant === "compact";

	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				gap: isCompact ? 2 : 3,
				...(isCompact
					? {}
					: {
							mt: 8,
							pt: 6,
							borderTop: "1px solid",
							borderColor: "#e5e5e5",
					  }),
			})}
		>
			{!isCompact && (
				<span
					className={css({
						fontSize: "14px",
						color: "#666",
						fontWeight: "500",
						mr: 2,
					})}
				>
					Share:
				</span>
			)}
			<div
				className={css({
					display: "flex",
					gap: isCompact ? 1.5 : 2,
					alignItems: "center",
				})}
			>
				<a
					href={shareLinks.twitter}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Share on Twitter"
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: isCompact ? "32px" : "36px",
						height: isCompact ? "32px" : "36px",
						borderRadius: "6px",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						_hover: {
							transform: "translateY(-2px)",
							bg: "#f5f5f5",
						},
						"@media (prefers-reduced-motion: reduce)": {
							transition: "none",
							_hover: {
								transform: "none",
							},
						},
						_focus: {
							outline: "2px solid",
							outlineColor: "#6366f1",
							outlineOffset: "2px",
						},
					})}
				>
					<FaTwitter
						size={isCompact ? 18 : ICON_SIZE}
						style={{ color: "#1DA1F2" }}
						className={css({
							_hover: {
								color: "#0d8bd9",
							},
						})}
					/>
				</a>
				<a
					href={shareLinks.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Share on LinkedIn"
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: isCompact ? "32px" : "36px",
						height: isCompact ? "32px" : "36px",
						borderRadius: "6px",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						_hover: {
							transform: "translateY(-2px)",
							bg: "#f5f5f5",
						},
						"@media (prefers-reduced-motion: reduce)": {
							transition: "none",
							_hover: {
								transform: "none",
							},
						},
						_focus: {
							outline: "2px solid",
							outlineColor: "#6366f1",
							outlineOffset: "2px",
						},
					})}
				>
					<FaLinkedin
						size={isCompact ? 18 : ICON_SIZE}
						style={{ color: "#0A66C2" }}
						className={css({
							_hover: {
								color: "#004182",
							},
						})}
					/>
				</a>
				<a
					href={shareLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Share on Facebook"
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: isCompact ? "32px" : "36px",
						height: isCompact ? "32px" : "36px",
						borderRadius: "6px",
						cursor: "pointer",
						transition: "all 0.2s ease-in-out",
						_hover: {
							transform: "translateY(-2px)",
							bg: "#f5f5f5",
						},
						"@media (prefers-reduced-motion: reduce)": {
							transition: "none",
							_hover: {
								transform: "none",
							},
						},
						_focus: {
							outline: "2px solid",
							outlineColor: "#6366f1",
							outlineOffset: "2px",
						},
					})}
				>
					<FaFacebook
						size={isCompact ? 18 : ICON_SIZE}
						style={{ color: "#1877F2" }}
						className={css({
							_hover: {
								color: "#166FE5",
							},
						})}
					/>
				</a>
				<button
					onClick={handleCopyLink}
					aria-label={copied ? "Link copied!" : "Copy link"}
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: isCompact ? "32px" : "36px",
						height: isCompact ? "32px" : "36px",
						borderRadius: "6px",
						cursor: "pointer",
						border: "none",
						bg: "transparent",
						transition: "all 0.2s ease-in-out",
						_hover: {
							transform: "translateY(-2px)",
							bg: "#f5f5f5",
						},
						"@media (prefers-reduced-motion: reduce)": {
							transition: "none",
							_hover: {
								transform: "none",
							},
						},
						_focus: {
							outline: "2px solid",
							outlineColor: "#6366f1",
							outlineOffset: "2px",
						},
					})}
				>
					<FaLink
						size={isCompact ? 18 : ICON_SIZE}
						className={css({
							color: copied ? "#10b981" : "#666",
							transition: "color 0.2s ease-in-out",
						})}
					/>
				</button>
			</div>
		</div>
	);
}
