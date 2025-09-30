import { css } from '../../styled-system/css/index.mjs';
import { vstack } from '../../styled-system/patterns/index.mjs';

export default function StatsStrip() {
  return (
    <section
      className={css({
        bg: 'gray.100',
        py: '16',
        px: '4',
      })}
    >
      <div
        className={css({
          maxW: '6xl',
          mx: 'auto',
          display: 'flex',
          flexDirection: { base: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: { base: '8', md: '0' },
        })}
      >
        {/* Years Leadership */}
        <div
          className={vstack({
            gap: '2',
            alignItems: 'center',
            flex: '1',
          })}
        >
          <div
            className={css({
              fontSize: { base: '3xl', md: '4xl' },
              fontWeight: 'bold',
              color: 'gray.900',
              lineHeight: '1',
            })}
          >
            10+
          </div>
          <div
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              textAlign: 'center',
              fontWeight: 'medium',
            })}
          >
            Years Leadership
          </div>
        </div>

        {/* Teams Led */}
        <div
          className={vstack({
            gap: '2',
            alignItems: 'center',
            flex: '1',
          })}
        >
          <div
            className={css({
              fontSize: { base: '3xl', md: '4xl' },
              fontWeight: 'bold',
              color: 'gray.900',
              lineHeight: '1',
            })}
          >
            5+
          </div>
          <div
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              textAlign: 'center',
              fontWeight: 'medium',
            })}
          >
            Teams Led
          </div>
        </div>

        {/* Years Building Software */}
        <div
          className={vstack({
            gap: '2',
            alignItems: 'center',
            flex: '1',
          })}
        >
          <div
            className={css({
              fontSize: { base: '3xl', md: '4xl' },
              fontWeight: 'bold',
              color: 'gray.900',
              lineHeight: '1',
            })}
          >
            25+
          </div>
          <div
            className={css({
              fontSize: 'sm',
              color: 'gray.600',
              textAlign: 'center',
              fontWeight: 'medium',
            })}
          >
            Years Building Software
          </div>
        </div>
      </div>
    </section>
  );
}
