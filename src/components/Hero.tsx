import { css } from '../../styled-system/css/index.mjs';
import { flex, hstack } from '../../styled-system/patterns/index.mjs';
import { Link } from '@tanstack/react-router';

export default function Hero() {
  return (
    <section
      className={css({
        bg: 'gray.50',
      })}
    >
      <div
        className={flex({
          direction: { base: 'column', lg: 'row' },
          align: { base: 'start', lg: 'center' },
          justify: 'space-between',
          gap: '12',
          maxW: '6xl',
          mx: 'auto',
          px: '6',
          py: '24',
        })}
      >
        {/* LEFT: content */}
        <div className={css({ flex: 1, maxW: 'xl' })}>
          <h1
            className={css({
              fontSize: { base: '4xl', md: '5xl', lg: '6xl' },
              fontWeight: 'bold',
              mb: '4',
              lineHeight: '1.1',
              color: 'gray.900',
            })}
          >
            Engineering Leader & Software Engineer
          </h1>

          <p
            className={css({
              fontSize: 'xl',
              color: 'gray.600',
              mb: '8',
              fontWeight: 'normal',
              lineHeight: '1.6',
            })}
          >
            Helping teams ship with clarity, speed, and reliable systems.
          </p>

          <ul
            className={css({
              listStyle: 'none',
              pl: '0',
              mb: '8',
              fontSize: 'lg',
              color: 'gray.700',
            })}
          >
            <li
              className={css({
                mb: '3',
                display: 'flex',
                alignItems: 'center',
              })}
            >
              <span className={css({ mr: '3', color: 'green.600' })}>✅</span>
              More than 10 years leading engineering teams
            </li>
            <li
              className={css({
                mb: '3',
                display: 'flex',
                alignItems: 'center',
              })}
            >
              <span className={css({ mr: '3', color: 'green.600' })}>✅</span>
              25+ years building software across Google, Microsoft, and startups
            </li>
            <li
              className={css({
                mb: '3',
                display: 'flex',
                alignItems: 'center',
              })}
            >
              <span className={css({ mr: '3', color: 'green.600' })}>✅</span>
              Advisor to founders on AI and developer experience
            </li>
            <li
              className={css({
                mb: '3',
                display: 'flex',
                alignItems: 'center',
              })}
            >
              <span className={css({ mr: '3', color: 'green.600' })}>✅</span>
              Passion for shipping reliable, simple systems
            </li>
          </ul>

          <div className={hstack({ gap: '3', wrap: 'wrap', mb: '8' })}>
            <span className={chip({ variant: 'ai' })}>AI</span>
            <span className={chip({ variant: 'react' })}>React</span>
            <span className={chip({ variant: 'typescript' })}>TypeScript</span>
            <span className={chip({ variant: 'node' })}>Node.js</span>
          </div>

          <Link to='/blog' className={primaryBtn()}>
            Read the blog
          </Link>
        </div>
      </div>
    </section>
  );
}

/* tiny recipe helpers */
const chip = ({
  variant,
}: {
  variant: 'ai' | 'react' | 'typescript' | 'node';
}) => {
  const variants = {
    ai: {
      bg: 'gray.100',
      color: 'gray.700',
      borderColor: 'gray.300',
      _hover: { bg: 'gray.200' },
    },
    react: {
      bg: 'gray.100',
      color: 'gray.700',
      borderColor: 'gray.300',
      _hover: { bg: 'gray.200' },
    },
    typescript: {
      bg: 'blue.50',
      color: 'blue.700',
      borderColor: 'blue.200',
      _hover: { bg: 'blue.100' },
    },
    node: {
      bg: 'green.50',
      color: 'green.700',
      borderColor: 'green.200',
      _hover: { bg: 'green.100' },
    },
  };

  return css({
    ...variants[variant],
    fontSize: 'sm',
    fontWeight: 'medium',
    px: '3',
    py: '1.5',
    rounded: 'md',
    border: '1px solid',
    transition: 'all 0.2s ease',
    cursor: 'default',
  });
};

const primaryBtn = () =>
  css({
    display: 'inline-block',
    bg: 'blue.600',
    color: 'white',
    rounded: 'md',
    px: '6',
    py: '3',
    fontSize: 'lg',
    fontWeight: 'medium',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    _hover: {
      bg: 'blue.700',
      transform: 'translateY(-1px)',
      shadow: 'lg',
    },
    _focus: {
      outline: '2px solid',
      outlineColor: 'blue.300',
      outlineOffset: '2px',
    },
  });
