const N=1,E=2,S=4,W=8,DR={N:[-1,0],E:[0,1],S:[1,0],W:[0,-1]},OPP={[N]:S,[E]:W,[S]:N,[W]:E},DIRS=[N,E,S,W];
const MASKS={I:[E|W,N|S,E|W,N|S],L:[E|S,S|W,W|N,N|E],T:[E|S|W,S|W|N,W|N|E,N|E|S],S:[E,S,W,N],G:[W,N,E,S]};
function parseRows(rows){return rows.map(r=>r.trim().split(/\s+/).map(s=>s==='.'?null:{type:s[0],rot:+s[1],fixed:s[0]==='S'||s[0]==='G'}));}
function mask(c){return MASKS[c.type][c.rot%4];}
function flow(grid){
  const R=grid.length,C=Math.max(...grid.map(r=>r.length)),filled=new Set();let src;
  for(let r=0;r<R;r++){for(let c=0;c<C;c++){if(grid[r]?.[c]?.type==='S'){src=[r,c];break;}}if(src)break;}
  if(!src)return false;const st=[src];filled.add(src.join());
  while(st.length){const [r,c]=st.pop(),m=mask(grid[r][c]);
    for(const d of DIRS){if(!(m&d))continue;const k=d===N?'N':d===E?'E':d===S?'S':'W';
      const nr=r+DR[k][0],nc=c+DR[k][1];const nb=grid[nr]?.[nc];if(!nb||!(mask(nb)&OPP[d]))continue;
      const key=nr+','+nc;if(filled.has(key))continue;filled.add(key);st.push([nr,nc]);}}
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(grid[r]?.[c]?.type==='G'&&filled.has(r+','+c))return true;return false;
}
function clone(g){return g.map(r=>r.map(c=>c?{...c}:null));}
function minMoves(rows){
  const start=parseRows(rows); if(flow(start))return 0;
  const R=start.length,C=Math.max(...start.map(r=>r.length));
  function key(g){return g.map(r=>r.map(c=>c?c.type+c.rot:'').join('|')).join('/');}
  const q=[[start,0]],seen=new Set([key(start)]);
  while(q.length){const [g,d]=q.shift(); if(d>14)continue;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const cell=g[r]?.[c]; if(!cell||cell.fixed)continue;
      for(let t=1;t<4;t++){const ng=clone(g); ng[r][c].rot=(cell.rot+t)%4; const k=key(ng); if(seen.has(k))continue; seen.add(k);
        if(flow(ng))return d+1; q.push([ng,d+1]);}}}
  return null;
}

const LEVELS=[
  {name:'First Drop',par:1,rows:['S0 I2 I1 G0']},
  {name:'Quick Turn',par:1,rows:['S0 I0 L2 .','.  .  L3 G0']},
  {name:'Down the Garden',par:2,rows:['S0 I1 L0 .','.  I2 L3 G0']},
  {name:'Long Hose',par:2,rows:['S0 I1 I0 L0','.  .  .  G1']},
  {name:'T Junction',par:2,rows:['S0 I1 T1 I0 G0']},
  {name:'Garden Gate',par:2,rows:['.  S0 I0 L0 .','.  .  .  L1 G0']},
  {name:'Double Bend',par:3,rows:['S0 L2 I1 .','.  L1 I1 G0']},
  {name:'Fork in the Path',par:3,rows:['.  .  S0 I1 T3 I1 .','.  .  .  .  L2 G0','.  .  .  .  .  .','.  .  .  .  .  .']},
  {name:'Plumber Puzzle',par:3,rows:['.  .  S0 I3 T2 I0 .','.  .  .  .  I0 L0 G0','.  .  .  .  .  .  .','.  .  .  .  .  .  .']},
  {name:'Snake Path',par:3,rows:['.  S0 I3 L2 I0 L3 .','.  .  .  L1 G0 .','.  .  .  .  .  .','.  .  .  .  .  .']},
  {name:'Twisty Turn',par:3,rows:['.  S0 I2 L0 I1 L0 .','.  .  I0 L2 I1 G0 .','.  .  .  .  .  .  .','.  .  .  .  .  .  .']},
  {name:'Greenhouse',par:4,rows:['.  .  S0 I1 T3 I1 .','.  .  .  I0 L2 I1 G0','.  .  .  .  .  .  .','.  .  .  .  .  .  .','.  .  .  .  .  .  .']},
  {name:'Long Detour',par:4,rows:['.  .  S0 I3 L0 I2 L0 .','.  .  .  I0 L2 I3 G0 .','.  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .']},
  {name:'Pipe Maze',par:4,rows:['.  .  S0 I1 T3 I1 .  .','.  .  .  I0 L2 I1 G0 .','.  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .']},
  {name:'Master Plumber',par:4,rows:['.  .  .  S0 I3 L0 I2 L0 .','.  .  .  .  I0 L2 I3 G0 .','.  .  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .  .','.  .  .  .  .  .  .  .  .']},
];

let prev=0;
for(let i=0;i<LEVELS.length;i++){
  const lv=LEVELS[i];
  const m=minMoves(lv.rows);
  const ramp=m!==null&&m>=prev?'ok':'BAD';
  const parOk=m!==null&&m<=lv.par;
  console.log((i+1)+'.',lv.name,'par',lv.par,'min',m===null?'FAIL':m,ramp,parOk?'ok':'over-par');
  if(m!==null)prev=Math.max(prev,m);
}
