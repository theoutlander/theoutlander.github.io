import React from 'react';
import { css, container } from '../../styled-system/css/index.mjs';
import { Post } from '../../lib/data';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '@tanstack/react-router';

interface HomePageProps {
  posts: Post[];
}

function BlogCard({ post }: { post: Post }) {
  return (
    <div
      className={css({
        bg: 'white',
        borderRadius: '2xl',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'gray.200',
        transition: 'all 0.2s',
        _hover: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
      })}
    >
      <div>
        <img
          src={post.cover}
          alt=''
          className={css({
            objectFit: 'cover',
            maxHeight: '260px',
            width: '100%',
          })}
        />
      </div>
      <div className={css({ p: 6 })}>
        <a href={`/blog/${post.slug}`}>
          <h2
            className={css({
              fontSize: 'lg',
              fontWeight: 'semibold',
              color: 'brand.600',
              mb: 1,
              _hover: { color: 'brand.700' },
              fontFamily: 'heading',
            })}
          >
            {post.title}
          </h2>
        </a>
        <p
          className={css({
            fontSize: 'sm',
            color: 'gray.600',
            mb: 3,
          })}
        >
          {new Date(post.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          · 1 min read
        </p>
        <p
          className={css({
            color: 'gray.800',
            lineHeight: 1.6,
          })}
        >
          {post.excerpt}
        </p>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <div
      className={css({
        pt: 12,
        pb: 12,
        px: 16,
        bg: 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(226, 232, 240, 0.6) 100%)',
        borderRadius: '2xl',
        mb: 16,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <div
        className={css({
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          bg: 'brand.100',
          borderRadius: '50%',
          opacity: 0.15,
        })}
      />
      <div
        className={css({
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          bg: 'purple.100',
          borderRadius: '50%',
          opacity: 0.1,
        })}
      />
      <div className={container({ maxW: '6xl' })}>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            md: { gridTemplateColumns: 'repeat(2, 1fr)' },
            gap: 12,
            alignItems: 'center',
          })}
        >
          <div>
            <h2
              className={css({
                mb: 4,
                color: 'gray.800',
                fontSize: '4xl',
                fontWeight: 'semibold',
                lineHeight: 'shorter',
                letterSpacing: '-0.025em',
                fontFamily: 'heading',
              })}
            >
              Hi, I'm Nick Karnik
            </h2>
            <p
              className={css({
                fontSize: 'xl',
                color: 'gray.600',
                mb: 4,
                lineHeight: 1.6,
              })}
            >
              Engineering leader & software engineer. Clear bets, fast delivery,
              reliable systems.
            </p>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 6,
                flexWrap: 'wrap',
              })}
            >
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 2,
                  py: 1,
                  borderRadius: 'sm',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                })}
              >
                TypeScript
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 2,
                  py: 1,
                  borderRadius: 'sm',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                })}
              >
                React
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 2,
                  py: 1,
                  borderRadius: 'sm',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                })}
              >
                DX
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 2,
                  py: 1,
                  borderRadius: 'sm',
                  fontSize: 'xs',
                  fontWeight: 'medium',
                })}
              >
                AI
              </span>
            </div>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.400',
                mt: 1,
                mb: 6,
                fontStyle: 'italic',
              })}
            >
              Currently advising founders on pragmatic AI & DX.
            </p>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              })}
            >
              <Link to='/blog'>
                <button
                  className={css({
                    bg: 'brand.600',
                    color: 'white',
                    px: 6,
                    py: 3,
                    borderRadius: 'md',
                    fontWeight: 500,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    _hover: { bg: 'brand.700' },
                  })}
                >
                  Read the blog
                </button>
              </Link>
              <a
                href='/assets/documents/resume-nick-karnik.pdf'
                target='_blank'
                rel='noopener noreferrer'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'full',
                  bg: 'gray.100',
                  color: 'gray.600',
                  _hover: { bg: 'gray.200' },
                  transition: 'all 0.2s',
                })}
                title='Download Resume'
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                  <polyline points='14,2 14,8 20,8' />
                  <line x1='16' y1='13' x2='8' y2='13' />
                  <line x1='16' y1='17' x2='8' y2='17' />
                  <polyline points='10,9 9,9 8,9' />
                </svg>
              </a>
            </div>
            <p
              className={css({
                mt: 2,
                fontSize: 'sm',
                color: 'gray.500',
              })}
            >
              or{' '}
              <Link
                to='/about'
                className={css({
                  color: 'brand.600',
                  textDecoration: 'none',
                  _hover: { textDecoration: 'underline' },
                })}
              >
                about me
              </Link>
            </p>
          </div>
          <div
            className={css({
              textAlign: 'center',
              order: -1,
              md: { order: 0 },
            })}
          >
            <div
              className={css({
                width: '10rem',
                height: '10rem',
                lg: { width: '12rem', height: '12rem' },
                borderRadius: '50%',
                bg: 'brand.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '4xl',
                lg: { fontSize: '5xl' },
                fontWeight: 'bold',
                margin: '0 auto',
                mb: 6,
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                border: '4px solid white',
              })}
            >
              NK
            </div>
            <p
              className={css({
                fontSize: 'lg',
                color: 'gray.600',
                fontWeight: 500,
              })}
            >
              Currently: Advising founders on pragmatic AI and DX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className={css({ py: 10 })}>
      <div
        className={css({
          maxWidth: 'container.lg',
          margin: '0 auto',
          padding: '0 1rem',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            py: 4,
            px: 6,
            bg: 'gray.100',
            borderRadius: 'lg',
          })}
        >
          <span
            className={css({
              color: 'gray.700',
              fontSize: 'md',
              fontWeight: 'medium',
            })}
          >
            8+ Years Leadership
          </span>
          <span
            className={css({
              color: 'gray.400',
              fontSize: 'lg',
              fontWeight: 'bold',
            })}
          >
            ·
          </span>
          <span
            className={css({
              color: 'gray.700',
              fontSize: 'md',
              fontWeight: 'medium',
            })}
          >
            5+ Teams Led
          </span>
          <span
            className={css({
              color: 'gray.400',
              fontSize: 'lg',
              fontWeight: 'bold',
            })}
          >
            ·
          </span>
          <span
            className={css({
              color: 'gray.700',
              fontSize: 'md',
              fontWeight: 'medium',
            })}
          >
            8+ Years Building
          </span>
        </div>
      </div>
    </div>
  );
}

function LatestPostsSection({ posts }: { posts: Post[] }) {
  const latestPosts = posts.slice(0, 2);

  return (
    <div className={css({ py: 10 })}>
      <div className={css({ textAlign: 'center', mb: 6 })}>
        <h2
          className={css({
            mb: 6,
            color: 'gray.800',
            fontSize: '3xl',
            fontWeight: 'semibold',
            fontFamily: 'heading',
          })}
        >
          Latest Thoughts
        </h2>
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          md: { gridTemplateColumns: 'repeat(2, 1fr)' },
          gap: 4,
          mb: 6,
        })}
      >
        {latestPosts.map(post => (
          <div
            key={post.id}
            className={css({
              bg: 'white',
              border: '1px solid',
              borderColor: 'gray.200',
              borderRadius: 'lg',
              p: 4,
              boxShadow: 'sm',
              transition: 'all 0.2s',
              _hover: {
                boxShadow: 'md',
                transform: 'translateY(-1px)',
              },
            })}
          >
            <a href={`/blog/${post.slug}`}>
              <h3
                className={css({
                  fontSize: 'md',
                  fontWeight: 'semibold',
                  color: 'blue.600',
                  mb: 2,
                  fontFamily: 'heading',
                  _hover: { color: 'blue.700' },
                })}
              >
                {post.title}
              </h3>
            </a>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                lineHeight: 1.5,
              })}
            >
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
      <div className={css({ textAlign: 'center' })}>
        <Link
          to='/blog'
          className={css({
            color: 'brand.600',
            fontSize: 'sm',
            fontWeight: 'medium',
            textDecoration: 'none',
            _hover: { textDecoration: 'underline' },
          })}
        >
          All posts →
        </Link>
      </div>
    </div>
  );
}

export function HomePagePanda({ posts }: HomePageProps) {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minHeight: '100vh',
      })}
    >
      <Header currentPage='home' />
      <main className={container({ maxW: '6xl' })}>
        <HeroSection />
        <StatsSection />
        <LatestPostsSection posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
