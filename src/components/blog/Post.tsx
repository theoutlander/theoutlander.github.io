import { useEffect, useState } from 'react';

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
    fetch('/data/hashnode.json')
      .then(r => r.json())
      .then((all: Post[]) => setPost(all.find(p => p.slug === slug) ?? null))
      .catch(() => setPost(null));
  }, [slug]);

  if (!post) return <div style={{ padding: '24px' }}>Loading…</div>;

  return (
    <div
      style={{
        maxWidth: '768px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      {post.cover ? (
        <img
          src={post.cover}
          alt=''
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            width: '100%',
          }}
        />
      ) : null}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0,
        }}
      >
        {post.title}
      </h1>
      <p
        style={{
          opacity: 0.7,
          marginTop: '4px',
          margin: '4px 0 0 0',
        }}
      >
        {post.date ? new Date(post.date).toDateString() : ''}
      </p>
      <p style={{ marginTop: '16px', margin: '16px 0 0 0' }}>{post.excerpt}</p>
      <p style={{ marginTop: '24px', margin: '24px 0 0 0' }}>
        Full post on Hashnode:{' '}
        <a
          href={post.url}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#3182ce', textDecoration: 'underline' }}
        >
          {post.url}
        </a>
      </p>
    </div>
  );
}
