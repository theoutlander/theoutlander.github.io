import { css } from '../../../styled-system/css/index.mjs';
// import { Helmet } from 'react-helmet-async';
import type { Post } from './RoutePost';

export default function BlogList({
  posts,
  filterTag,
}: {
  posts: Post[];
  filterTag?: string;
}) {
  const items = posts.filter(p => !filterTag || p.tags?.includes(filterTag));

  return (
    <div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
          gap: 6,
        })}
      >
        {items.map(p => (
          <div
            key={p.slug}
            className={css({
              borderRadius: '2xl',
              overflow: 'hidden',
              shadow: 'sm',
              bg: 'white',
              border: '1px solid',
              borderColor: 'gray.200',
              _hover: { shadow: 'md', transform: 'translateY(-2px)' },
              transition: 'all 120ms',
            })}
          >
            {p.cover ? (
              <img
                src={p.cover}
                alt=''
                className={css({
                  objectFit: 'cover',
                  maxH: '260px',
                  w: '100%',
                })}
              />
            ) : null}

            <div className={css({ p: 4 })}>
              <a
                href={`/blog/${p.slug}`}
                className={css({
                  textDecoration: 'none',
                  color: 'blue.700',
                  fontWeight: 'semibold',
                  fontSize: 'lg',
                  _hover: { color: 'blue.600' },
                })}
              >
                <h2>{p.title}</h2>
              </a>

              <p
                className={css({
                  fontSize: 'sm',
                  color: 'gray.600',
                  mt: 1,
                })}
              >
                {p.date ? new Date(p.date).toDateString() : ''}
                {p.excerpt
                  ? ` · ${estimateReadingTime(p.excerpt)} min read`
                  : ''}
              </p>

              {p.excerpt ? (
                <p
                  className={css({
                    mt: 3,
                    color: 'gray.800',
                  })}
                >
                  {p.excerpt}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
