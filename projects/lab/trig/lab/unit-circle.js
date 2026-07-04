/* Station: The circle that makes the wave.
   A point goes around a circle; its HEIGHT is the sine, its SHADOW on the
   floor is the cosine. Unroll that height over time and you get a sine wave. */
(function(){
  const root = document.getElementById('lab-circle');
  if(!root) return;
  const cv      = root.querySelector('[data-canvas]');
  const playBtn = root.querySelector('[data-play]');
  const thetaSld= root.querySelector('[data-theta]');
  const speedSld= root.querySelector('[data-speed]');
  const cosTog  = root.querySelector('[data-cos]');
  const triTog  = root.querySelector('[data-tri]');
  const radTog  = root.querySelector('[data-rad]');
  const hearBtn = root.querySelector('[data-hear]');
  const oTheta  = root.querySelector('[data-otheta]');
  const oSin    = root.querySelector('[data-osin]');
  const oCos    = root.querySelector('[data-ocos]');

  const g = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const cx = 232, cy = H/2, R = 150;
  const waveX0 = 432, waveX1 = W - 18, WW = waveX1 - waveX0;
  const SPAN = Math.PI * 2 * 2.6;   // ~2.6 cycles visible

  let theta = (+thetaSld.value) * Math.PI/180;
  let playing = false, raf = null, lastTs = 0;
  let showCos = false, showTri = true, useRad = false;

  const V = n => Lab.cssVar(n);

  function fmtAngle(t){
    const deg = ((t*180/Math.PI)%360+360)%360;
    if(useRad){ const r = ((t%(2*Math.PI))+2*Math.PI)%(2*Math.PI); return (r/Math.PI).toFixed(2)+'π'; }
    return Math.round(deg)+'°';
  }

  function draw(){
    g.clearRect(0,0,W,H);
    const accent=V('--accent'), cyan=V('--tok-key'), ink=V('--ink'), ink3=V('--ink-3'), rule=V('--rule'), rule2=V('--rule-2');

    // wave baseline + circle axes
    g.strokeStyle=rule2; g.lineWidth=1;
    g.beginPath(); g.moveTo(waveX0,cy); g.lineTo(waveX1,cy); g.stroke();
    g.strokeStyle=rule; g.beginPath();
    g.moveTo(cx-R-18,cy); g.lineTo(cx+R+18,cy);
    g.moveTo(cx,cy-R-18); g.lineTo(cx,cy+R+18); g.stroke();

    // circle
    g.strokeStyle=ink3; g.lineWidth=1.6; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke();

    const px = cx + Math.cos(theta)*R, py = cy - Math.sin(theta)*R;

    // triangle legs: cosine (floor) + sine (rise)
    if(showTri){
      g.lineWidth=3;
      g.strokeStyle=cyan; g.beginPath(); g.moveTo(cx,cy); g.lineTo(px,cy); g.stroke();
      g.strokeStyle=accent; g.beginPath(); g.moveTo(px,cy); g.lineTo(px,py); g.stroke();
      g.font='600 15px "JetBrains Mono", monospace';
      g.fillStyle=accent; g.textAlign='left'; g.textBaseline='middle';
      g.fillText('sin θ', px + (px>=cx?8:-46), (cy+py)/2);
      g.fillStyle=cyan; g.textAlign='center'; g.textBaseline= (Math.sin(theta)>=0?'top':'bottom');
      g.fillText('cos θ', (cx+px)/2, cy + (Math.sin(theta)>=0?6:-6));
    }

    // radius
    g.strokeStyle=ink; g.lineWidth=2; g.beginPath(); g.moveTo(cx,cy); g.lineTo(px,py); g.stroke();

    // tie line: circle height → start of wave
    g.strokeStyle=accent; g.lineWidth=1; g.setLineDash([4,4]); g.globalAlpha=0.55;
    g.beginPath(); g.moveTo(px,py); g.lineTo(waveX0,py); g.stroke();
    g.setLineDash([]); g.globalAlpha=1;

    // cosine wave (optional)
    if(showCos){
      g.strokeStyle=cyan; g.lineWidth=2.4; g.shadowColor=cyan; g.shadowBlur=5; g.beginPath();
      for(let i=0;i<=WW;i++){ const a=theta-(i/WW)*SPAN; const x=waveX0+i, y=cy-Math.cos(a)*R; i?g.lineTo(x,y):g.moveTo(x,y); }
      g.stroke(); g.shadowBlur=0;
    }
    // sine wave
    g.strokeStyle=accent; g.lineWidth=2.8; g.shadowColor=accent; g.shadowBlur=7; g.beginPath();
    for(let i=0;i<=WW;i++){ const a=theta-(i/WW)*SPAN; const x=waveX0+i, y=cy-Math.sin(a)*R; i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke(); g.shadowBlur=0;

    // dots
    g.fillStyle=accent; g.beginPath(); g.arc(px,py,5,0,Math.PI*2); g.fill();
    g.beginPath(); g.arc(waveX0, cy-Math.sin(theta)*R, 4,0,Math.PI*2); g.fill();

    // plain label so it's clear what the wave is
    g.fillStyle=ink3; g.font='600 14px "JetBrains Mono", monospace'; g.textAlign='left'; g.textBaseline='top';
    g.fillText("the dot's height, drawn left to right as time passes", waveX0+8, 12);

    oTheta.textContent = fmtAngle(theta);
    oSin.textContent = Math.sin(theta).toFixed(3);
    oCos.textContent = Math.cos(theta).toFixed(3);
  }

  function loop(ts){
    if(!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts-lastTs)/1000); lastTs = ts;
    if(playing){
      theta += dt * (+speedSld.value/100) * 2 * Math.PI * 0.32;
      thetaSld.value = Math.round((((theta*180/Math.PI)%360)+360)%360);
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function setPlay(p){
    playing = p;
    playBtn.classList.toggle('on', p);
    playBtn.querySelector('.lbl').textContent = p ? 'Pause' : 'Spin it';
  }

  playBtn.addEventListener('click', ()=> setPlay(!playing));
  thetaSld.addEventListener('input', e=>{ theta = (+e.target.value)*Math.PI/180; if(!playing) draw(); });
  speedSld.addEventListener('input', ()=>{});
  cosTog.addEventListener('click', ()=>{ showCos=!showCos; cosTog.classList.toggle('on',showCos); if(!playing) draw(); });
  triTog.addEventListener('click', ()=>{ showTri=!showTri; triTog.classList.toggle('on',showTri); if(!playing) draw(); });
  radTog.addEventListener('click', ()=>{ useRad=!useRad; radTog.classList.toggle('on',useRad); if(!playing) draw(); });
  if(hearBtn) hearBtn.addEventListener('click', ()=> Lab.pluck(220, { gains:[1], dur:1.6, vol:0.28 }));

  cosTog.classList.toggle('on', showCos);
  triTog.classList.toggle('on', showTri);
  draw();
  raf = requestAnimationFrame(loop);
})();
