import React from 'react';
import { css, container } from '../../styled-system/css';
import { Post } from '../../lib/data';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
        p: 16,
        bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
          opacity: 0.3,
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
          opacity: 0.2,
        })}
      />
      <div className={container({ maxW: '6xl' })}>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            md: { gridTemplateColumns: 'repeat(2, 1fr)' },
            gap: 12,
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
                mb: 6,
                lineHeight: 1.6,
              })}
            >
              Engineer and EM, shipping fast with TypeScript. I help teams move
              faster with clear product bets, strong execution, and systems that
              are simple to maintain.
            </p>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 6,
                flexWrap: 'wrap',
              })}
            >
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 4,
                  py: 2,
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                })}
              >
                TypeScript
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 4,
                  py: 2,
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                })}
              >
                React
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 4,
                  py: 2,
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                })}
              >
                DX
              </span>
              <span
                className={css({
                  bg: 'brand.100',
                  color: 'brand.700',
                  px: 4,
                  py: 2,
                  borderRadius: 'md',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                })}
              >
                AI
              </span>
            </div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap',
              })}
            >
              <a href='/blog'>
                <button
                  className={css({
                    bg: 'brand.600',
                    color: 'white',
                    px: 6,
                    py: 3,
                    borderRadius: 'md',
                    fontWeight: 500,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    _hover: { bg: 'brand.700' },
                  })}
                >
                  Read My Blog →
                </button>
              </a>
              <a href='/about'>
                <button
                  className={css({
                    border: '1px solid',
                    borderColor: 'gray.200',
                    color: 'gray.800',
                    px: 6,
                    py: 3,
                    borderRadius: 'md',
                    fontWeight: 500,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    _hover: { bg: 'gray.50' },
                  })}
                >
                  About Me
                </button>
              </a>
            </div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({
                width: '8rem',
                height: '8rem',
                borderRadius: '50%',
                bg: 'brand.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '4xl',
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
  const stats = [
    {
      label: 'Years Experience',
      value: '8+',
      description: 'Engineering & Leadership',
      color: 'brand.600',
    },
    {
      label: 'Technologies',
      value: '15+',
      description: 'TypeScript, React, Node, AI',
      color: 'green.600',
    },
    {
      label: 'Teams Led',
      value: '5+',
      description: 'Engineering Teams',
      color: 'purple.600',
    },
  ];

  return (
    <div className={css({ mb: 16 })}>
      <h2
        className={css({
          textAlign: 'center',
          mb: 10,
          color: 'gray.800',
          fontSize: '3xl',
          fontWeight: 'semibold',
          fontFamily: 'heading',
        })}
      >
        Professional Experience
      </h2>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          md: { gridTemplateColumns: 'repeat(3, 1fr)' },
          gap: 8,
        })}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className={css({
              border: '1px solid',
              borderColor: 'gray.200',
              p: 8,
              borderRadius: '2xl',
              textAlign: 'center',
            })}
          >
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
                mb: 2,
                fontWeight: 500,
              })}
            >
              {stat.label}
            </p>
            <h2
              className={css({
                color: stat.color,
                mb: 1,
                fontSize: '3xl',
                fontWeight: 'semibold',
                fontFamily: 'heading',
              })}
            >
              {stat.value}
            </h2>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
              })}
            >
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatestPostsSection({ posts }: { posts: Post[] }) {
  const latestPosts = posts.slice(0, 2);

  return (
    <div className={css({ mb: 16 })}>
      <div className={css({ textAlign: 'center', mb: 10 })}>
        <h2
          className={css({
            mb: 3,
            color: 'gray.800',
            fontSize: '3xl',
            fontWeight: 'semibold',
            fontFamily: 'heading',
          })}
        >
          Latest Thoughts
        </h2>
        <p
          className={css({
            fontSize: 'lg',
            color: 'gray.600',
            maxWidth: '600px',
            margin: '0 auto',
          })}
        >
          Sharing insights on engineering, AI, and technology from my experience
          building and leading teams.
        </p>
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          md: { gridTemplateColumns: 'repeat(2, 1fr)' },
          gap: 8,
        })}
      >
        {latestPosts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
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
