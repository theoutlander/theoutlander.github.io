import { useEffect, useRef, useState } from 'react';
import { FaComment, FaHeart, FaCog } from 'react-icons/fa';
import UtterancesComments from './UtterancesComments';
import HashnodeComments from './HashnodeComments';
import SimpleComments from './SimpleComments';
import { COMMENTS_CONFIG } from '../../lib/comments';

interface CommentsProps {
  postTitle: string;
  postUrl: string;
}

type CommentSystem = 'hashnode' | 'giscus' | 'utterances' | 'simple';

export default function Comments({ postTitle, postUrl }: CommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [commentSystem, setCommentSystem] =
    useState<CommentSystem>('utterances');

  useEffect(() => {
    // Only load Giscus on client side
    if (typeof window === 'undefined' || commentSystem !== 'giscus') return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', COMMENTS_CONFIG.githubRepo);
    script.setAttribute('data-repo-id', COMMENTS_CONFIG.giscus.repoId);
    script.setAttribute('data-category', COMMENTS_CONFIG.giscus.category);
    script.setAttribute('data-category-id', COMMENTS_CONFIG.giscus.categoryId);
    script.setAttribute('data-mapping', COMMENTS_CONFIG.giscus.mapping);
    script.setAttribute('data-strict', COMMENTS_CONFIG.giscus.strict);
    script.setAttribute(
      'data-reactions-enabled',
      COMMENTS_CONFIG.giscus.reactionsEnabled
    );
    script.setAttribute(
      'data-emit-metadata',
      COMMENTS_CONFIG.giscus.emitMetadata
    );
    script.setAttribute(
      'data-input-position',
      COMMENTS_CONFIG.giscus.inputPosition
    );
    script.setAttribute('data-theme', COMMENTS_CONFIG.giscus.theme);
    script.setAttribute('data-lang', COMMENTS_CONFIG.giscus.lang);
    script.setAttribute('data-loading', COMMENTS_CONFIG.giscus.loading);
    script.crossOrigin = 'anonymous';
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
  }, [postTitle, postUrl, commentSystem]);

  // If using Hashnode, render the Hashnode component
  if (commentSystem === 'hashnode') {
    return <HashnodeComments postUrl={postUrl} />;
  }

  // If using Utterances, render the Utterances component
  if (commentSystem === 'utterances') {
    return <UtterancesComments postTitle={postTitle} postUrl={postUrl} />;
  }

  // If using Simple comments, render the Simple component
  if (commentSystem === 'simple') {
    // Extract slug from postUrl for post-specific comments
    const postSlug = postUrl.split('/').pop() || 'default';
    return <SimpleComments postSlug={postSlug} />;
  }

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
                Hashnode Comments
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <FaHeart size={16} color='#fc8181' />
              <div style={{ display: 'flex', gap: '8px' }}>
                <FaCog size={12} color='#a0aec0' />
                <div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#a0aec0',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Comment System
                  </p>
                  <select
                    id='comment-system-select'
                    value={commentSystem}
                    onChange={e =>
                      setCommentSystem(e.target.value as CommentSystem)
                    }
                    className='comment-system-select'
                    aria-label='Select comment system'
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    <option value='hashnode'>Hashnode Comments</option>
                    <option value='giscus'>Giscus Comments</option>
                    <option value='utterances'>Utterances Comments</option>
                    <option value='simple'>Simple Comments</option>
                  </select>
                </div>
              </div>
            </div>
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
