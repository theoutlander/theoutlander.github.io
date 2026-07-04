/* Playing card renderer (React), simple, bold, high-legibility.
   Designed for fanned/overlapping hands and low vision:
   - top-left index (rank over suit) lives in the strip that stays visible when
     cards overlap, so you can always read the fan.
   - center shows the BIG rank + its suit for the fully-visible card.
   - two colors only: spades/clubs black, hearts/diamonds red.
*/
(function () {
  const { SUIT_SYMBOL, SUIT_COLOR, rankLabel } = window.JEngine;

  function Card(props) {
    const {
      card, faceDown, width = 64, back, mini,
      className = '', style = {}, onClick, legal, illegal, selectable,
    } = props;
    const w = width;
    const h = Math.round(w * 1.4);

    const baseStyle = Object.assign({
      width: w + 'px', height: h + 'px',
      '--cardw': w + 'px',
      '--idx-r': (w * (mini ? 0.52 : 0.34)).toFixed(1) + 'px',
      '--idx-s': (w * (mini ? 0.4 : 0.26)).toFixed(1) + 'px',
      '--mid-r': (w * 0.62).toFixed(1) + 'px',
      '--mid-s': (w * 0.30).toFixed(1) + 'px',
    }, style);

    if (faceDown) {
      const b = back || { c1: '#b3361f', c2: '#7e2113', ink: '#f4dca0' };
      const bStyle = Object.assign({}, baseStyle, {
        '--back-1': b.c1, '--back-2': b.c2, '--back-ink': b.ink,
      });
      return React.createElement('div', {
        className: 'card face-down ' + className, style: bStyle, onClick,
      },
        React.createElement('div', { className: 'back' },
          React.createElement('div', { className: 'crest' }, '♠')
        )
      );
    }

    const color = SUIT_COLOR[card.suit];
    const sym = SUIT_SYMBOL[card.suit];
    const rl = rankLabel(card.rank);
    const cls = ['card', color, mini ? 'mini' : '', className, legal ? 'legal' : '', illegal ? 'illegal' : '', selectable ? 'selectable' : ''].join(' ');

    return React.createElement('div', { className: cls, style: baseStyle, onClick },
      // top-left index (always visible in a fan)
      React.createElement('div', { className: 'idx' },
        React.createElement('span', { className: 'idx-r' }, rl),
        React.createElement('span', { className: 'idx-s' }, sym)
      ),
      // big center rank + suit (only for fully-visible single cards)
      mini ? null : React.createElement('div', { className: 'mid' },
        React.createElement('span', { className: 'mid-r' }, rl),
        React.createElement('span', { className: 'mid-s' }, sym)
      )
    );
  }

  window.Card = Card;
})();
