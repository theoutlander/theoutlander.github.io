/* Playing card renderer (React) — clean, modern, minimal.
   Corner index (rank over suit) is the hero; a single elegant suit mark sits
   in the center with plenty of breathing room. Court cards use a clean monogram.
   Optional faceStyle 'pips' restores a tidy pip layout for number cards.
*/
(function () {
  const { SUIT_SYMBOL, SUIT_COLOR, rankLabel } = window.JEngine;

  // tidy pip coordinates (only used when faceStyle === 'pips')
  const PIPS = {
    2: [[50, 20], [50, 80]],
    3: [[50, 20], [50, 50], [50, 80]],
    4: [[35, 22], [65, 22], [35, 78], [65, 78]],
    5: [[35, 22], [65, 22], [50, 50], [35, 78], [65, 78]],
    6: [[35, 22], [65, 22], [35, 50], [65, 50], [35, 78], [65, 78]],
    7: [[35, 20], [65, 20], [50, 35], [35, 50], [65, 50], [35, 80], [65, 80]],
    8: [[35, 20], [65, 20], [50, 35], [35, 50], [65, 50], [50, 65], [35, 80], [65, 80]],
    9: [[35, 19], [65, 19], [35, 40], [65, 40], [50, 50], [35, 60], [65, 60], [35, 81], [65, 81]],
    10: [[35, 18], [65, 18], [50, 29], [35, 40], [65, 40], [35, 60], [65, 60], [50, 71], [35, 82], [65, 82]],
  };

  function Card(props) {
    const {
      card, faceDown, width = 64, back, faceStyle = 'modern',
      className = '', style = {}, onClick, legal, illegal, selectable,
    } = props;
    const w = width;
    const h = Math.round(w * 1.4);

    const baseStyle = Object.assign({
      width: w + 'px', height: h + 'px',
      '--cardw': w + 'px',
      '--rank-fs': (w * 0.4).toFixed(1) + 'px',
      '--csuit-fs': (w * 0.27).toFixed(1) + 'px',
      '--mid-fs': (w * 0.44).toFixed(1) + 'px',
      '--court-fs': (w * 0.5).toFixed(1) + 'px',
      '--courtsuit-fs': (w * 0.2).toFixed(1) + 'px',
      '--pip-fs': (w * 0.2).toFixed(1) + 'px',
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
          React.createElement('div', { className: 'crest' }, '\u2660')
        )
      );
    }

    const color = SUIT_COLOR[card.suit];
    const sym = SUIT_SYMBOL[card.suit];
    const rl = rankLabel(card.rank);
    const isCourt = card.rank >= 11 && card.rank <= 13;
    const isAce = card.rank === 14;
    const cls = ['card', color, className, legal ? 'legal' : '', illegal ? 'illegal' : '', selectable ? 'selectable' : ''].join(' ');

    const corner = (pos) => React.createElement('div', { className: 'corner ' + pos },
      React.createElement('div', { className: 'r' }, rl),
      React.createElement('div', { className: 's' }, sym)
    );

    let middle;
    if (isCourt) {
      middle = React.createElement('div', { className: 'mid court' },
        React.createElement('div', { className: 'court-letter' }, rl),
        React.createElement('div', { className: 'court-suit' }, sym)
      );
    } else if (isAce) {
      middle = React.createElement('div', { className: 'mid' },
        React.createElement('div', { className: 'mid-suit ace' }, sym)
      );
    } else if (faceStyle === 'pips') {
      const coords = PIPS[card.rank] || [];
      middle = React.createElement('div', { className: 'pips' },
        coords.map(([x, y], i) => React.createElement('div', {
          key: i, className: 'pip' + (y > 50 ? ' flip' : ''),
          style: { left: x + '%', top: y + '%' },
        }, sym))
      );
    } else {
      middle = React.createElement('div', { className: 'mid' },
        React.createElement('div', { className: 'mid-suit' }, sym)
      );
    }

    return React.createElement('div', { className: cls, style: baseStyle, onClick },
      corner('tl'), middle, corner('br')
    );
  }

  window.Card = Card;
})();
