import { css } from '../../styled-system/css/index.mjs';
import {
  FaNodeJs,
  FaReact,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaStackOverflow,
} from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';
import { MdEmail } from 'react-icons/md';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer
      className={css({
        bg: 'white',
        borderTop: '1px solid',
        borderColor: 'gray.200',
        py: 16,
        mt: 16,
      })}
    >
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
            display: 'flex',
            flexDirection: { base: 'column', md: 'row' },
            gap: 12,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          {/* Left column - Nick Karnik info */}
          <div
            className={css({
              minWidth: 0,
            })}
          >
            <h2
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 2,
                fontFamily: 'heading',
              })}
            >
              Nick Karnik
            </h2>
            <p
              className={css({
                fontSize: 'md',
                color: 'gray.600',
                mb: 4,
              })}
            >
              Engineering Leader & Staff Software Engineer
            </p>
            <div
              className={css({
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mb: 6,
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                })}
              >
                <FaNodeJs color='#539e43' title='Node.js' size={20} />
                <span className={css({ fontSize: 'sm', color: 'gray.600' })}>
                  Node
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                })}
              >
                <FaReact color='#61dafb' title='React' size={20} />
                <span className={css({ fontSize: 'sm', color: 'gray.600' })}>
                  React
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                })}
              >
                <SiTypescript color='#3178c6' title='TypeScript' size={20} />
                <span className={css({ fontSize: 'sm', color: 'gray.600' })}>
                  TypeScript
                </span>
              </div>
            </div>

            {/* Copyright under first column */}
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
              })}
            >
              © 2025 Nick Karnik. All rights reserved.
            </p>
          </div>

          {/* Right column - Connect */}
          <div
            className={css({
              minWidth: 0,
            })}
          >
            <h3
              className={css({
                fontSize: 'md',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 4,
                fontFamily: 'heading',
              })}
            >
              Connect
            </h3>
            <div
              className={css({
                display: 'flex',
                gap: 4,
                mb: 4,
                flexWrap: 'wrap',
              })}
            >
              <a href='mailto:nick@karnik.io' target='_blank' rel='noopener'>
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <MdEmail />
                </div>
              </a>
              <a
                href='https://github.com/theoutlander'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <FaGithub />
                </div>
              </a>
              <a
                href='https://www.linkedin.com/in/theoutlander'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <FaLinkedin />
                </div>
              </a>
              <a
                href='https://twitter.com/theoutlander'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <FaTwitter />
                </div>
              </a>
              <a
                href='https://youtube.com/@nick-karnik'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <FaYoutube />
                </div>
              </a>
              <a
                href='https://stackoverflow.com/users/460472/nick'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <FaStackOverflow />
                </div>
              </a>
              <a
                href='/assets/documents/resume-nick-karnik.pdf'
                target='_blank'
                rel='noopener'
              >
                <div
                  className={css({
                    fontSize: 'lg',
                    color: 'gray.600',
                    _hover: { color: 'brand.600' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  })}
                >
                  <HiOutlineDocumentText />
                </div>
              </a>
            </div>
            <p
              className={css({
                fontSize: 'sm',
                color: 'gray.600',
              })}
            >
              Available for consulting at{' '}
              <a
                href='https://plutonic.consulting'
                target='_blank'
                rel='noopener'
                className={css({
                  color: 'brand.600',
                  _hover: { textDecoration: 'underline' },
                })}
              >
                Plutonic Consulting
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
