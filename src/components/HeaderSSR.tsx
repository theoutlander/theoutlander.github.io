import { css } from '../../styled-system/css/index.mjs';
import { container } from '../../styled-system/patterns/index.mjs';

interface HeaderProps {
  currentPage?: 'home' | 'blog' | 'about' | 'resume';
}

export default function HeaderSSR({ currentPage }: HeaderProps = {}) {
  const BRAND = 'Nick Karnik';

  return (
    <header
      className={css({
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bg: 'white',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        backdropFilter: 'saturate(180%) blur(8px)',
      })}
    >
      <div className={container({ maxW: '6xl', py: 3 })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          })}
        >
          <a href='/'>
            <h2
              className={css({
                fontSize: 'md',
                fontWeight: 'semibold',
                color: 'gray.800',
                fontFamily: 'heading',
              })}
            >
              {BRAND}
            </h2>
          </a>

          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            })}
          >
            <a href='/blog'>
              <p
                className={css({
                  color: currentPage === 'blog' ? 'brand.600' : 'gray.600',
                  fontWeight: currentPage === 'blog' ? 'medium' : 'normal',
                  _hover: { color: 'brand.600' },
                })}
              >
                Blog
              </p>
            </a>
            <a href='/about'>
              <p
                className={css({
                  color: currentPage === 'about' ? 'brand.600' : 'gray.600',
                  fontWeight: currentPage === 'about' ? 'medium' : 'normal',
                  _hover: { color: 'brand.600' },
                })}
              >
                About
              </p>
            </a>
            <a href='/resume'>
              <p
                className={css({
                  color: currentPage === 'resume' ? 'brand.600' : 'gray.600',
                  fontWeight: currentPage === 'resume' ? 'medium' : 'normal',
                  _hover: { color: 'brand.600' },
                })}
              >
                Resume
              </p>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
