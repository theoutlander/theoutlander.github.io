import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import { container } from '../../styled-system/patterns/index.mjs';
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

        {/* About Content */}
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
          <div
            className={css({
              fontSize: 'lg',
              lineHeight: 1.7,
              color: 'gray.800',
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontFamily: 'heading',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 4,
                mt: 6,
              },
              '& h1': {
                fontSize: '2xl',
              },
              '& h2': {
                fontSize: 'xl',
              },
              '& h3': {
                fontSize: 'lg',
              },
              '& p': {
                mb: 4,
              },
              '& ul, & ol': {
                mb: 4,
                pl: 6,
              },
              '& li': {
                mb: 2,
              },
              '& a': {
                color: 'brand.600',
                _hover: {
                  textDecoration: 'underline',
                },
              },
              '& code': {
                bg: 'gray.100',
                px: 2,
                py: 1,
                borderRadius: 'md',
                fontSize: 'sm',
                fontFamily: 'mono',
              },
              '& pre': {
                bg: 'gray.100',
                p: 4,
                borderRadius: 'md',
                overflow: 'auto',
                mb: 4,
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'brand.200',
                pl: 4,
                fontStyle: 'italic',
                color: 'gray.600',
                mb: 4,
              },
            })}
            dangerouslySetInnerHTML={{ __html: aboutData.html }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
