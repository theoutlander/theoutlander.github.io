import { css } from '../../../styled-system/css/index.mjs';

export default function Header() {
  return (
    <header
      className={css({
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        bg: 'white',
      })}
    >
      <div
        className={css({
          maxW: '6xl',
          py: 3,
          mx: 'auto',
          px: 4,
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          })}
        >
          {/* Brand: pick one label and keep it consistent */}
          <a
            href='/'
            className={css({
              textDecoration: 'none',
              fontWeight: 'bold',
              px: 3,
              py: 2,
              rounded: 'lg',
              _hover: { bg: 'gray.100' },
            })}
          >
            Nick Karnik
          </a>

          <div
            className={css({
              display: 'flex',
              gap: 4,
            })}
          >
            <a
              href='/'
              className={css({
                textDecoration: 'none',
                color: 'gray.600',
                _hover: { color: 'blue.700' },
              })}
            >
              Home
            </a>
            <a
              href='/about'
              className={css({
                textDecoration: 'none',
                color: 'gray.600',
                _hover: { color: 'blue.700' },
              })}
            >
              About
            </a>
            <a
              href='/resume'
              className={css({
                textDecoration: 'none',
                color: 'gray.600',
                _hover: { color: 'blue.700' },
              })}
            >
              Resume
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
