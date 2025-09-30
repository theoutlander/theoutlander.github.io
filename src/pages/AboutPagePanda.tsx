import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import {
  container,
  stack,
  hstack,
  vstack,
} from '../../styled-system/patterns/index.mjs';
import Header from '../components/Header';
import Footer from '../components/Footer';

type AboutData = {
  title: string;
  html: string;
};

type AboutPageProps = {
  aboutData: AboutData;
};

export function AboutPagePanda({ aboutData }: AboutPageProps) {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minH: '100vh',
      })}
    >
      <Header currentPage='about' />
      <main className={container({ maxW: '6xl', py: { base: 6, md: 10 } })}>
        {/* Hero Section */}
        <div
          className={css({
            textAlign: 'center',
            mb: 16,
          })}
        >
          <h1
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
            About
          </h1>
          <p
            className={css({
              fontSize: 'xl',
              color: 'gray.600',
              maxWidth: '600px',
              margin: '0 auto',
            })}
          >
            Engineering Leader & Staff Software Engineer, shipping fast with
            Node, React, and TypeScript.
          </p>
        </div>

        {/* Three Card Layout */}
        <div className={stack({ gap: 6, maxW: '2xl', mx: 'auto' })}>
          {/* Contact Card */}
          <div
            className={css({
              bg: 'white',
              borderRadius: '2xl',
              p: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            <h2
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 6,
                fontFamily: 'heading',
              })}
            >
              Contact
            </h2>
            <div className={vstack({ gap: 4, align: 'stretch' })}>
              <a
                href='mailto:nick@karnik.io'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bg: 'blue.600',
                  color: 'white',
                  px: 6,
                  py: 3,
                  borderRadius: 'lg',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'blue.700',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  },
                })}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' />
                </svg>
                Email
              </a>
              <a
                href='https://www.linkedin.com/in/theoutlander'
                target='_blank'
                rel='noopener noreferrer'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bg: 'white',
                  color: 'gray.700',
                  px: 6,
                  py: 3,
                  borderRadius: 'lg',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'gray.50',
                    borderColor: 'gray.400',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                })}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
                LinkedIn
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className={css({ ml: 'auto' })}
                >
                  <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
                </svg>
              </a>
              <a
                href='https://github.com/theoutlander'
                target='_blank'
                rel='noopener noreferrer'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bg: 'white',
                  color: 'gray.700',
                  px: 6,
                  py: 3,
                  borderRadius: 'lg',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'gray.50',
                    borderColor: 'gray.400',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                })}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
                GitHub
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className={css({ ml: 'auto' })}
                >
                  <path d='M7 14H5v5h2v-5zm8-9h-2v6h2V5zm-3 13h-2v-2h2v2zm2.5-15H7.5C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM18 19.5H7.5v-15h9v15z' />
                </svg>
              </a>
              <a
                href='/resume'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bg: 'white',
                  color: 'gray.700',
                  px: 6,
                  py: 3,
                  borderRadius: 'lg',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'gray.50',
                    borderColor: 'gray.400',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                })}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                </svg>
                Resume
              </a>
            </div>
          </div>

          {/* Focus Card */}
          <div
            className={css({
              bg: 'white',
              borderRadius: '2xl',
              p: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            <h2
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 6,
                fontFamily: 'heading',
              })}
            >
              Focus
            </h2>
            <div className={css({ mb: 6 })}>
              <div
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 4,
                })}
              >
                {[
                  'TypeScript',
                  'React',
                  'Vite',
                  'Chakra',
                  'Node',
                  'GraphQL',
                  'AI',
                ].map(tech => (
                  <span
                    key={tech}
                    className={css({
                      bg: 'gray.100',
                      color: 'gray.700',
                      px: 3,
                      py: 1,
                      borderRadius: 'md',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      border: '1px solid',
                      borderColor: 'gray.200',
                    })}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'gray.600',
                  lineHeight: 1.6,
                })}
              >
                I help teams move faster with clear product bets, strong
                execution, and systems that are simple to maintain.
              </p>
            </div>
          </div>

          {/* Currently Card */}
          <div
            className={css({
              bg: 'white',
              borderRadius: '2xl',
              p: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            <h2
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 6,
                fontFamily: 'heading',
              })}
            >
              Currently
            </h2>
            <div className={vstack({ gap: 3, align: 'stretch' })}>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'gray.600',
                  lineHeight: 1.6,
                  mb: 0,
                })}
              >
                Advising founders on pragmatic AI and DX.
              </p>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'gray.600',
                  lineHeight: 1.6,
                  mb: 0,
                })}
              >
                Building with React + Node, shipping weekly.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
