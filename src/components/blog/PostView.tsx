import { Helmet } from 'react-helmet-async';
import ProgressTop from '../ui/ProgressTop';
import PostJsonLd from '../seo/PostJsonLd';
import { proseStyles } from './PostProse';
import Comments from './Comments';

type Post = {
  id?: string;
  title: string;
  date: string;
  cover: string;
  excerpt: string;
  html: string;
  url: string;
  tags: string[];
};

export default function PostView({ post }: { post: Post }) {
  const postUrl =
    post.url ||
    `https://nick.karnik.io/blog/${post.title
      .toLowerCase()
      .replace(/\s+/g, '-')}`;

  return (
    <>
      <Helmet>
        <title>{post.title}</title>
        <meta name='description' content={post.excerpt || ''} />
        <link
          rel='canonical'
          href={typeof window === 'undefined' ? '' : window.location.href}
        />
        {post.cover ? <meta property='og:image' content={post.cover} /> : null}
        <meta property='og:title' content={post.title} />
        <meta property='og:type' content='article' />
        <meta name='twitter:card' content='summary_large_image' />
      </Helmet>
      <ProgressTop />
      {/* Structured data */}
      <PostJsonLd
        title={post.title}
        url={postUrl}
        date={post.date}
        excerpt={post.excerpt}
      />

      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 24px' }}>
        {post.cover ? (
          <img
            src={post.cover}
            alt=''
            style={{
              marginBottom: '32px',
              borderRadius: '12px',
              width: '100%',
            }}
          />
        ) : null}

        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '600',
            lineHeight: '1.2',
            marginBottom: '16px',
            color: '#1a202c',
          }}
        >
          {post.title}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: '#718096',
            }}
          >
            {post.date ? new Date(post.date).toDateString() : ''}
          </span>
          {post.tags?.slice(0, 4).map(t => (
            <span
              key={t}
              style={{
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <p
          style={{
            color: '#1a202c',
            marginBottom: '32px',
            fontSize: '18px',
            lineHeight: '1.7',
          }}
        >
          {post.excerpt}
        </p>

        {/* Full article content */}
        <div
          style={{
            maxWidth: 'none',
            lineHeight: '1.7',
            fontSize: '18px',
            color: '#1a202c',
            ...proseStyles,
          }}
        >
          {post.html ? (
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          ) : (
            <p style={{ color: '#718096', fontStyle: 'italic' }}>
              Content not available
            </p>
          )}
        </div>

        {/* Comments Section */}
        <Comments postTitle={post.title} postUrl={postUrl} />
      </div>
    </>
  );
}
