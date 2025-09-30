import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaCode, FaUsers, FaChartLine } from 'react-icons/fa';
import {
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineChat,
} from 'react-icons/hi';
import { MdEmail } from 'react-icons/md';
interface HomePageProps {
  posts: any[];
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
      <div
        className={css({
          position: 'relative',
          maxWidth: '6xl',
          margin: '0 auto',
          padding: '0 1rem',
          md: { padding: '0 1.5rem' },
          lg: { padding: '0 2rem' },
        })}
      >
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
                margin: '0 auto',
                mb: 6,
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                border: '4px solid white',
                overflow: 'hidden',
              })}
            >
              <img
                src='/assets/images/profile/nick-karnik.jpeg'
                alt='Nick Karnik'
                className={css({
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                })}
              />
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

function CoreCompetenciesSection() {
  const competencies = [
    {
      icon: <FaCode size={24} />,
      title: 'Full-Stack Development',
      description:
        'Building with React + Node, shipping weekly. Focus on TypeScript, modern tooling, and great developer experience.',
      tags: ['TypeScript', 'React', 'Node.js', 'Vite', 'Chakra'],
      color: 'blue.600',
      bgColor: 'blue.50',
    },
    {
      icon: <FaUsers size={24} />,
      title: 'Engineering Leadership',
      description:
        'Leading teams to move faster with clear product bets, strong execution, and systems that are simple to maintain.',
      tags: ['Team Building', 'Process', 'Architecture', 'Mentoring'],
      color: 'green.600',
      bgColor: 'green.50',
    },
    {
      icon: <FaChartLine size={24} />,
      title: 'AI Advisory',
      description:
        'Advising founders on pragmatic AI and developer experience to build better products and faster teams.',
      tags: ['AI Strategy', 'Product', 'DX', 'Consulting'],
      color: 'purple.600',
      bgColor: 'purple.50',
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
        Core Competencies
      </h2>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          md: { gridTemplateColumns: 'repeat(3, 1fr)' },
          gap: 8,
        })}
      >
        {competencies.map((comp, index) => (
          <div
            key={index}
            className={css({
              border: '1px solid',
              borderColor: 'gray.200',
              p: 8,
              borderRadius: '2xl',
              textAlign: 'center',
              bg: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            })}
          >
            <div
              className={css({
                width: '4rem',
                height: '4rem',
                borderRadius: 'xl',
                bg: comp.bgColor,
                color: comp.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 4,
              })}
            >
              {comp.icon}
            </div>
            <h3
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 3,
                fontFamily: 'heading',
              })}
            >
              {comp.title}
            </h3>
            <p
              className={css({
                fontSize: 'md',
                color: 'gray.600',
                mb: 4,
                lineHeight: 1.6,
              })}
            >
              {comp.description}
            </p>
            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
              })}
            >
              {comp.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className={css({
                    bg: 'gray.100',
                    color: 'gray.700',
                    px: 3,
                    py: 1,
                    borderRadius: 'full',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                  })}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurrentlySection() {
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
        Currently
      </h2>
      <div
        className={css({
          bg: 'white',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: '2xl',
          p: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        })}
      >
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            md: { gridTemplateColumns: 'repeat(2, 1fr)' },
            gap: 8,
          })}
        >
          <div>
            <h3
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'blue.600',
                mb: 3,
                fontFamily: 'heading',
              })}
            >
              AI Advisory
            </h3>
            <p
              className={css({
                fontSize: 'md',
                color: 'gray.600',
                lineHeight: 1.6,
              })}
            >
              Helping founders navigate the AI landscape with practical,
              actionable advice on integrating AI into their products and
              workflows.
            </p>
          </div>
          <div>
            <h3
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'green.600',
                mb: 3,
                fontFamily: 'heading',
              })}
            >
              Active Development
            </h3>
            <p
              className={css({
                fontSize: 'md',
                color: 'gray.600',
                lineHeight: 1.6,
              })}
            >
              Building with React + Node, shipping weekly. Focus on modern
              tooling, developer experience, and scalable architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestThoughtsSection({ posts }: { posts: any[] }) {
  return (
    <div className={css({ mb: 16 })}>
      <h2
        className={css({
          textAlign: 'center',
          mb: 4,
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
          textAlign: 'center',
          mb: 8,
          color: 'gray.600',
          fontSize: 'lg',
        })}
      >
        Sharing insights on engineering, AI, and technology from my experience
        building and leading teams.
      </p>
      {posts && posts.length > 0 && (
        <div
          className={css({
            bg: 'white',
            border: '1px solid',
            borderColor: 'gray.200',
            borderRadius: '2xl',
            p: 6,
            mb: 6,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          })}
        >
          <h3
            className={css({
              fontSize: 'xl',
              fontWeight: 'semibold',
              color: 'blue.600',
              mb: 2,
              fontFamily: 'heading',
            })}
          >
            {posts[0].title}
          </h3>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.500',
              mb: 3,
            })}
          >
            {posts[0].date} • {posts[0].readTime || '1 min read'}
          </p>
          <p
            className={css({
              fontSize: 'md',
              color: 'gray.600',
              lineHeight: 1.6,
            })}
          >
            {posts[0].excerpt}
          </p>
        </div>
      )}
      <div className={css({ textAlign: 'center' })}>
        <a href='/blog'>
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
            })}
          >
            View All Posts
            <span>→</span>
          </button>
        </a>
      </div>
    </div>
  );
}

function ExploreMoreSection() {
  const exploreItems = [
    {
      icon: <HiOutlineDocumentText size={24} />,
      title: 'About Me',
      description:
        'Learn more about my background, experience, and what drives me as an engineer and leader.',
      buttonText: 'Read More',
      buttonLink: '/about',
      color: 'blue.600',
      bgColor: 'blue.50',
    },
    {
      icon: <HiOutlinePencil size={24} />,
      title: 'All Posts',
      description:
        'Browse my complete collection of thoughts on engineering, AI, and technology.',
      buttonText: 'Browse Posts',
      buttonLink: '/blog',
      color: 'green.600',
      bgColor: 'green.50',
    },
    {
      icon: <HiOutlineChat size={24} />,
      title: 'Get In Touch',
      description:
        "Let's discuss engineering challenges, AI opportunities, or new projects.",
      buttonText: 'Email Me',
      buttonLink: 'mailto:nick@karnik.io',
      color: 'purple.600',
      bgColor: 'purple.50',
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
        Explore More
      </h2>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          md: { gridTemplateColumns: 'repeat(3, 1fr)' },
          gap: 8,
        })}
      >
        {exploreItems.map((item, index) => (
          <div
            key={index}
            className={css({
              border: '1px solid',
              borderColor: 'gray.200',
              p: 8,
              borderRadius: '2xl',
              textAlign: 'center',
              bg: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            })}
          >
            <div
              className={css({
                width: '4rem',
                height: '4rem',
                borderRadius: 'xl',
                bg: item.bgColor,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 4,
              })}
            >
              {item.icon}
            </div>
            <h3
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 3,
                fontFamily: 'heading',
              })}
            >
              {item.title}
            </h3>
            <p
              className={css({
                fontSize: 'md',
                color: 'gray.600',
                mb: 6,
                lineHeight: 1.6,
              })}
            >
              {item.description}
            </p>
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              })}
            >
              <a href={item.buttonLink}>
                <button
                  className={css({
                    bg: item.color,
                    color: 'white',
                    px: 4,
                    py: 2,
                    borderRadius: 'md',
                    fontWeight: 500,
                    width: '100%',
                    _hover: { opacity: 0.9 },
                  })}
                >
                  {item.buttonText}
                </button>
              </a>
              {item.title === 'Get In Touch' && (
                <a
                  href='/assets/documents/resume-nick-karnik.pdf'
                  target='_blank'
                  rel='noopener'
                >
                  <button
                    className={css({
                      bg: 'gray.100',
                      color: 'gray.700',
                      px: 4,
                      py: 2,
                      borderRadius: 'md',
                      fontWeight: 500,
                      width: '100%',
                      _hover: { bg: 'gray.200' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    })}
                  >
                    <HiOutlineDocumentText size={16} />
                    Download Resume
                  </button>
                </a>
              )}
            </div>
          </div>
        ))}
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

export function HomePagePanda({ posts }: HomePageProps) {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minHeight: '100vh',
      })}
    >
      <Header currentPage='home' />
      <main
        className={css({
          position: 'relative',
          maxWidth: '6xl',
          margin: '0 auto',
          padding: '1.5rem 1rem',
          md: { padding: '2.5rem 1.5rem' },
          lg: { padding: '2.5rem 2rem' },
        })}
      >
        <HeroSection />
        <CoreCompetenciesSection />
        <CurrentlySection />
        <LatestThoughtsSection posts={posts} />
        <ExploreMoreSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
}
