import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import { container } from '../../styled-system/patterns/index.mjs';
import { FiMail, FiExternalLink, FiDownload } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export function ResumePagePanda() {
  return (
    <div
      className={css({
        bg: 'gray.50',
        minH: '100vh',
      })}
    >
      <Header currentPage='resume' />
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
            Resume
          </h1>
          <p
            className={css({
              fontSize: 'xl',
              color: 'gray.600',
              maxWidth: '600px',
              margin: '0 auto',
              mb: 8,
            })}
          >
            Staff Software Engineer & Engineering Leader with 25+ years building
            scalable platforms at Google, Microsoft, Salesforce, Tableau, and
            startups
          </p>
          <div
            className={css({
              display: 'flex',
              gap: 4,
              justifyContent: 'center',
              flexWrap: 'wrap',
            })}
          >
            <a
              href='/assets/documents/resume-nick-karnik.pdf'
              target='_blank'
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bg: 'brand.600',
                color: 'white',
                px: 6,
                py: 3,
                borderRadius: 'md',
                fontWeight: 500,
                textDecoration: 'none',
                _hover: {
                  bg: 'brand.700',
                },
              })}
            >
              <FiDownload />
              Download PDF
            </a>
            <a
              href='mailto:nick@karnik.io'
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: '1px solid',
                borderColor: 'gray.200',
                color: 'gray.800',
                px: 6,
                py: 3,
                borderRadius: 'md',
                fontWeight: 500,
                textDecoration: 'none',
                _hover: {
                  bg: 'gray.50',
                },
              })}
            >
              <FiMail />
              Contact Me
            </a>
          </div>
        </div>

        {/* Resume Content */}
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
          {/* Contact Info */}
          <div
            className={css({
              textAlign: 'center',
              mb: 8,
              pb: 8,
              borderBottom: '1px solid',
              borderColor: 'gray.200',
            })}
          >
            <h2
              className={css({
                fontSize: '2xl',
                fontWeight: 'bold',
                color: 'gray.800',
                mb: 2,
                fontFamily: 'heading',
              })}
            >
              Nick Karnik
            </h2>
            <p
              className={css({
                fontSize: 'lg',
                color: 'brand.600',
                fontWeight: 'medium',
                mb: 4,
              })}
            >
              Staff Software Engineer & Engineering Leader
            </p>
            <div
              className={css({
                display: 'flex',
                gap: 6,
                justifyContent: 'center',
                flexWrap: 'wrap',
                fontSize: 'sm',
                color: 'gray.600',
              })}
            >
              <a
                href='mailto:nick@karnik.io'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  _hover: { color: 'brand.600' },
                })}
              >
                <FiMail />
                nick@karnik.io
              </a>
              <a
                href='https://github.com/theoutlander'
                target='_blank'
                rel='noopener'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  _hover: { color: 'brand.600' },
                })}
              >
                <FiExternalLink />
                github.com/theoutlander
              </a>
              <a
                href='https://www.linkedin.com/in/theoutlander'
                target='_blank'
                rel='noopener'
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  _hover: { color: 'brand.600' },
                })}
              >
                <FiExternalLink />
                linkedin.com/in/theoutlander
              </a>
            </div>
          </div>

          {/* Summary */}
          <div className={css({ mb: 8 })}>
            <h3
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 4,
                fontFamily: 'heading',
              })}
            >
              Summary
            </h3>
            <p
              className={css({
                color: 'gray.700',
                lineHeight: 1.6,
              })}
            >
              Engineering leader with 25+ years of experience building scalable
              platforms and leading teams at top tech companies. Expert in
              TypeScript, React, Node.js, and modern web technologies.
              Passionate about developer experience, AI integration, and
              building systems that scale.
            </p>
          </div>

          {/* Experience */}
          <div className={css({ mb: 8 })}>
            <h3
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 6,
                fontFamily: 'heading',
              })}
            >
              Experience
            </h3>

            {/* Current Role */}
            <div className={css({ mb: 6 })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 2,
                })}
              >
                <h4
                  className={css({
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Engineering Advisor & Consultant
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2024 - Present
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 3,
                })}
              >
                Plutonic Consulting
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                })}
              >
                <li>
                  Advising startups and enterprises on engineering strategy and
                  technical architecture
                </li>
                <li>
                  Helping teams adopt modern development practices and AI
                  integration
                </li>
                <li>
                  Building developer tools and improving developer experience
                </li>
              </ul>
            </div>

            {/* Previous Roles */}
            <div className={css({ mb: 6 })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 2,
                })}
              >
                <h4
                  className={css({
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Staff Software Engineer
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2020 - 2024
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 3,
                })}
              >
                Google, Microsoft, Salesforce, Tableau
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                })}
              >
                <li>
                  Led engineering teams of 8-12 engineers across multiple
                  companies
                </li>
                <li>
                  Built and scaled web applications serving millions of users
                </li>
                <li>
                  Implemented modern development practices and CI/CD pipelines
                </li>
                <li>
                  Mentored junior engineers and established technical standards
                </li>
              </ul>
            </div>
          </div>

          {/* Skills */}
          <div className={css({ mb: 8 })}>
            <h3
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 4,
                fontFamily: 'heading',
              })}
            >
              Technical Skills
            </h3>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                gap: 4,
              })}
            >
              <div>
                <h4
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    color: 'gray.700',
                    mb: 2,
                    fontFamily: 'heading',
                  })}
                >
                  Languages & Frameworks
                </h4>
                <div
                  className={css({
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                  })}
                >
                  {[
                    'TypeScript',
                    'JavaScript',
                    'React',
                    'Node.js',
                    'Python',
                  ].map(skill => (
                    <span
                      key={skill}
                      className={css({
                        bg: 'brand.100',
                        color: 'brand.700',
                        px: 2,
                        py: 1,
                        borderRadius: 'md',
                        fontSize: 'xs',
                        fontWeight: 'medium',
                      })}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    color: 'gray.700',
                    mb: 2,
                    fontFamily: 'heading',
                  })}
                >
                  Tools & Technologies
                </h4>
                <div
                  className={css({
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                  })}
                >
                  {['AWS', 'Docker', 'Kubernetes', 'Git', 'Jest'].map(skill => (
                    <span
                      key={skill}
                      className={css({
                        bg: 'green.100',
                        color: 'green.700',
                        px: 2,
                        py: 1,
                        borderRadius: 'md',
                        fontSize: 'xs',
                        fontWeight: 'medium',
                      })}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                color: 'gray.800',
                mb: 4,
                fontFamily: 'heading',
              })}
            >
              Education
            </h3>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                flexWrap: 'wrap',
                gap: 2,
              })}
            >
              <div>
                <h4
                  className={css({
                    fontSize: 'md',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Bachelor of Science in Computer Science
                </h4>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'brand.600',
                    fontWeight: 'medium',
                  })}
                >
                  University of Maryland
                </p>
              </div>
              <span
                className={css({
                  fontSize: 'sm',
                  color: 'gray.600',
                  fontWeight: 'medium',
                })}
              >
                1998 - 2002
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
