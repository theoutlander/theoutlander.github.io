import React from 'react';
import { css } from '../../styled-system/css/index.mjs';
import { container } from '../../styled-system/patterns/index.mjs';
import { FiMail, FiExternalLink, FiDownload } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CompanyLogo } from '../components/CompanyLogo';

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

            {/* Current Role - Plutonic Consulting */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='plutonic' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Founder & Fractional CTO
                </h4>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.600',
                      fontWeight: 'medium',
                    })}
                  >
                    May 2025 - Present
                  </span>
                  <span
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
                    Current
                  </span>
                </div>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                Plutonic Consulting
              </p>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Providing fractional CTO support, AI strategy, and scaling
                guidance to founders. Helping teams move faster with clear
                product bets, strong execution, and systems that are simple to
                maintain. Focus on pragmatic AI integration and developer
                experience optimization.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'AI Strategy',
                  'Technical Leadership',
                  'Fractional CTO',
                  'Team Scaling',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'purple.100',
                      color: 'purple.700',
                      px: 3,
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

            {/* Google */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='google' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Staff Software Engineer / Engineering Manager
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  May 2022 - Apr 2025
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                Google
              </p>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Led technical direction and hands-on engineering for Gemini Code
                Assist, integrated into VSCode and IntelliJ IDEs. Implemented a
                symbol table generator across multiple languages, increasing
                context for LLM, reducing tokens, and significantly improving
                code completion acceptance rates.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Go',
                  'TypeScript',
                  'Node.js',
                  'Kubernetes',
                  'GCP',
                  'LLM',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'blue.100',
                      color: 'blue.700',
                      px: 3,
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

            {/* Salesforce */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='salesforce' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Senior Engineering Manager
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Oct 2019 - Apr 2022
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                Salesforce
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                  mb: 4,
                })}
              >
                <li>
                  Built a CI pipeline (TACO) for 100+ partners, delivering REST
                  and native Salesforce connectors
                </li>
                <li>
                  Owned the Web Data Connector platform and managed a team of
                  35+ engineers
                </li>
                <li>
                  Drove hiring, mentoring, and technical strategy while creating
                  a Connector SDK
                </li>
              </ul>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'TypeScript',
                  'Node.js',
                  'Chromium',
                  'CI/CD',
                  'Team Leadership',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'blue.100',
                      color: 'blue.700',
                      px: 3,
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

            {/* T-Mobile */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='tmobile' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Director Of Engineering
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Nov 2018 - Oct 2019
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                T-Mobile
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                  mb: 4,
                })}
              >
                <li>
                  Hired a diverse team of 25 engineers and managed four product
                  teams (35+ engineers)
                </li>
                <li>
                  Delivered custom desktop & mobile applications for the
                  T-Mobile/Sprint merger
                </li>
                <li>
                  Architected and implemented a portable Test Automation
                  Framework
                </li>
              </ul>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Team Leadership',
                  'Rapid Hiring',
                  'Mobile Development',
                  'Test Automation',
                  'Project Management',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'pink.100',
                      color: 'pink.700',
                      px: 3,
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

            {/* FullStack Consulting */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='fullstack' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Principal / Founder
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Mar 2018 - Nov 2018
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                FullStack Consulting
              </p>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Trained students, created technical content, and consulted on
                MVPs and scale-up projects for various clients (Hims, ForHers,
                CopBot, Sensei Ag). Built mobile applications with React Native.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'React Native',
                  'GraphQL',
                  'Training',
                  'Consulting',
                  'Mobile Apps',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'green.100',
                      color: 'green.700',
                      px: 3,
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

            {/* TREASURE */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='treasure' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  CTO
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Sep 2017 - Mar 2018
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                TREASURE
              </p>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Built a fin-tech analytics product with integration to Plaid and
                custom APIs. Accepted into the Nasdaq Entrepreneurial Program.
                Led engineering and technical vision.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'FinTech',
                  'Plaid API',
                  'Banking Integration',
                  'Technical Leadership',
                  'Startup',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'yellow.100',
                      color: 'yellow.700',
                      px: 3,
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

            {/* jobbatical */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='jobbatical' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  CTO
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Apr 2017 - Aug 2017
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                jobbatical
              </p>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Migrated a monolith to microservices, rebuilt CI/CD, monitoring,
                and deployment pipelines. Led platform modernization and
                organizational scaling.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Microservices',
                  'CI/CD',
                  'Platform Architecture',
                  'DevOps',
                  'Scaling',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'orange.100',
                      color: 'orange.700',
                      px: 3,
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

            {/* IDM */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='idm' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Senior Software Engineer
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Sep 2012 - Oct 2016
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                IDM (IV Labs, now part of Gates Foundation)
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                  mb: 4,
                })}
              >
                <li>
                  Built simulation and visualization tools for diseases
                  (malaria, HIV, TB, polio)
                </li>
                <li>
                  Software and spatial models featured in Bill Gates' TED Talk
                </li>
                <li>
                  Collaborated with organizations like WHO on global health
                  initiatives
                </li>
              </ul>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Data Visualization',
                  'Simulation',
                  'Global Health',
                  'Scientific Computing',
                  'WHO Collaboration',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'teal.100',
                      color: 'teal.700',
                      px: 3,
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

            {/* Microsoft */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='microsoft' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Software Development Engineer
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  Aug 2006 - Aug 2012
                </span>
              </div>
              <p
                className={css({
                  fontSize: 'md',
                  color: 'brand.600',
                  fontWeight: 'medium',
                  mb: 4,
                })}
              >
                Microsoft
              </p>
              <ul
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  pl: 4,
                  mb: 4,
                })}
              >
                <li>
                  Led multiple Bing teams and architected a Big Data Validation
                  Framework
                </li>
                <li>Built JS memory profiling tools for Outlook Web Access</li>
                <li>
                  Developed Naive Bayes sentiment classifiers for Bing Shopping
                </li>
                <li>
                  Designed and implemented tools for common development tasks
                </li>
              </ul>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Big Data',
                  'JavaScript',
                  'Machine Learning',
                  'Outlook Web Access',
                  'Bing',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'red.100',
                      color: 'red.700',
                      px: 3,
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

          {/* Notable Projects */}
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
              Notable Projects
            </h3>

            {/* Gemini Code Assist */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='gemini-code-assist' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Gemini Code Assist
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2022 - 2025
                </span>
              </div>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Led technical direction and hands-on engineering for Google's AI
                coding assistant, integrated into VSCode and IntelliJ IDEs.
                Implemented a symbol table generator across multiple languages,
                increasing context for LLM, reducing tokens, and significantly
                improving code completion acceptance rates.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Go',
                  'TypeScript',
                  'Node.js',
                  'Kubernetes',
                  'GCP',
                  'LLM',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'blue.100',
                      color: 'blue.700',
                      px: 3,
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

            {/* TACO Toolkit & Connector SDK */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='wdc-3' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  TACO Toolkit & Connector SDK
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2019 - 2022
                </span>
              </div>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Built a robust CI/CD pipeline (TACO) enabling over 100 partners
                to test and deploy Tableau connectors efficiently. Created a
                widely adopted Connector SDK that simplified connector
                development and improved partner onboarding.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'TypeScript',
                  'Node.js',
                  'Chromium',
                  'CI/CD',
                  'SDK Development',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'orange.100',
                      color: 'orange.700',
                      px: 3,
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

            {/* Videoly Platform */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='ycombinator' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  Videoly Platform
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2007 - 2009
                </span>
              </div>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Co-founded a video mail platform and was accepted into
                YCombinator 2007. Experimented with various revenue models and
                built a scalable video streaming platform.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {[
                  'Ruby on Rails',
                  'Flex',
                  'Amazon EC2/S3',
                  'YCombinator',
                  'Video Streaming',
                ].map(skill => (
                  <span
                    key={skill}
                    className={css({
                      bg: 'red.100',
                      color: 'red.700',
                      px: 3,
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

            {/* RoomToday Platform */}
            <div className={css({ mb: 8 })}>
              <div className={css({ textAlign: 'center', mb: 4 })}>
                <CompanyLogo company='roomtoday' width='120px' />
              </div>
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
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'gray.800',
                    fontFamily: 'heading',
                  })}
                >
                  RoomToday Platform
                </h4>
                <span
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                  })}
                >
                  2014 - 2016
                </span>
              </div>
              <p
                className={css({
                  color: 'gray.700',
                  fontSize: 'sm',
                  lineHeight: 1.6,
                  mb: 4,
                })}
              >
                Co-founded a real-time, last-minute hotel booking platform.
                Raised $1.6M, led an acquisition, and developed mobile apps and
                property management systems.
              </p>
              <div
                className={css({
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                })}
              >
                {['React Native', 'Real-time Systems', 'Mobile Apps'].map(
                  skill => (
                    <span
                      key={skill}
                      className={css({
                        bg: 'green.100',
                        color: 'green.700',
                        px: 3,
                        py: 1,
                        borderRadius: 'md',
                        fontSize: 'xs',
                        fontWeight: 'medium',
                      })}
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
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
