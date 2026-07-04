/* ===== Build On — friendly monsters (mobs that chase, bite & get bonked) ===== */
(function(){
  var BO = window.BO = window.BO || {};
  var B  = window.BABYLON;
  var scene=null;
  var mobs=[], active=false, bopped=0, target=3, spawnTimer=0, hooked=false, lastTick=0;
  var opts={ onBite:function(){}, canBite:function(){return true;}, onDefeat:function(){}, onChange:function(){} };

  var COLORS=['#7bd86b','#ff8fce','#8f9bff','#ffd24d','#67e0d0','#ff9a6b','#c78bff'];
  var HOVER=0.55, CHASE=1.75, LUNGE=5.4, BITE_R=1.35, BITE_CD=1.6;

  function rs(a,b){ return a+Math.random()*(b-a); }

  /* ---- collision with placed blocks (walls block mobs; STEP lets them ignore tiny bumps) ---- */
  var STEP=0.62;
  function groundAt(x,z){ return (BO.scene.floorAt? BO.scene.floorAt(x,z) : 0); }
  function blockedAt(m,ax,az){ return (groundAt(ax,az) - m._gy) > STEP; }
  function moveMob(m,dx,dz){
    var x=m.root.position.x, z=m.root.position.z, nx=x+dx, nz=z+dz;
    var okX=!blockedAt(m,nx,z), okZ=!blockedAt(m,x,nz);
    if(dx&&dz){
      // diagonal only if the target cell AND both side cells are open (no squeezing through wall corners)
      if(okX&&okZ&&!blockedAt(m,nx,nz)){ x=nx; z=nz; }
      else if(okX){ x=nx; }                   // slide along a wall
      else if(okZ){ z=nz; }
    } else {
      if(okX) x=nx;
      if(okZ) z=nz;
    }
    m.root.position.x=x; m.root.position.z=z;
  }
  /* ---- steering: head toward a target, going AROUND walls at full speed (no crawling/sticking) ---- */
  var ROAM=1.15, STEER=[0,0.5,-0.5,1.0,-1.0,1.7,-1.7];
  function tryStep(m,ang,dist){
    var x=m.root.position.x, z=m.root.position.z, nx=x+Math.sin(ang)*dist, nz=z+Math.cos(ang)*dist;
    if(blockedAt(m,nx,nz)) return false;
    if(blockedAt(m,nx,z) && blockedAt(m,x,nz)) return false;   // don't squeeze through a wall corner
    m.root.position.x=nx; m.root.position.z=nz; return true;
  }
  function steerTo(m,ux,uz,dist){
    var base=Math.atan2(ux,uz);
    for(var i=0;i<STEER.length;i++){ var a=base+STEER[i]; if(tryStep(m,a,dist)){ m.root.rotation.y=a; return true; } }
    return false;
  }
  function pickRoam(m){ m.rx=rs(-(BO.HALF-1),BO.HALF-1); m.rz=rs(-(BO.HALF-1),BO.HALF-1); m.roamT=rs(2.5,5.5); }
  function mkMat(hex){
    var m=new B.StandardMaterial('mobm',scene); var c=B.Color3.FromHexString(hex);
    m.diffuseColor=c; m.emissiveColor=c.scale(0.14); m.specularColor=new B.Color3(0.2,0.2,0.22); m.specularPower=32; return m;
  }
  var _white,_dark;
  function whiteMat(){ if(!_white){ _white=new B.StandardMaterial('mobeye',scene); _white.diffuseColor=new B.Color3(1,1,1); _white.emissiveColor=new B.Color3(0.55,0.55,0.55); } return _white; }
  function darkMat(){ if(!_dark){ _dark=new B.StandardMaterial('mobdk',scene); _dark.diffuseColor=new B.Color3(0.08,0.06,0.12); _dark.specularColor=new B.Color3(0.3,0.3,0.3); } return _dark; }

  /* ---------- build one monster ---------- */
  function makeMob(){
    if(!scene) return null;
    var root=new B.TransformNode('mob',scene);
    var body=B.MeshBuilder.CreateSphere('mobbody',{diameter:0.92,segments:12},scene);
    body.scaling.set(1,0.86,1); body.material=mkMat(COLORS[(Math.random()*COLORS.length)|0]);
    body.parent=root; body.isPickable=true; body.metadata={mob:null};
    if(BO.scene.addShadow) BO.scene.addShadow(body);
    // two little horns so it reads as a "monster"
    [-0.26,0.26].forEach(function(hx){
      var horn=B.MeshBuilder.CreateCylinder('horn',{diameterTop:0,diameterBottom:0.14,height:0.26,tessellation:6},scene);
      horn.material=body.material; horn.position.set(hx,0.42,0.02); horn.rotation.z=hx>0?-0.3:0.3; horn.parent=root; horn.isPickable=true;
    });
    // googly eyes (parented so they face the player as the body turns)
    [-0.17,0.17].forEach(function(ex){
      var w=B.MeshBuilder.CreateSphere('eye',{diameter:0.3,segments:10},scene); w.material=whiteMat(); w.position.set(ex,0.15,0.3); w.parent=root; w.isPickable=true;
      var p=B.MeshBuilder.CreateSphere('pupil',{diameter:0.15,segments:8},scene); p.material=darkMat(); p.position.set(ex,0.13,0.42); p.parent=root; p.isPickable=true;
    });
    var mouth=B.MeshBuilder.CreateSphere('mouth',{diameter:0.28,segments:10},scene);
    mouth.material=darkMat(); mouth.scaling.set(1,0.32,0.55); mouth.position.set(0,-0.17,0.33); mouth.parent=root; mouth.isPickable=true;

    var m={ root:root, body:body, mouth:mouth, hp:2, st:'spawn', t:0.4, cd:rs(0.3,0.9), vx:0, vz:0, bob:rs(0,6.28), applied:false, dead:false, trapT:0, _gy:0, roamT:0, rx:undefined, rz:0 };
    body.metadata.mob=m; root.metadata={mob:m};
    // spawn on the yard perimeter and walk in
    var H=BO.HALF+1.6, a=rs(-BO.HALF,BO.HALF), edge=(Math.random()*4)|0, sx,sz;
    if(edge===0){ sx=-H; sz=a; } else if(edge===1){ sx=H; sz=a; } else if(edge===2){ sx=a; sz=-H; } else { sx=a; sz=H; }
    root.position.set(sx, BO.scene.floorAt(sx,sz)+HOVER, sz);
    root.scaling.setAll(0.02);
    mobs.push(m);
    return m;
  }

  function disposeMob(m){
    if(BO.scene.rmShadow) BO.scene.rmShadow(m.body);
    m.root.getChildMeshes(false).forEach(function(c){ c.dispose(); });
    m.root.dispose();
  }

  /* ---------- particles ---------- */
  function poof(base){
    for(var i=0;i<9;i++){ (function(){
      var r=Math.random(); var ch = r<0.4?'\u2b50' : (r<0.7?'\ud83d\udca5':'\ud83d\udc97');
      var s=BO.scene.makeEmojiPlane(ch,0.4,'ALL');
      s.position=base.add(new B.Vector3(rs(-0.5,0.5),rs(0.15,0.7),rs(-0.5,0.5)));
      var vx=rs(-1.1,1.1), vy=rs(1.5,2.6), vz=rs(-1.1,1.1), t0=performance.now(), lastN=t0, dur=640+Math.random()*360;
      var ob=scene.onBeforeRenderObservable.add(function(){
        var nn=performance.now(), k=(nn-t0)/dur; if(k>=1||s.isDisposed()){ if(!s.isDisposed()) s.dispose(); scene.onBeforeRenderObservable.remove(ob); return; }
        var dt=Math.min((nn-lastN)/1000,0.05); lastN=nn; s.position.x+=vx*dt; s.position.y+=vy*dt; s.position.z+=vz*dt; vy-=3.2*dt; s.scaling.setAll(1-0.4*k); s.visibility=1-k;
      });
    })(); }
  }
  function dizzy(base){
    for(var i=0;i<3;i++){ (function(n){
      var s=BO.scene.makeEmojiPlane('\ud83d\udcab',0.3,'ALL'); var t0=performance.now(), dur=680;
      var ob=scene.onBeforeRenderObservable.add(function(){
        var k=(performance.now()-t0)/dur; if(k>=1||s.isDisposed()){ if(!s.isDisposed()) s.dispose(); scene.onBeforeRenderObservable.remove(ob); return; }
        var a=k*6.28+n*2.1; s.position.set(base.x+Math.cos(a)*0.32, base.y+0.55+k*0.22, base.z+Math.sin(a)*0.32); s.visibility=1-k;
      });
    })(i); }
  }

  /* ---------- combat ---------- */
  function kill(m){
    if(m.dead) return; m.dead=true;
    var i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1);
    poof(m.root.getAbsolutePosition().clone());
    disposeMob(m);
    bopped++; BO.sfx.poofMob(); opts.onDefeat(bopped,'bonk');
    target=Math.min(6, 3+Math.floor(bopped/8));           // gentle escalation
    if(active) spawnTimer=Math.max(spawnTimer, rs(1.9,2.9)); // trickle a replacement
  }
  function trapPoof(m){
    if(m.dead) return; m.dead=true;
    var i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1);
    poof(m.root.getAbsolutePosition().clone());
    disposeMob(m);
    bopped++; BO.sfx.poofMob(); opts.onDefeat(bopped,'trap');
    target=Math.min(6, 3+Math.floor(bopped/8));
  }
  function hit(m){
    if(!m||m.dead) return true;
    m.hp--;
    if(m.hp<=0){ kill(m); return true; }
    var P=BO.scene.getPlayerPos(); var dx=m.root.position.x-P.x, dz=m.root.position.z-P.z, d=Math.hypot(dx,dz)||1;
    m.vx=dx/d*7.5; m.vz=dz/d*7.5; m.st='hit'; m.t=0.5; m.cd=Math.max(m.cd,0.7);
    BO.sfx.bonk(); dizzy(m.root.getAbsolutePosition());
    return true;
  }
  function bonkFront(){
    if(!active || !mobs.length){ BO.sfx.bonk(); return false; }
    var P=BO.scene.getPlayerPos(), best=null, bd=99;
    for(var i=0;i<mobs.length;i++){ var m=mobs[i]; if(m.dead) continue; var d=Math.hypot(m.root.position.x-P.x, m.root.position.z-P.z); if(d<bd){ bd=d; best=m; } }
    if(best && bd<3.4){ hit(best); return true; }
    BO.sfx.bonk(); return false;
  }

  /* ---------- per-frame AI ---------- */
  function tick(){
    if(!active || !scene) return;
    var now=performance.now(); var dt=lastTick?Math.min((now-lastTick)/1000,0.05):0; lastTick=now;
    var P=BO.scene.getPlayerPos(), walking=BO.scene.isWalking(), lim=BO.HALF+4;
    for(var i=mobs.length-1;i>=0;i--){
      var m=mobs[i]; if(m.dead) continue;
      var x=m.root.position.x, z=m.root.position.z;
      m._gy=groundAt(x,z);
      var dx=P.x-x, dz=P.z-z, d=Math.hypot(dx,dz)||1e-4, ux=dx/d, uz=dz/d;
      m.bob+=dt*4.4;
      if(m.st==='spawn'){
        m.t-=dt; m.root.scaling.setAll(0.02+0.98*Math.min(1,1-Math.max(0,m.t)/0.4));
        if(m.t<=0){ m.st='chase'; m.root.scaling.setAll(1); }
      } else if(m.st==='hit'){
        m.t-=dt; moveMob(m, m.vx*dt, m.vz*dt); m.vx*=0.86; m.vz*=0.86;
        m.body.scaling.set(1.18,0.58,1.18);
        if(m.t<=0){ m.st='chase'; m.body.scaling.set(1,0.86,1); }
      } else if(m.st==='bite'){
        m.t-=dt; m.root.rotation.y=Math.atan2(ux,uz); moveMob(m, ux*LUNGE*dt, uz*LUNGE*dt);
        var kk=1-Math.max(0,m.t)/0.42;
        m.mouth.scaling.set(1, 0.32+Math.sin(kk*Math.PI)*1.15, 0.55);
        if(!m.applied && kk>0.42){ m.applied=true; if(walking && opts.canBite()){ opts.onBite(); BO.sfx.bite(); BO.scene.knockbackPlayer(ux,uz,0.95); } }
        if(m.t<=0){ m.st='chase'; m.cd=BITE_CD; m.applied=false; m.mouth.scaling.set(1,0.32,0.55); }
      } else { // chase the player in Walk mode — otherwise roam around the island
        var wob=Math.sin(m.bob)*0.06; m.body.scaling.set(1-wob,0.86+wob,1-wob);
        if(walking){
          m.cd-=dt;
          if(d<BITE_R && m.cd<=0 && opts.canBite()){ m.st='bite'; m.t=0.42; m.applied=false; m.root.rotation.y=Math.atan2(ux,uz); }
          else if(d>0.9){ steerTo(m,ux,uz,CHASE*dt); }
          else { m.root.rotation.y=Math.atan2(ux,uz); }
        } else {
          m.roamT-=dt;
          if(m.roamT<=0 || m.rx===undefined) pickRoam(m);
          var rdx=m.rx-x, rdz=m.rz-z, rd=Math.hypot(rdx,rdz)||1e-4;
          if(rd>0.7){ if(!steerTo(m, rdx/rd, rdz/rd, ROAM*dt)) pickRoam(m); } else pickRoam(m);
        }
        // walled in on all 4 sides? it's trapped — gives up & poofs (reward for building a pen)
        if(blockedAt(m,x+1,z)&&blockedAt(m,x-1,z)&&blockedAt(m,x,z+1)&&blockedAt(m,x,z-1)){
          m.trapT+=dt; m.body.scaling.set(1.08,0.9,1.08);
          if(m.trapT>2.0){ trapPoof(m); continue; }
        } else { m.trapT=0; }
      }
      x=Math.max(-lim,Math.min(lim,m.root.position.x)); z=Math.max(-lim,Math.min(lim,m.root.position.z));
      m.root.position.set(x, m._gy+HOVER+Math.sin(m.bob)*0.08, z);
    }
    spawnTimer-=dt;
    if(spawnTimer<=0 && mobs.length<target){ makeMob(); spawnTimer=rs(0.6,1.5); }
  }
  function ensureHook(){ if(hooked) return; scene=BO.scene.getScene(); if(scene){ scene.onBeforeRenderObservable.add(tick); hooked=true; } }

  /* ---------- lifecycle ---------- */
  function clearAll(){
    var arr=mobs.slice(); mobs.length=0;
    arr.forEach(function(m){ if(!m.dead){ m.dead=true; poof(m.root.getAbsolutePosition().clone()); disposeMob(m); } });
  }
  function setActive(on){
    on=!!on; if(on===active) return;
    active=on;
    if(on){ ensureHook(); lastTick=0; spawnTimer=0; target=Math.min(6,3+Math.floor(bopped/8)); makeMob(); makeMob(); BO.sfx.monstersOn(); }
    else { clearAll(); BO.sfx.monstersOff(); }
    opts.onChange(active);
  }

  BO.mobs = {
    init:function(o){ o=o||{}; for(var k in o) opts[k]=o[k]; scene=BO.scene.getScene(); },
    setActive:setActive,
    toggle:function(){ setActive(!active); },
    isActive:function(){ return active; },
    count:function(){ return mobs.length; },
    bopped:function(){ return bopped; },
    hit:hit,
    bonkFront:bonkFront,
    reset:function(){ clearAll(); if(active){ active=false; opts.onChange(false); } }
  };
})();
