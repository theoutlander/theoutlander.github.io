import { css, cva } from '../../styled-system/css/index.mjs';
import {
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import NameHeader from './NameHeader';

// ====== shared primitives ======
const card = css({
  bg: { base: 'white', _dark: 'gray.900' },
  borderWidth: '1px',
  borderColor: { base: 'gray.200', _dark: 'gray.700' },
  borderRadius: 'xl',
  boxShadow: { base: 'sm', _dark: 'none' },
});

const pill = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    px: 2.5,
    py: 1,
    borderRadius: 'full',
    fontSize: 'xs',
    fontWeight: 'medium',
    borderWidth: '1px',
    whiteSpace: 'nowrap',
  },
  variants: {
    tone: {
      gray: { bg: 'gray.50', borderColor: 'gray.200', color: 'gray.700' },
      blue: { bg: 'blue.50', borderColor: 'blue.200', color: 'blue.700' },
      green: { bg: 'green.50', borderColor: 'green.200', color: 'green.700' },
      purple: {
        bg: 'purple.50',
        borderColor: 'purple.200',
        color: 'purple.700',
      },
    },
  },
  defaultVariants: { tone: 'gray' },
});

const ghostBtn = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    w: 'full',
    px: 3,
    py: 2.5,
    fontSize: 'sm',
    borderWidth: '0px',
    borderRadius: 'md',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  variants: {
    variant: {
      email: {
        color: { base: 'blue.700', _dark: 'blue.300' },
        _hover: {
          bg: { base: 'blue.50', _dark: 'blue.900/20' },
          transform: 'translateY(-1px)',
          boxShadow: {
            base: '0 4px 12px rgba(59, 130, 246, 0.15)',
            _dark: '0 4px 12px rgba(59, 130, 246, 0.1)',
          },
        },
      },
      linkedin: {
        color: { base: 'blue.600', _dark: 'blue.400' },
        _hover: {
          bg: { base: 'blue.50', _dark: 'blue.900/20' },
          transform: 'translateY(-1px)',
          boxShadow: {
            base: '0 4px 12px rgba(37, 99, 235, 0.15)',
            _dark: '0 4px 12px rgba(37, 99, 235, 0.1)',
          },
        },
      },
      github: {
        color: { base: 'gray.700', _dark: 'gray.300' },
        _hover: {
          bg: { base: 'gray.50', _dark: 'gray.800' },
          transform: 'translateY(-1px)',
          boxShadow: {
            base: '0 4px 12px rgba(0, 0, 0, 0.1)',
            _dark: '0 4px 12px rgba(255, 255, 255, 0.05)',
          },
        },
      },
      resume: {
        color: { base: 'purple.700', _dark: 'purple.300' },
        _hover: {
          bg: { base: 'purple.50', _dark: 'purple.900/20' },
          transform: 'translateY(-1px)',
          boxShadow: {
            base: '0 4px 12px rgba(147, 51, 234, 0.15)',
            _dark: '0 4px 12px rgba(147, 51, 234, 0.1)',
          },
        },
      },
    },
  },
  defaultVariants: { variant: 'email' },
});

const wrap = css({ maxW: '1024px', mx: 'auto', px: { base: 4, md: 6 }, py: 8 });

const iconContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  flex: 1,
});

const contactIcon = css({
  w: 5,
  h: 5,
  flexShrink: 0,
});

// ====== layout grid ======
const grid = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', md: '1.6fr 1fr' },
  gap: 6,
  mt: 6,
});

// ====== left column (About text) ======
const aboutCard = css({ p: { base: 4, md: 6 } });
const sectionTitle = css({
  fontWeight: 'semibold',
  color: { base: 'gray.800', _dark: 'gray.200' },
  mb: 3,
});
const bodyText = css({
  color: { base: 'gray.700', _dark: 'gray.300' },
  lineHeight: '1.7',
  '& p + p': { mt: 3 },
});

// ====== right column (sidebar cards) ======
const sidebarCard = css({ p: { base: 4, md: 5 } });
const sidebarTitle = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: { base: 'gray.800', _dark: 'gray.200' },
  mb: 3,
});
const pillWrap = css({ display: 'flex', gap: 2, flexWrap: 'wrap' });
const note = css({
  mt: 3,
  fontSize: 'sm',
  color: { base: 'gray.600', _dark: 'gray.400' },
});

// ====== footer connect row ======
const connectRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  justifyContent: 'center',
  mt: 10,
  color: { base: 'gray.600', _dark: 'gray.400' },
});

// ====== data ======
const focusPills = [
  'TypeScript',
  'React',
  'Vite',
  'Chakra',
  'Node',
  'GraphQL',
  'AI',
];

export default function AboutPage() {
  return (
    <main className={wrap}>
      {/* Header */}
      <NameHeader />

      {/* Grid */}
      <section className={grid}>
        {/* Left: About */}
        <article className={[card, aboutCard].join(' ')}>
          <h3 className={sectionTitle}>About</h3>
          <div className={bodyText}>
            <p>I help teams move faster without breaking things.</p>
            <p>
              I've led engineering at Google, Microsoft, Salesforce, Tableau,
              IDM (now part of the Gates Foundation), T-Mobile, and startups. I
              care about clear decisions, strong execution, and code that ships.
            </p>
            <p>
              On this blog I write about AI, engineering leadership, and
              building web products with React, Node.js, and TypeScript. I try
              to keep it practical so you can use it right away.
            </p>
            <p>
              I also run{' '}
              <a
                href='https://plutonic.consulting'
                target='_blank'
                rel='noopener noreferrer'
                className={css({
                  color: { base: 'blue.600', _dark: 'blue.400' },
                  textDecoration: 'underline',
                  _hover: {
                    color: { base: 'blue.700', _dark: 'blue.300' },
                    textDecoration: 'none',
                  },
                })}
              >
                Plutonic Consulting
              </a>
              , where I work with founders on fractional CTO support, AI
              strategy, and scaling teams.
            </p>
            <p>
              If you're hiring, wrestling with roadmap and architecture, or want
              a second set of eyes on your stack, I'm happy to help.
            </p>
          </div>
        </article>

        {/* Right: Sidebar */}
        <aside className={css({ display: 'flex', flexDir: 'column', gap: 6 })}>
          {/* Contact */}
          <div className={[card, sidebarCard].join(' ')}>
            <div className={sidebarTitle}>Contact</div>
            <a
              className={ghostBtn({ variant: 'email' })}
              href='mailto:nick@karnik.io'
            >
              <div className={iconContainer}>
                <EnvelopeIcon className={contactIcon} />
                <span>Email</span>
              </div>
            </a>
            <a
              className={ghostBtn({ variant: 'linkedin' })}
              href='https://www.linkedin.com/in/theoutlander'
              target='_blank'
              rel='noopener noreferrer'
            >
              <div className={iconContainer}>
                <FaLinkedin className={contactIcon} />
                <span>LinkedIn</span>
              </div>
              <ArrowTopRightOnSquareIcon
                className={css({ w: 4, h: 4, opacity: 0.6 })}
              />
            </a>
            <a
              className={ghostBtn({ variant: 'github' })}
              href='https://github.com/theoutlander'
              target='_blank'
              rel='noopener noreferrer'
            >
              <div className={iconContainer}>
                <FaGithub className={contactIcon} />
                <span>GitHub</span>
              </div>
              <ArrowTopRightOnSquareIcon
                className={css({ w: 4, h: 4, opacity: 0.6 })}
              />
            </a>
            <a className={ghostBtn({ variant: 'resume' })} href='/resume'>
              <div className={iconContainer}>
                <DocumentTextIcon className={contactIcon} />
                <span>Resume</span>
              </div>
            </a>
          </div>

          {/* Focus */}
          <div className={[card, sidebarCard].join(' ')}>
            <div className={sidebarTitle}>Focus</div>
            <div className={pillWrap}>
              {focusPills.map(p => (
                <span key={p} className={pill()}>
                  {p}
                </span>
              ))}
            </div>
            <p className={note}>
              I help teams move faster with clear product bets, strong
              execution, and systems that are simple to maintain.
            </p>
          </div>

          {/* Now */}
          <div className={[card, sidebarCard].join(' ')}>
            <div className={sidebarTitle}>Now</div>
            <ul className={css({ listStyle: 'none', padding: 0, margin: 0 })}>
              <li
                className={css({
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 2,
                  '&:last-child': { mb: 0 },
                })}
              >
                <span
                  className={css({
                    display: 'inline-block',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    bg: '#3b82f6',
                    mt: 2,
                    mr: 2,
                    flexShrink: 0,
                  })}
                />
                <span className={note}>
                  Advising founders on pragmatic AI & DX.
                </span>
              </li>
              <li
                className={css({
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 2,
                  '&:last-child': { mb: 0 },
                })}
              >
                <span
                  className={css({
                    display: 'inline-block',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    bg: '#3b82f6',
                    mt: 2,
                    mr: 2,
                    flexShrink: 0,
                  })}
                />
                <span className={note}>
                  Building React + Node tools with TypeScript.
                </span>
              </li>
              <li
                className={css({
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 2,
                  '&:last-child': { mb: 0 },
                })}
              >
                <span
                  className={css({
                    display: 'inline-block',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    bg: '#3b82f6',
                    mt: 2,
                    mr: 2,
                    flexShrink: 0,
                  })}
                />
                <span className={note}>
                  Writing weekly about engineering leadership.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
