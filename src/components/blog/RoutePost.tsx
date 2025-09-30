import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ProgressTop from '../ui/ProgressTop';
import PostJsonLd from '../seo/PostJsonLd';

export type Post = {
  id?: string;
  slug: string;
  title: string;
  url: string;
  date: string;
  excerpt: string;
  cover: string;
  tags: string[];
  contentMarkdown?: string;
  contentHtml?: string;
};

export default function RoutePost({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    console.log('RoutePost: Fetching data for slug:', slug);
    fetch('/data/hashnode.json')
      .then(r => {
        console.log('RoutePost: Fetch response:', r.status);
        return r.json();
      })
      .then((all: Post[]) => {
        console.log('RoutePost: Fetched posts:', all.length);
        const foundPost = all.find(p => p.slug === slug);
        console.log('RoutePost: Found post:', foundPost);
        setPost(foundPost ?? null);
      })
      .catch(error => {
        console.error('RoutePost: Fetch error:', error);
        setPost(null);
      });
  }, [slug]);

  if (!post) return <div>Loading…</div>;

  return (
    <>
      <ProgressTop />
      {/* SEO basics for prerendered HTML */}
      <head>
        <title>{post.title}</title>
        <link
          rel='canonical'
          href={`https://nick.karnik.io/blog/${post.slug}`}
        />
        {post.excerpt ? (
          <meta name='description' content={post.excerpt} />
        ) : null}
        {post.cover ? <meta property='og:image' content={post.cover} /> : null}
      </head>

      {/* Structured data */}
      <PostJsonLd
        title={post.title}
        url={`https://nick.karnik.io/blog/${post.slug}`}
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
          }}
        >
          {post.contentMarkdown ? (
            <ReactMarkdown>{post.contentMarkdown}</ReactMarkdown>
          ) : post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            <p style={{ color: '#718096', fontStyle: 'italic' }}>
              Content not available
            </p>
          )}
        </div>
      </div>
    </>
  );
}
