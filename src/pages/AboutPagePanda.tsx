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
import ContactSection from '../components/ContactSection';

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
          <ContactSection />

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
