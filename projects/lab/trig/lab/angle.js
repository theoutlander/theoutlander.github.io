/* Step 1 figure: an angle — two rays meeting at a point, opening from 0–90°+. */
(function(){
  const root = document.getElementById('lab-angle');
  if(!root) return;
  const cv  = root.querySelector('[data-canvas]');
  const sld = root.querySelector('[data-angle]');
  const out = root.querySelector('[data-ang]');
  const g = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const O = { x: 92, y: H-58 };
  const L = Math.min(W-150, H-46);
  const V = n => Lab.cssVar(n);

  function draw(){
    const deg = +sld.value, th = deg*Math.PI/180;
    const accent=V('--accent'), ink=V('--ink'), dim=V('--ink-3');
    g.clearRect(0,0,W,H);
    g.lineCap='round';
    // fixed base ray
    g.strokeStyle=dim; g.lineWidth=3;
    g.beginPath(); g.moveTo(O.x,O.y); g.lineTo(O.x+L,O.y); g.stroke();
    // opening ray
    g.strokeStyle=accent; g.lineWidth=3;
    g.beginPath(); g.moveTo(O.x,O.y); g.lineTo(O.x+L*Math.cos(th), O.y-L*Math.sin(th)); g.stroke();
    // sweep arc
    g.strokeStyle=ink; g.lineWidth=2;
    g.beginPath(); g.arc(O.x,O.y,54,-th,0); g.stroke();
    // degree label inside the wedge
    g.fillStyle=ink; g.font='600 22px "JetBrains Mono", monospace'; g.textAlign='left'; g.textBaseline='middle';
    const mid=-th/2; g.fillText(deg+'°', O.x+82*Math.cos(mid), O.y-82*Math.sin(mid));
    // vertex
    g.fillStyle=ink; g.beginPath(); g.arc(O.x,O.y,4,0,7); g.fill();
    out.textContent = deg+'°';
  }

  sld.addEventListener('input', draw);
  root.querySelectorAll('[data-preset]').forEach(b=>{
    b.addEventListener('click', ()=>{ sld.value=b.dataset.preset; draw(); });
  });
  draw();
})();
