import { useEffect, useState } from "react";
import { css } from "../../styled-system/css";

type Post = {
	id?: string;
	slug: string;
	title: string;
	url: string;
	date: string;
	excerpt: string;
	cover: string;
	tags: string[];
};

export default function Post({ slug }: { slug: string }) {
	const [post, setPost] = useState<Post | null>(null);

	useEffect(() => {
		fetch("/data/hashnode.json")
			.then((r) => r.json())
			.then((all: Post[]) => setPost(all.find((p) => p.slug === slug) ?? null))
			.catch(() => setPost(null));
	}, [slug]);

	if (!post) return <div className={css({ p: 6 })}>Loading…</div>;

	return (
		<div
			className={css({
				maxW: "768px",
				mx: "auto",
				p: 6,
			})}
		>
			{post.cover ? (
				<img
					src={post.cover}
					alt=""
					className={css({
						mb: 4,
						borderRadius: "12px",
						w: "100%",
					})}
				/>
			) : null}
			<h1
				className={css({
					fontSize: "1.5rem",
					fontWeight: "600",
					m: 0,
				})}
			>
				{post.title}
			</h1>
			<p
				className={css({
					opacity: 0.7,
					mt: 1,
				})}
			>
				{post.date ? new Date(post.date).toDateString() : ""}
			</p>
			<p className={css({ mt: 4 })}>{post.excerpt}</p>
			<p className={css({ mt: 6 })}>
				Full post on Hashnode:{" "}
				<a
					href={post.url}
					target="_blank"
					rel="noopener noreferrer"
					className={css({ color: "blue.500", textDecoration: "underline" })}
				>
					{post.url}
				</a>
			</p>
		</div>
	);
}
