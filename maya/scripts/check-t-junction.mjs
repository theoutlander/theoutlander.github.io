const N=1,E=2,S=4,W=8,DR={N:[-1,0],E:[0,1],S:[1,0],W:[0,-1]},OPP={[N]:S,[E]:W,[S]:N,[W]:E},DIRS=[N,E,S,W];
const MASKS={I:[E|W,N|S,E|W,N|S],L:[E|S,S|W,W|N,N|E],T:[E|S|W,S|W|N,W|N|E,N|E|S],S:[E,W,S,N],G:[W,N,E,S],K:[N,E,S,W]};
function parseRows(rows){return rows.map(r=>r.trim().split(/\s+/).map(s=>s==='.'?null:{type:s[0],rot:+s[1],fixed:s[0]==='S'||s[0]==='G'||s[0]==='K'}));}
function mask(c){return MASKS[c.type][c.rot%4];}
function getFilled(g){
  const R=g.length,C=Math.max(...g.map(r=>r.length)),filled=new Set();
  let src;for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(g[r]?.[c]?.type==='S'){src=[r,c];break;}
  const st=[src];filled.add(src.join());
  while(st.length){const [r,c]=st.pop(),m=mask(g[r][c]);
    for(const d of DIRS){if(!(m&d))continue;const k=d===N?'N':d===E?'E':d===S?'S':'W';
      const nr=r+DR[k][0],nc=c+DR[k][1];const nb=g[nr]?.[nc];if(!nb||!(mask(nb)&OPP[d]))continue;
      const key=nr+','+nc;if(filled.has(key))continue;filled.add(key);st.push([nr,nc]);}}
  return filled;
}
function leaks(g,f){
  const R=g.length,C=Math.max(...g.map(r=>r.length)),out=[];
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){
    const cell=g[r]?.[c];if(!cell||!f.has(r+','+c))continue;const m=mask(cell);
    for(const d of DIRS){if(!(m&d))continue;const k=d===N?'N':d===E?'E':d===S?'S':'W';
      const nr=r+DR[k][0],nc=c+DR[k][1];const nb=g[nr]?.[nc];
      if(nr<0||nc<0||nr>=R||nc>=C)out.push('edge');
      else if(!nb)out.push('soak');
      else if(!(mask(nb)&OPP[d]))out.push('gap');
      else if(!f.has(nr+','+nc))out.push('gap');
    }
  }
  return out;
}
function allParts(g,f){
  for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(g[r]?.[c]&&g[r][c].type!=='#'&&!f.has(r+','+c))return false;
  return true;
}
function circuitOk(g){const f=getFilled(g);return leaks(g,f).length===0&&allParts(g,f);}
function goalOk(g){const f=getFilled(g);if(!circuitOk(g))return false;return f.has('1,4')||f.has('0,4');}
function gk(g){return g.map(r=>r.map(c=>c?c.type+c.rot:'').join('|')).join('/');}
function clone(g){return g.map(r=>r.map(c=>c?{...c}:null));}
const start=parseRows(['.  .  K2 .  .','S0 I0 T2 I0 G0']);
console.log('start circuit',circuitOk(start),'goal',goalOk(start));
const seen=new Set([gk(start)]),q=[[start,0]],wins=[];
while(q.length){
  const [g,d]=q.shift();
  if(circuitOk(g)&&goalOk(g))wins.push({d,state:gk(g)});
  if(d>8)continue;
  for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++){
    const cell=g[r]?.[c];if(!cell||cell.fixed)continue;
    for(let t=1;t<4;t++){const ng=clone(g);ng[r][c].rot=(cell.rot+t)%4;const k=gk(ng);if(seen.has(k))continue;seen.add(k);q.push([ng,d+1]);}}
}
console.log('wins',wins.slice(0,5));
