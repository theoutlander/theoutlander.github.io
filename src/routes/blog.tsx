import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import BlogList from '../components/blog/BlogList';
import { useEffect, useState } from 'react';

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

export const Route = createFileRoute('/blog')({
  component: function Blog() {
    const location = useLocation();
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

    // Only show blog list if we're exactly at /blog
    if (location.pathname === '/blog') {
      return <BlogList posts={posts ?? []} />;
    }
    // Otherwise, render the outlet for child routes
    return <Outlet />;
  },
});
