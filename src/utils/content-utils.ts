import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import { getAllPosts } from "../lib/client";
import type { Post } from "../lib/schema";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};

export type HashnodePostForList = {
	slug: string;
	data: {
		title: string;
		description: string;
		published: string;
		updated: string;
		tags: string[];
		category: string | null;
		image: string | null;
		draft: boolean;
		hashnode: true; // Flag to identify Hashnode posts
		hashnodeUrl: string;
		author: {
			name: string;
			profilePicture: string;
		};
		readTimeInMinutes: number;
	};
};

// Convert Hashnode post to match the expected format
function convertHashnodePost(hashnodePost: Post): HashnodePostForList {
	return {
		slug: `hashnode-${hashnodePost.slug}`,
		data: {
			title: hashnodePost.title,
			description: hashnodePost.brief,
			published: hashnodePost.publishedAt,
			updated: hashnodePost.publishedAt,
			tags: hashnodePost.tags.map((tag) => tag.name),
			category: null,
			image: hashnodePost.coverImage?.url || null,
			draft: false,
			hashnode: true,
			hashnodeUrl: `/hashnode/${hashnodePost.slug}`,
			author: hashnodePost.author,
			readTimeInMinutes: hashnodePost.readTimeInMinutes,
		},
	};
}
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

// Get Hashnode posts
export async function getHashnodePosts(): Promise<HashnodePostForList[]> {
	try {
		const data = await getAllPosts();
		const hashnodePosts = data.publication.posts.edges.map((edge) => edge.node);
		return hashnodePosts.map(convertHashnodePost);
	} catch (error) {
		console.warn("Failed to fetch Hashnode posts:", error);
		return [];
	}
}

// Get combined posts (local + Hashnode)
export async function getCombinedPosts(): Promise<
	(PostForList | HashnodePostForList)[]
> {
	const [localPosts, hashnodePosts] = await Promise.all([
		getSortedPostsList(),
		getHashnodePosts(),
	]);

	// Combine and sort by publication date
	const allPosts = [...localPosts, ...hashnodePosts];
	return allPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
}
