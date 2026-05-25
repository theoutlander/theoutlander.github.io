const N=1,E=2,S=4,W=8,DR={N:[-1,0],E:[0,1],S:[1,0],W:[0,-1]},OPP={[N]:S,[E]:W,[S]:N,[W]:E},DIRS=[N,E,S,W];
const MASKS={
  I:[E|W,N|S,E|W,N|S],
  L:[E|S,S|W,W|N,N|E],
  T:[E|S|W,S|W|N,W|N|E,N|E|S],
  B:[E|W,N|S,E|W,N|S],
  V:[E|W,N|S,E|W,N|S],
  S:[E,S,W,N],
  G:[W,N,E,S],
};

function parseCell(code){
  if(!code||code==='.')return null;
  if(code==='#')return{type:'#',fixed:true};
  const sprinkler=code[0]==='g';
  const type=sprinkler?'G':code[0];
  let color=null,rotIdx=1;
  if(code.length>=3&&/[bry]/.test(code[1])){color=code[1];rotIdx=2;}
  const rot=+code[rotIdx];
  const cell={type,rot:isNaN(rot)?0:rot,color,fixed:type==='S'||(type==='G'&&!sprinkler),sprinkler};
  if(type==='V')cell.open=false;
  if(type==='B')cell.touched=false;
  return cell;
}

function cloneGrid(g){return g.map((row)=>row.map((c)=>(c?{...c}:null)));}
function maskFor(cell){
  if(!cell||cell.type==='#')return 0;
  if(cell.type==='B'&&!cell.touched)return 0;
  if(cell.type==='V'&&!cell.open)return 0;
  const m=MASKS[cell.type];
  if(!m)return 0;
  return m[cell.rot%4];
}

function goalWateredAt(r,c,cell,gridRows,filledSet,colorMap){
  const grid=gridRows;
  const need=cell.color||'b';
  const k=r+','+c;
  if(filledSet.has(k)){
    const cols=colorMap.get(k);
    if(cols&&(cols.has(need)||(!cell.color&&cols.size>0)))return true;
  }
  if(!cell.sprinkler)return false;
  for(const d of DIRS){
    const dk=d===N?'N':d===E?'E':d===S?'S':'W';
    const nr=r+DR[dk][0],nc=c+DR[dk][1];
    const nb=grid[nr]?.[nc];
    if(!nb||nb.type==='#'||(nb.type==='G'&&!nb.sprinkler))continue;
    const nk=nr+','+nc;
    if(!filledSet.has(nk))continue;
    const cols=colorMap.get(nk);
    if(cols&&(cols.has(need)||(!cell.color&&cols.size>0)))return true;
  }
  return false;
}

function computeFlow(grid){
  const rows=grid.length;
  const cols=Math.max(...grid.map((r)=>r.length));
  const nextFilled=new Set();
  const nextColors=new Map();
  const sources=[];
  const goals=[];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell=grid[r]?.[c];
      if(cell?.type==='S')sources.push({r,c,color:cell.color||'b'});
      if(cell?.type==='G')goals.push({r,c});
    }
  }
  if(!sources.length||!goals.length)return false;
  const q=[];
  sources.forEach((src)=>{
    const sk=src.r+','+src.c;
    nextFilled.add(sk);
    nextColors.set(sk,new Set([src.color||'b']));
    q.push([src.r,src.c]);
  });
  while(q.length){
    const [r,c]=q.shift();
    const ck=r+','+c;
    const m=maskFor(grid[r][c]);
    const curColors=nextColors.get(ck);
    for(const d of DIRS){
      if(!(m&d))continue;
      const dk=d===N?'N':d===E?'E':d===S?'S':'W';
      const nr=r+DR[dk][0],nc=c+DR[dk][1];
      const nb=grid[nr]?.[nc];
      if(!nb||nb.type==='#')continue;
      if(!(maskFor(nb)&OPP[d]))continue;
      const nk=nr+','+nc;
      if(!nextFilled.has(nk)){
        nextFilled.add(nk);
        nextColors.set(nk,new Set(curColors));
        q.push([nr,nc]);
      }else{
        curColors.forEach((cl)=>nextColors.get(nk).add(cl));
      }
    }
  }
  let watered=0;
  goals.forEach((g)=>{
    const cell=grid[g.r][g.c];
    if(goalWateredAt(g.r,g.c,cell,grid,nextFilled,nextColors)) watered++;
  });
  return watered===goals.length;
}

function gridKey(g){
  return g
    .map((row)=>row.map((c)=>{
      if(!c)return '.';
      let s=c.type+(c.rot??0);
      if(c.color)s=c.type+c.color+(c.rot??0);
      if(c.sprinkler)s='g'+(c.rot??0);
      if(c.open)s+='o';
      if(c.touched)s+='t';
      return s;
    }).join(','))
    .join('/');
}

function minMoves(rows,maxD=14){
  const start=rows.map((r)=>r.trim().split(/\s+/).map(parseCell));
  if(computeFlow(start))return 0;
  const R=start.length;
  const C=Math.max(...start.map((r)=>r.length));
  const q=[[start,0]];
  const seen=new Set([gridKey(start)]);
  while(q.length){
    const [g,d]=q.shift();
    if(d>=maxD)continue;
    for(let r=0;r<R;r++){
      for(let c=0;c<C;c++){
        const cell=g[r]?.[c];
        if(!cell||cell.fixed||cell.type==='#')continue;
        if(cell.type==='V'){
          for(const open of [false,true]){
            const ng=cloneGrid(g);
            ng[r][c].open=open;
            const k=gridKey(ng);
            if(seen.has(k))continue;
            seen.add(k);
            if(computeFlow(ng))return d+1;
            q.push([ng,d+1]);
          }
        }
        const max=cell.type==='X'?1:4;
        for(let t=1;t<max;t++){
          const ng=cloneGrid(g);
          ng[r][c].rot=(cell.rot+t)%max;
          if(ng[r][c].type==='B')ng[r][c].touched=true;
          const k=gridKey(ng);
          if(seen.has(k))continue;
          seen.add(k);
          if(computeFlow(ng))return d+1;
          q.push([ng,d+1]);
        }
      }
    }
  }
  return null;
}

const LEVELS=[
  {name:'Two Gardens',par:2,rows:['S0 I1 I0 G0','.  .  g0 .']},
  {name:'Rocky Path',par:2,rows:['S0 I1 L0','#  .  G1']},
  {name:'Fix the Leaks',par:2,rows:['S0 B1 I0 B1 G0']},
  {name:'Valve Control',par:3,rows:['S0 I1 V0 I1 G0']},
  {name:'Rainbow Hose',par:2,rows:['Sb0 I1 Gb0','Sr0 I1 Gr0']},
  {name:'Rush Hour',par:3,rows:['S0 I1 L0 .','.  I1 L3 G0']},
  {name:'End of the World',par:4,rows:['S0 I1 T1 I1 G0','#  I0 B1 g0','.  V0 L1 .']},
  {name:'Secret Garden',par:2,rows:['S0 I1 I0 G0','.  .  g0  .']},
];

for(let i=0;i<LEVELS.length;i++){
  const lv=LEVELS[i];
  const m=minMoves(lv.rows);
  const ok=m!==null&&m<=lv.par;
  console.log((16+i)+'.',lv.name,'par',lv.par,'min',m===null?'FAIL':m,ok?'ok':'BAD');
}

if(process.argv[2]==='search'){
  console.log('\n--- rocky ---');
  const tops=['S0 I0 L0','S0 I1 L0','S0 I2 L0','S0 I3 L0','S0 L0 I0','S0 I0 I0','S0 L2 I1','S0 I2 L2'];
  const bots=['#  .  G1','#  L1 G0','#  I1 G0','#  L1 G1','#  .  G0','#  I1 G1','#  L1 G1'];
  for(const top of tops){
    for(const bot of bots){
      const rows=[top,bot];
      const m=minMoves(rows);
      if(m!==null&&m>=2&&m<=3)console.log(m,rows.join(' | '));
    }
  }
  console.log('\n--- rainbow ---');
  for(let ir=0;ir<4;ir++){
    const rows=['Sb0 I'+ir+' Gb0','Sr0 I'+ir+' Gr0'];
    const m=minMoves(rows);
    if(m!==null)console.log('3-wide',m,rows.join(' | '));
  }
}
