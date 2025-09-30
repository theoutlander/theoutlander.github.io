import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import BlogList from '../components/blog/BlogList';

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  cover: string;
  tags: string[];
};

// Define the window interface for initial data
declare global {
  interface Window {
    __INITIAL_BLOG_DATA__?: Post[];
  }
}

export const Route = createFileRoute('/blog/t/$tag')({
  component: function BlogTagComponent() {
    const { tag } = Route.useParams();
    const [posts, setPosts] = useState<Post[] | null>(() => {
      // Initialize with pre-populated data if available
      if (typeof window !== 'undefined' && window.__INITIAL_BLOG_DATA__) {
        return window.__INITIAL_BLOG_DATA__;
      }
      return null;
    });

    useEffect(() => {
      // Only fetch if we don't have pre-populated data
      if (!posts) {
        fetch('/data/hashnode.json')
          .then(r => r.json())
          .then(setPosts)
          .catch(() => setPosts([]));
      }
    }, [posts]);

    return <BlogList posts={posts ?? []} filterTag={tag} />;
  },
});
