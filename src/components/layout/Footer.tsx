import {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
  FiMail,
} from 'react-icons/fi';
import { FaStackOverflow, FaNodeJs, FaReact } from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '48px 0',
        backgroundColor: '#f7fafc',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main content row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              width: '100%',
              gap: '32px',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: About */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                flex: '1',
                minWidth: '300px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  margin: 0,
                }}
              >
                Nick Karnik
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#718096',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Engineering Leader & Staff Software Engineer
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'default',
                  }}
                >
                  <FaNodeJs size={16} color='#68d391' />
                  <span style={{ fontSize: '14px', color: '#718096' }}>
                    Node
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'default',
                  }}
                >
                  <FaReact size={16} color='#63b3ed' />
                  <span style={{ fontSize: '14px', color: '#718096' }}>
                    React
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'default',
                  }}
                >
                  <SiTypescript size={16} color='#3182ce' />
                  <span style={{ fontSize: '14px', color: '#718096' }}>
                    TypeScript
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Social Links */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                minWidth: '200px',
              }}
            >
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a202c',
                  margin: 0,
                }}
              >
                Connect
              </h4>
              <div style={{ display: 'flex', gap: '24px' }}>
                <a
                  href='mailto:nick@karnik.io'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='Send email to Nick Karnik'
                >
                  <FiMail size={20} />
                </a>
                <a
                  href='https://github.com/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='Visit Nick Karnik on GitHub'
                >
                  <FiGithub size={20} />
                </a>
                <a
                  href='https://linkedin.com/in/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='Connect with Nick Karnik on LinkedIn'
                >
                  <FiLinkedin size={20} />
                </a>
                <a
                  href='https://twitter.com/theoutlander'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='Follow Nick Karnik on Twitter'
                >
                  <FiTwitter size={20} />
                </a>
                <a
                  href='https://youtube.com/@nick-karnik'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='Subscribe to Nick Karnik on YouTube'
                >
                  <FiYoutube size={20} />
                </a>
                <a
                  href='https://stackoverflow.com/users/460472/nick'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#718096',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  aria-label='View Nick Karnik on Stack Overflow'
                >
                  <FaStackOverflow size={20} />
                </a>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#a0aec0',
                  margin: 0,
                }}
              >
                Available for consulting at{' '}
                <a
                  href='https://plutonic.consulting'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    color: '#3182ce',
                    textDecoration: 'underline',
                  }}
                >
                  Plutonic Consulting
                </a>
              </p>
            </div>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              margin: 0,
            }}
          />

          {/* Bottom: Copyright */}
          <p
            style={{
              fontSize: '12px',
              color: '#a0aec0',
              textAlign: 'center',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Nick Karnik. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
