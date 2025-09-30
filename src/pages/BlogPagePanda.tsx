import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import Header from '../components/Header';
import Footer from '../components/Footer';
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

type BlogPageProps = {
  posts: Post[];
};

export function BlogPagePanda({ posts }: BlogPageProps) {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minH: '100vh',
      })}
    >
      <Header currentPage='blog' />
      <main
        className={css({
          maxW: '6xl',
          py: { base: 6, md: 10 },
          mx: 'auto',
          px: 4,
        })}
      >
        <div className={css({ mb: 12 })}>
          <h1
            className={css({
              fontSize: '3xl',
              fontWeight: 'bold',
              mb: 4,
              color: 'gray.800',
            })}
          >
            Blog
          </h1>
          <p
            className={css({
              fontSize: 'lg',
              color: 'gray.600',
              maxW: '600px',
            })}
          >
            Read my latest thoughts on software engineering, AI, and technology.
          </p>
        </div>

        <BlogList posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
