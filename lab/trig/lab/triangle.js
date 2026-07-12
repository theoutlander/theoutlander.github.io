/* Steps 2–5 figure: a right triangle, reused with a different FOCUS each time.
   data-triangle = "sides" | "sine" | "cosine" | "tan" decides what's highlighted. */
(function(){
  document.querySelectorAll('[data-triangle]').forEach(init);

  function init(root){
    const focus = root.getAttribute('data-triangle');
    const cv  = root.querySelector('[data-canvas]'); if(!cv) return;
    const scope = root.closest('.step') || root;
    const aSld = root.querySelector('[data-angle]');
    const oVal = scope.querySelector('[data-val]');
    const oAng = scope.querySelector('[data-ang]');
    const g = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const A = { x: 108, y: H-60 };
    const HYP = Math.min(W-230, H-80);
    const V = n => Lab.cssVar(n);

    function lbl(t,x,y,c,al,ba){ g.fillStyle=c; g.font='600 14px "JetBrains Mono", monospace'; g.textAlign=al; g.textBaseline=ba; g.fillText(t,x,y); }

    function draw(){
      const deg=+aSld.value, th=deg*Math.PI/180;
      const accent=V('--accent'), cyan=V('--tok-key'), amber=V('--tok-str'), ink=V('--ink'), dim=V('--ink-3');
      const B={x:A.x+HYP*Math.cos(th), y:A.y};
      const C={x:B.x, y:A.y-HYP*Math.sin(th)};
      const hot={hyp:false,opp:false,adj:false};
      if(focus==='sides'){ hot.hyp=hot.opp=hot.adj=true; }
      else if(focus==='sine'){ hot.opp=hot.hyp=true; }
      else if(focus==='cosine'){ hot.adj=hot.hyp=true; }
      else if(focus==='tan'){ hot.opp=hot.adj=true; }

      g.clearRect(0,0,W,H); g.lineCap='round';
      // adjacent (cyan)
      g.lineWidth=hot.adj?4:2; g.globalAlpha=hot.adj?1:0.45; g.strokeStyle=hot.adj?cyan:dim;
      g.beginPath(); g.moveTo(A.x,A.y); g.lineTo(B.x,B.y); g.stroke();
      // opposite (accent)
      g.lineWidth=hot.opp?4:2; g.globalAlpha=hot.opp?1:0.45; g.strokeStyle=hot.opp?accent:dim;
      g.beginPath(); g.moveTo(B.x,B.y); g.lineTo(C.x,C.y); g.stroke();
      // hypotenuse (amber)
      g.lineWidth=hot.hyp?4:2; g.globalAlpha=hot.hyp?1:0.45; g.strokeStyle=hot.hyp?amber:dim;
      g.beginPath(); g.moveTo(A.x,A.y); g.lineTo(C.x,C.y); g.stroke();
      g.globalAlpha=1;

      // right-angle marker
      const s=13; g.strokeStyle=dim; g.lineWidth=1.4; g.strokeRect(B.x-s, B.y-s, s, s);
      // angle arc + θ
      g.strokeStyle=ink; g.lineWidth=1.6; g.beginPath(); g.arc(A.x,A.y,34,-th,0); g.stroke();
      lbl('θ', A.x+44, A.y-12, ink, 'left','bottom');

      // side labels with their actual lengths (the hypotenuse is our unit: length 1)
      const opp=Math.sin(th), adj=Math.cos(th);
      if(hot.adj) lbl('adjacent = '+adj.toFixed(2), (A.x+B.x)/2, A.y+12, cyan, 'center','top');
      if(hot.opp){ lbl('opposite = '+opp.toFixed(2), B.x+12, (B.y+C.y)/2, accent, 'left','middle'); }
      if(hot.hyp){ g.save(); g.translate((A.x+C.x)/2,(A.y+C.y)/2); g.rotate(-th); lbl('hypotenuse = 1',0,-8,amber,'center','bottom'); g.restore(); }

      [[A,ink],[B,dim],[C,dim]].forEach(([p,c])=>{ g.fillStyle=c; g.beginPath(); g.arc(p.x,p.y,4,0,7); g.fill(); });

      if(oAng) oAng.textContent = deg+'°';
      const oOpp=scope.querySelector('[data-opp]'), oAdj=scope.querySelector('[data-adj]'), oHyp=scope.querySelector('[data-hyp]');
      if(oOpp) oOpp.textContent = opp.toFixed(2);
      if(oAdj) oAdj.textContent = adj.toFixed(2);
      if(oHyp) oHyp.textContent = '1';
      if(oVal){
        const v = focus==='sine'?opp : focus==='cosine'?adj : focus==='tan'?Math.tan(th) : 0;
        oVal.textContent = v.toFixed(2);
      }
    }

    aSld.addEventListener('input', draw);
    draw();
  }
})();
