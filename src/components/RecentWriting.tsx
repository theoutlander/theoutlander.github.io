import { css } from "../../styled-system/css/index.mjs";
import type { BlogPost } from "../types/blog";

function parsePostDate(date: string): number {
	const t = Date.parse(date);
	return Number.isNaN(t) ? 0 : t;
}

function formatDisplayDate(date: string): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function excerptSnippet(excerpt: string, maxLen = 180): string {
	const t = excerpt.trim().replace(/\s+/g, " ");
	if (t.length <= maxLen) return t;
	return `${t.slice(0, maxLen).trim()}…`;
}

export default function RecentWriting({ posts }: { posts: BlogPost[] }) {
	const list = [...(posts ?? [])]
		.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
		.slice(0, 3);

	if (list.length === 0) return null;

	return (
		<section
			data-testid="recent-writing"
			className={css({
				bg: "white",
				mt: "0",
				py: { base: "6", md: "8" },
				borderBottomWidth: "1px",
				borderBottomStyle: "solid",
				borderBottomColor: { base: "gray.200", _dark: "gray.700" },
				_dark: { bg: "dark.surface" },
			})}
			aria-labelledby="recent-writing-heading"
		>
			<div
				className={css({
					maxW: "1040px",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
				<h2
					id="recent-writing-heading"
					className={css({
						fontWeight: "bold",
						fontSize: { base: "2xl", sm: "3xl", md: "4xl" },
						mb: { base: "6", md: "8" },
						color: { base: "gray.900", _dark: "dark.text" },
						lineHeight: "1.2",
					})}
				>
					Recent Writing
				</h2>
				<ul
					className={css({
						listStyle: "none",
						m: 0,
						p: 0,
						display: "flex",
						flexDirection: "column",
						gap: { base: "6", md: "8" },
					})}
				>
					{list.map((post) => (
						<li key={post.slug}>
							<a
								href={post.url}
								className={css({
									display: "block",
									textDecoration: "none",
									color: "inherit",
									_focusVisible: {
										outline: "2px solid",
										outlineColor: "brand.600",
										outlineOffset: "4px",
										borderRadius: "md",
									},
								})}
							>
								<h3
									className={css({
										fontSize: { base: "lg", md: "xl" },
										fontWeight: "semibold",
										color: { base: "brand.700", _dark: "brand.400" },
										mb: "1",
										lineHeight: "1.3",
										_hover: { textDecoration: "underline" },
									})}
								>
									{post.title}
								</h3>
								<time
									dateTime={post.date}
									className={css({
										display: "block",
										fontSize: "sm",
										color: { base: "gray.500", _dark: "gray.400" },
										mb: "2",
									})}
								>
									{formatDisplayDate(post.date)}
								</time>
								<p
									className={css({
										fontSize: "md",
										lineHeight: "1.6",
										color: { base: "gray.600", _dark: "gray.300" },
										m: 0,
									})}
								>
									{excerptSnippet(post.excerpt)}
								</p>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
