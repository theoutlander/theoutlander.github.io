import { css } from '../../styled-system/css/index.mjs';
import { flex, hstack } from '../../styled-system/patterns/index.mjs';

export default function AboutMe() {
  return (
    <section
      className={css({
        bg: 'gray.50',
        py: '12',
      })}
    >
      <div
        className={flex({
          direction: 'column',
          align: 'center',
          maxW: '4xl',
          mx: 'auto',
          px: '6',
        })}
      >
        <h2
          className={css({
            fontSize: '2xl',
            fontWeight: 'semibold',
            mb: '6',
            textAlign: 'center',
          })}
        >
          About Me
        </h2>

        <p
          className={css({
            fontSize: 'lg',
            color: 'gray.700',
            mb: '6',
            lineHeight: '1.6',
            textAlign: 'center',
            maxW: '2xl',
          })}
        >
          With more than 10 years leading engineering teams and 25+ years
          building software across Google, Microsoft, Tableau, Salesforce, and
          startups, I focus on AI, developer experience, and pragmatic
          engineering. I help teams ship faster with clear processes, modern
          tooling, and reliable systems that scale.
        </p>

        <ul
          className={css({
            listStyle: 'none',
            pl: '0',
            mb: '8',
            fontSize: 'lg',
            color: 'gray.700',
            textAlign: 'left',
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
            25+ years building software across Google, Microsoft, Tableau,
            Salesforce, and startups
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

        <a
          href='/resume'
          className={css({
            display: 'inline-block',
            bg: 'white',
            color: 'blue.600',
            border: '1px solid',
            borderColor: 'blue.200',
            rounded: 'md',
            px: '6',
            py: '3',
            fontWeight: 'medium',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            _hover: {
              bg: 'blue.50',
              borderColor: 'blue.300',
            },
          })}
        >
          View Resume
        </a>
      </div>
    </section>
  );
}
