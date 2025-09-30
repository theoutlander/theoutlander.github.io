import { useEffect, useRef } from 'react';
import { FaComment, FaHeart } from 'react-icons/fa';
import { COMMENTS_CONFIG } from '../../lib/comments';

interface UtterancesCommentsProps {
  postTitle: string;
  postUrl: string;
}

export default function UtterancesComments({
  postTitle,
  postUrl,
}: UtterancesCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load Utterances on client side
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', COMMENTS_CONFIG.githubRepo);
    script.setAttribute('issue-term', COMMENTS_CONFIG.utterances.issueTerm);
    script.setAttribute('theme', COMMENTS_CONFIG.utterances.theme);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    // Capture the ref value
    const currentRef = commentsRef.current;

    // Clear previous comments
    if (currentRef) {
      currentRef.innerHTML = '';
      currentRef.appendChild(script);
    }

    return () => {
      // Cleanup
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, [postTitle, postUrl]);

  return (
    <div style={{ marginTop: '48px', paddingTop: '32px' }}>
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #e2e8f0',
          marginBottom: '32px',
        }}
      />

      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FaComment size={20} color='#3182ce' />
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1a202c',
                  margin: 0,
                }}
              >
                Comments
              </h2>
              <span
                style={{
                  backgroundColor: '#ebf8ff',
                  color: '#3182ce',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                Live Comments
              </span>
            </div>
            <FaHeart size={16} color='#fc8181' />
          </div>

          <p
            style={{
              color: '#718096',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            Share your thoughts and join the discussion! Leave a comment below.
          </p>

          <div
            style={{
              padding: '24px',
              background: 'linear-gradient(to right, #ebf8ff, #faf5ff)',
              borderRadius: '12px',
              border: '1px solid #bee3f8',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
              >
                <FaComment size={20} color='#4a5568' />
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#4a5568',
                    margin: 0,
                  }}
                >
                  Ready to join the conversation?
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#1a202c',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    // Scroll to comments section
                    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Scroll to Comments
                </button>
              </div>
            </div>
          </div>

          <div
            ref={commentsRef}
            style={{
              minHeight: '300px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
            }}
          />
        </div>
      </div>
    </div>
  );
}
