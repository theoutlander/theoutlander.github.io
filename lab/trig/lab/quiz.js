/* Trig quiz. Renders into #quizBox. Plain language, no em dashes. */
(function(){
  const box = document.getElementById('quizBox');
  if(!box) return;

  const QUIZ = [
    { q:'In a right triangle, sin θ is which ratio?',
      o:[['opposite ÷ hypotenuse',1],['adjacent ÷ hypotenuse',0],['opposite ÷ adjacent',0]],
      e:'SOH means Sine is Opposite over Hypotenuse. It is the height compared to the longest side.' },
    { q:'As the angle θ grows from 0° toward 90°, cosine…',
      o:[['falls toward 0',1],['rises toward 1',0],['stays the same',0]],
      e:'Cosine is the width ratio. As θ opens, the adjacent side shrinks, so cos θ drops from 1 down to 0.' },
    { q:'Tangent is the same as…',
      o:[['sin θ ÷ cos θ',1],['sin θ × cos θ',0],['cos θ ÷ sin θ',0]],
      e:'tan θ = opposite ÷ adjacent. That works out to sin θ ÷ cos θ.' },
    { q:'On the unit circle (radius 1), the height of the dot equals…',
      o:[['sin θ',1],['cos θ',0],['tan θ',0]],
      e:'With the hypotenuse equal to 1, the opposite side is exactly sin θ. That is the height. Cosine is the across distance.' },
    { q:'Why does tan θ have no value at exactly 90°?',
      o:[['the adjacent side is 0, so it would divide by zero',1],['the triangle disappears',0],['sine becomes 0',0]],
      e:'At 90° the adjacent side shrinks to 0. Opposite ÷ 0 is undefined, so tangent shoots off without limit.' }
  ];

  QUIZ.forEach((Q,qi)=>{
    const wrap = document.createElement('div'); wrap.className='q';
    const opts = Q.o.map(([label],oi)=>`<button class="opt" data-oi="${oi}">${label}</button>`).join('');
    wrap.innerHTML = `<p class="qq"><span class="qn">Q${qi+1}.</span>${Q.q}</p><div class="opts">${opts}</div><p class="exp"></p>`;
    wrap.addEventListener('click', e=>{
      const btn = e.target.closest('.opt'); if(!btn || wrap.classList.contains('answered')) return;
      wrap.classList.add('answered');
      const oi = +btn.dataset.oi;
      wrap.querySelectorAll('.opt').forEach((el,idx)=>{
        el.classList.add('locked');
        if(Q.o[idx][1]===1) el.classList.add('correct');
        else if(idx===oi) el.classList.add('wrong');
      });
      wrap.querySelector('.exp').textContent = (Q.o[oi][1]===1 ? '\u2713 ' : '\u2717 ') + Q.e;
    });
    box.appendChild(wrap);
  });
})();
