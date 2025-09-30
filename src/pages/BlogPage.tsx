import React from 'react';
import { Helmet } from 'react-helmet-async';

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

function Header() {
  const BRAND = 'Nick Karnik';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        backdropFilter: 'saturate(180%) blur(8px)',
      }}
    >
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <a href='/' style={{ textDecoration: 'none' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a202c',
                margin: 0,
              }}
            >
              {BRAND}
            </h2>
          </a>

          <div style={{ display: 'flex', gap: '24px' }}>
            <a href='/blog' style={{ textDecoration: 'none' }}>
              <span
                style={{
                  color: '#3182ce',
                  fontWeight: '500',
                  fontSize: '16px',
                }}
              >
                Blog
              </span>
            </a>
            <a href='/about' style={{ textDecoration: 'none' }}>
              <span
                style={{
                  color: '#718096',
                  fontSize: '16px',
                }}
              >
                About
              </span>
            </a>
            <a href='/resume' style={{ textDecoration: 'none' }}>
              <span
                style={{
                  color: '#718096',
                  fontSize: '16px',
                }}
              >
                Resume
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0',
        padding: '32px 0',
        marginTop: '64px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: '#718096',
            }}
          >
            © 2024 Nick Karnik. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a
              href='https://github.com/theoutlander'
              target='_blank'
              rel='noopener noreferrer'
              style={{ textDecoration: 'none' }}
            >
              <span
                style={{
                  fontSize: '14px',
                  color: '#718096',
                }}
              >
                GitHub
              </span>
            </a>
            <a
              href='https://www.linkedin.com/in/theoutlander'
              target='_blank'
              rel='noopener noreferrer'
              style={{ textDecoration: 'none' }}
            >
              <span
                style={{
                  fontSize: '14px',
                  color: '#718096',
                }}
              >
                LinkedIn
              </span>
            </a>
            <a href='mailto:nick@karnik.io' style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: '#718096',
                }}
              >
                Email
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
      }}
    >
      {post.cover && (
        <div>
          <img
            src={post.cover}
            alt=''
            style={{
              objectFit: 'cover',
              maxHeight: '260px',
              width: '100%',
            }}
          />
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <a href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#3182ce',
              margin: '0 0 4px 0',
            }}
          >
            {post.title}
          </h3>
        </a>
        <p
          style={{
            fontSize: '14px',
            color: '#718096',
            margin: '0 0 12px 0',
          }}
        >
          {post.date ? new Date(post.date).toDateString() : ''}
          {post.excerpt
            ? ` · ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read`
            : ''}
        </p>
        {post.excerpt && (
          <p
            style={{
              color: '#1a202c',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {post.excerpt}
          </p>
        )}
      </div>
    </div>
  );
}

export function BlogPage({ posts }: BlogPageProps) {
  return (
    <div
      style={{
        backgroundColor: '#f7fafc',
        minHeight: '100vh',
      }}
    >
      <Header />
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 24px 40px 24px',
        }}
      >
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 16px 0',
              color: '#1a202c',
            }}
          >
            Blog
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#718096',
              maxWidth: '600px',
              margin: 0,
            }}
          >
            Thoughts on engineering, AI, and technology from my experience
            building and leading teams.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {posts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
