/* ===== Build On — wildlife: cute animals that roam the island on their own ===== */
(function(){
  var BO = window.BO = window.BO || {};
  var B  = window.BABYLON;
  var scene=null, critters=[], active=false, hooked=false, lastTick=0, target=6;
  var opts={ onPet:function(){} };

  function rs(a,b){ return a+Math.random()*(b-a); }

  /* ---- shared steering (wander + go around walls, no sticking) ---- */
  var STEP=0.62, STEER=[0,0.6,-0.6,1.3,-1.3];
  function groundAt(x,z){ return (BO.scene.floorAt? BO.scene.floorAt(x,z) : 0); }
  function blockedAt(c,ax,az){ return (groundAt(ax,az) - c._gy) > STEP; }
  function tryStep(c,ang,dist){
    var x=c.root.position.x, z=c.root.position.z, nx=x+Math.sin(ang)*dist, nz=z+Math.cos(ang)*dist;
    if(blockedAt(c,nx,nz)) return false;
    if(blockedAt(c,nx,z) && blockedAt(c,x,nz)) return false;
    c.root.position.x=nx; c.root.position.z=nz; return true;
  }
  function steerTo(c,ux,uz,dist){ var base=Math.atan2(ux,uz); for(var i=0;i<STEER.length;i++){ var a=base+STEER[i]; if(tryStep(c,a,dist)){ c.root.rotation.y=a; return true; } } return false; }
  function pickRoam(c){ c.rx=rs(-(BO.HALF-2),BO.HALF-2); c.rz=rs(-(BO.HALF-2),BO.HALF-2); c.roamT=rs(3,6); c.st='walk'; }

  /* ---- materials & parts ---- */
  function M(hex,emis){ var m=new B.StandardMaterial('crm',scene); var c=B.Color3.FromHexString(hex); m.diffuseColor=c; m.emissiveColor=c.scale(emis||0.1); m.specularColor=new B.Color3(0.14,0.14,0.16); m.specularPower=32; return m; }
  var _dk=null; function darkMat(){ if(!_dk){ _dk=new B.StandardMaterial('crdk',scene); _dk.diffuseColor=new B.Color3(0.09,0.07,0.11); _dk.specularColor=new B.Color3(0.25,0.25,0.25); } return _dk; }
  function sphere(d,seg){ return B.MeshBuilder.CreateSphere('cr',{diameter:d,segments:seg||10},scene); }
  function eyes(root,ex,ey,ez,d){ [-ex,ex].forEach(function(x){ var e=sphere(d||0.06,6); e.material=darkMat(); e.parent=root; e.position.set(x,ey,ez); e.isPickable=false; }); }

  /* ---- critter builders (return a critter descriptor) ---- */
  function buildBunny(){
    var root=new B.TransformNode('critter',scene);
    var wm=M(['#f4f0ea','#efe3d2','#cfcfd6'][(Math.random()*3)|0],0.08), pink=M('#ff9db0',0.14);
    var body=sphere(0.5,10); body.scaling.set(0.9,0.82,1.05); body.material=wm; body.parent=root;
    var head=sphere(0.36,10); head.material=wm; head.parent=root; head.position.set(0,0.12,0.3);
    var ears=[]; [-0.09,0.09].forEach(function(ex){ var e=B.MeshBuilder.CreateBox('ear',{width:0.1,height:0.34,depth:0.05},scene); e.material=wm; e.parent=root; e.position.set(ex,0.42,0.28); e.rotation.x=-0.2; e.isPickable=false; ears.push(e); });
    var tail=sphere(0.16,8); tail.material=wm; tail.parent=root; tail.position.set(0,0.02,-0.32); tail.isPickable=false;
    var nose=sphere(0.07,6); nose.material=pink; nose.parent=root; nose.position.set(0,0.06,0.49); nose.isPickable=false;
    eyes(root,0.1,0.16,0.46);
    return { root:root, body:body, type:'bunny', ears:ears, baseY:0.28, speed:1.4, walk:'hop' };
  }
  function buildChick(){
    var root=new B.TransformNode('critter',scene);
    var ym=M('#ffd93d',0.14), om=M('#ff9f2e',0.15);
    var body=sphere(0.4,10); body.material=ym; body.parent=root;
    var head=sphere(0.28,10); head.material=ym; head.parent=root; head.position.set(0,0.24,0.16);
    var beak=B.MeshBuilder.CreateCylinder('beak',{diameterTop:0,diameterBottom:0.12,height:0.14,tessellation:6},scene); beak.material=om; beak.parent=root; beak.position.set(0,0.24,0.36); beak.rotation.x=Math.PI/2; beak.isPickable=false;
    var wings=[]; [-0.2,0.2].forEach(function(ex){ var w=sphere(0.22,8); w.scaling.set(0.42,0.82,1); w.material=ym; w.parent=root; w.position.set(ex,0.02,0); w.isPickable=false; wings.push(w); });
    [-0.08,0.08].forEach(function(ex){ var l=B.MeshBuilder.CreateCylinder('leg',{diameter:0.05,height:0.18,tessellation:5},scene); l.material=om; l.parent=root; l.position.set(ex,-0.24,0); l.isPickable=false; });
    eyes(root,0.09,0.28,0.28,0.05);
    return { root:root, body:body, type:'chick', head:head, wings:wings, baseY:0.3, speed:1.15, walk:'waddle' };
  }
  function buildCat(){
    var root=new B.TransformNode('critter',scene);
    var fm=M(['#e6913c','#9aa0aa','#6b5442','#2f2f33'][(Math.random()*4)|0],0.09);
    var body=sphere(0.5,10); body.scaling.set(0.68,0.62,1.25); body.material=fm; body.parent=root;
    var head=sphere(0.34,10); head.material=fm; head.parent=root; head.position.set(0,0.14,0.34);
    [-0.12,0.12].forEach(function(ex){ var e=B.MeshBuilder.CreateCylinder('ear',{diameterTop:0,diameterBottom:0.15,height:0.17,tessellation:4},scene); e.material=fm; e.parent=root; e.position.set(ex,0.34,0.34); e.isPickable=false; });
    var tailPiv=new B.TransformNode('ctp',scene); tailPiv.parent=root; tailPiv.position.set(0,0.05,-0.5);
    var tail=B.MeshBuilder.CreateCylinder('tail',{diameter:0.09,height:0.5,tessellation:6},scene); tail.material=fm; tail.parent=tailPiv; tail.position.y=0.18; tail.rotation.x=0.7; tail.isPickable=false;
    var legs=[]; [[-0.15,0.4],[0.15,0.4],[-0.15,-0.26],[0.15,-0.26]].forEach(function(p){ var l=B.MeshBuilder.CreateCylinder('leg',{diameter:0.1,height:0.26,tessellation:6},scene); l.material=fm; l.parent=root; l.position.set(p[0],-0.24,p[1]); l.isPickable=false; legs.push(l); });
    eyes(root,0.1,0.18,0.5,0.055);
    return { root:root, body:body, type:'cat', tailPiv:tailPiv, legs:legs, baseY:0.42, speed:1.5, walk:'stroll' };
  }
  function buildDuck(){
    var root=new B.TransformNode('critter',scene);
    var wm=M('#f2f4f8',0.1), om=M('#ffab2e',0.15);
    var body=sphere(0.46,10); body.scaling.set(0.95,0.82,1.2); body.material=wm; body.parent=root;
    var neck=sphere(0.2,8); neck.scaling.set(0.8,1.3,0.8); neck.material=wm; neck.parent=root; neck.position.set(0,0.24,0.26); neck.isPickable=false;
    var head=sphere(0.26,10); head.material=wm; head.parent=root; head.position.set(0,0.42,0.32);
    var beak=B.MeshBuilder.CreateBox('beak',{width:0.16,height:0.07,depth:0.2},scene); beak.material=om; beak.parent=root; beak.position.set(0,0.4,0.54); beak.isPickable=false;
    var tail=sphere(0.16,8); tail.scaling.set(1,0.7,1.2); tail.material=wm; tail.parent=root; tail.position.set(0,0.16,-0.36); tail.rotation.x=-0.4; tail.isPickable=false;
    eyes(root,0.1,0.46,0.5,0.05);
    return { root:root, body:body, type:'duck', baseY:0.32, speed:1.05, walk:'waddle' };
  }
  function buildButterfly(){
    var root=new B.TransformNode('critter',scene);
    var cols=['#ff6eb4','#5bc8ff','#ffd24d','#c77dff','#ff9a3c'], cm=M(cols[(Math.random()*cols.length)|0],0.26);
    var bod=B.MeshBuilder.CreateCylinder('bfb',{diameter:0.06,height:0.3,tessellation:6},scene); bod.material=darkMat(); bod.parent=root; bod.rotation.x=Math.PI/2;
    var wings=[]; [-1,1].forEach(function(s){ var wp=new B.TransformNode('wp',scene); wp.parent=root;
      var w=sphere(0.34,8); w.scaling.set(0.9,0.1,0.72); w.material=cm; w.parent=wp; w.position.set(s*0.22,0,0.04); w.isPickable=false;
      var w2=sphere(0.24,8); w2.scaling.set(0.72,0.1,0.6); w2.material=cm; w2.parent=wp; w2.position.set(s*0.19,0,-0.18); w2.isPickable=false;
      wp._side=s; wings.push(wp); });
    return { root:root, body:bod, type:'butterfly', wings:wings, fly:true, baseY:1.1, speed:2.0 };
  }
  function buildPuppy(){
    var root=new B.TransformNode('critter',scene);
    var fm=M(['#b5793f','#d9a05a','#8a5a34','#e8ddc9'][(Math.random()*4)|0],0.08);
    var body=sphere(0.5,10); body.scaling.set(0.7,0.66,1.2); body.material=fm; body.parent=root;
    var head=sphere(0.4,10); head.material=fm; head.parent=root; head.position.set(0,0.16,0.36);
    var snout=sphere(0.2,8); snout.scaling.set(0.8,0.7,1); snout.material=fm; snout.parent=root; snout.position.set(0,0.06,0.6); snout.isPickable=false;
    var nose=sphere(0.1,6); nose.material=darkMat(); nose.parent=root; nose.position.set(0,0.1,0.72); nose.isPickable=false;
    var ears=[]; [-0.2,0.2].forEach(function(ex){ var e=sphere(0.22,8); e.scaling.set(0.5,1,0.5); e.material=fm; e.parent=root; e.position.set(ex,0.2,0.32); e.isPickable=false; ears.push(e); });
    var tailPiv=new B.TransformNode('ptp',scene); tailPiv.parent=root; tailPiv.position.set(0,0.14,-0.5);
    var tail=B.MeshBuilder.CreateCylinder('ptl',{diameter:0.1,height:0.34,tessellation:6},scene); tail.material=fm; tail.parent=tailPiv; tail.position.y=0.14; tail.rotation.x=-0.9; tail.isPickable=false;
    var legs=[]; [[-0.16,0.34],[0.16,0.34],[-0.16,-0.24],[0.16,-0.24]].forEach(function(p){ var l=B.MeshBuilder.CreateCylinder('pl',{diameter:0.12,height:0.26,tessellation:6},scene); l.material=fm; l.parent=root; l.position.set(p[0],-0.26,p[1]); l.isPickable=false; legs.push(l); });
    eyes(root,0.11,0.2,0.56,0.06);
    return { root:root, body:body, type:'puppy', tailPiv:tailPiv, ears:ears, legs:legs, baseY:0.44, speed:1.7, walk:'stroll' };
  }
  function buildBird(){
    var root=new B.TransformNode('critter',scene);
    var col=['#5bc8ff','#ff6eb4','#ffd24d','#7bd86b','#c77dff'][(Math.random()*5)|0], bm=M(col,0.12), om=M('#ff9f2e',0.15);
    var body=sphere(0.34,10); body.scaling.set(1,0.95,1.1); body.material=bm; body.parent=root;
    var head=sphere(0.24,10); head.material=bm; head.parent=root; head.position.set(0,0.2,0.14);
    var beak=B.MeshBuilder.CreateCylinder('bbk',{diameterTop:0,diameterBottom:0.1,height:0.14,tessellation:6},scene); beak.material=om; beak.parent=root; beak.position.set(0,0.2,0.32); beak.rotation.x=Math.PI/2; beak.isPickable=false;
    var tail=sphere(0.18,8); tail.scaling.set(0.7,0.3,1); tail.material=bm; tail.parent=root; tail.position.set(0,0.05,-0.3); tail.rotation.x=0.3; tail.isPickable=false;
    var wings=[]; [-0.18,0.18].forEach(function(ex){ var w=sphere(0.2,8); w.scaling.set(0.35,0.7,1); w.material=bm; w.parent=root; w.position.set(ex,0.02,-0.02); w.isPickable=false; wings.push(w); });
    [-0.07,0.07].forEach(function(ex){ var l=B.MeshBuilder.CreateCylinder('bl',{diameter:0.04,height:0.16,tessellation:5},scene); l.material=om; l.parent=root; l.position.set(ex,-0.22,0); l.isPickable=false; });
    eyes(root,0.08,0.24,0.24,0.05);
    return { root:root, body:body, type:'bird', wings:wings, baseY:0.26, speed:1.35, walk:'hop' };
  }
  function buildFrog(){
    var root=new B.TransformNode('critter',scene);
    var gm=M('#5fbf4a',0.1), gm2=M('#8fd86b',0.1);
    var body=sphere(0.5,10); body.scaling.set(1,0.7,0.95); body.material=gm; body.parent=root;
    var belly=sphere(0.4,10); belly.scaling.set(0.9,0.5,0.8); belly.material=gm2; belly.parent=root; belly.position.set(0,-0.1,0.14); belly.isPickable=false;
    [-0.16,0.16].forEach(function(ex){ var e=sphere(0.2,8); e.material=gm; e.parent=root; e.position.set(ex,0.24,0.16); e.isPickable=false; var p=sphere(0.12,6); p.material=darkMat(); p.parent=root; p.position.set(ex,0.28,0.24); p.isPickable=false; });
    [[-0.26,0.28],[0.26,0.28],[-0.28,-0.2],[0.28,-0.2]].forEach(function(p){ var lg=sphere(0.16,7); lg.scaling.set(0.7,0.5,1); lg.material=gm; lg.parent=root; lg.position.set(p[0],-0.24,p[1]); lg.isPickable=false; });
    return { root:root, body:body, type:'frog', baseY:0.3, speed:1.5, walk:'hop' };
  }
  function buildUnicorn(){
    var root=new B.TransformNode('critter',scene);
    var wm=M('#f6f2fb',0.08), horn=M('#ffd84d',0.3), mane=M(['#ff9bce','#a78bfa','#7bd8ff'][(Math.random()*3)|0],0.18);
    var body=sphere(0.5,10); body.scaling.set(0.62,0.6,1.15); body.material=wm; body.parent=root;
    var neck=B.MeshBuilder.CreateCylinder('un',{diameterTop:0.24,diameterBottom:0.3,height:0.4,tessellation:8},scene); neck.material=wm; neck.parent=root; neck.position.set(0,0.24,0.34); neck.rotation.x=-0.5; neck.isPickable=false;
    var head=sphere(0.28,10); head.scaling.set(0.8,0.8,1.1); head.material=wm; head.parent=root; head.position.set(0,0.46,0.5);
    var hn=B.MeshBuilder.CreateCylinder('uh',{diameterTop:0,diameterBottom:0.09,height:0.26,tessellation:8},scene); hn.material=horn; hn.parent=root; hn.position.set(0,0.68,0.54); hn.isPickable=false;
    [0,1,2].forEach(function(k){ var m=sphere(0.16,7); m.scaling.set(0.6,1,0.6); m.material=mane; m.parent=root; m.position.set(0,0.5-k*0.14,0.34-k*0.02); m.isPickable=false; });
    var tailPiv=new B.TransformNode('utp',scene); tailPiv.parent=root; tailPiv.position.set(0,0.1,-0.55);
    var tail=sphere(0.18,8); tail.scaling.set(0.5,1.2,0.5); tail.material=mane; tail.parent=tailPiv; tail.position.y=-0.1; tail.isPickable=false;
    var legs=[]; [[-0.16,0.36],[0.16,0.36],[-0.16,-0.3],[0.16,-0.3]].forEach(function(p){ var l=B.MeshBuilder.CreateCylinder('ul',{diameter:0.13,height:0.34,tessellation:6},scene); l.material=wm; l.parent=root; l.position.set(p[0],-0.28,p[1]); l.isPickable=false; legs.push(l); });
    eyes(root,0.1,0.48,0.66,0.05);
    return { root:root, body:body, type:'unicorn', tailPiv:tailPiv, legs:legs, baseY:0.46, speed:1.55, walk:'stroll' };
  }
  function buildBear(){
    var root=new B.TransformNode('critter',scene);
    var fm=M(['#8a5a34','#6b4423','#4a3528','#c88f5a'][(Math.random()*4)|0],0.07);
    var body=sphere(0.56,10); body.scaling.set(0.85,0.85,1.05); body.material=fm; body.parent=root;
    var head=sphere(0.42,10); head.material=fm; head.parent=root; head.position.set(0,0.28,0.34);
    var snout=sphere(0.22,8); snout.scaling.set(1,0.8,0.9); snout.material=M('#d9b98a',0.08); snout.parent=root; snout.position.set(0,0.2,0.58); snout.isPickable=false;
    var nose=sphere(0.1,6); nose.material=darkMat(); nose.parent=root; nose.position.set(0,0.24,0.7); nose.isPickable=false;
    [-0.24,0.24].forEach(function(ex){ var e=sphere(0.2,8); e.material=fm; e.parent=root; e.position.set(ex,0.5,0.3); e.isPickable=false; });
    var legs=[]; [[-0.2,0.28],[0.2,0.28],[-0.2,-0.24],[0.2,-0.24]].forEach(function(p){ var l=B.MeshBuilder.CreateCylinder('brl',{diameter:0.2,height:0.28,tessellation:7},scene); l.material=fm; l.parent=root; l.position.set(p[0],-0.28,p[1]); l.isPickable=false; legs.push(l); });
    eyes(root,0.13,0.32,0.56,0.06);
    return { root:root, body:body, type:'bear', legs:legs, baseY:0.5, speed:1.35, walk:'stroll' };
  }
  var BUILD={ bunny:buildBunny, chick:buildChick, cat:buildCat, duck:buildDuck, butterfly:buildButterfly, puppy:buildPuppy, bird:buildBird, frog:buildFrog, unicorn:buildUnicorn, bear:buildBear };
  var SPAWN=['bunny','bunny','chick','cat','duck','butterfly'];

  function makeCritter(kind, px, pz, petId){
    if(!scene || !BUILD[kind]) return null;
    var c=BUILD[kind]();
    c.t=rs(0,10); c._gy=0; c.st='walk'; c.roamT=0; c.rx=undefined; c.rz=0; c.hopY=0; c.petT=0; c.ry=rs(0.85,1.5);
    c.isPet=(petId!=null); c.petId=(petId!=null)?petId:null;
    c.root.metadata={critter:c};
    var x=(px!=null)?px:rs(-(BO.HALF-2),BO.HALF-2), z=(pz!=null)?pz:rs(-(BO.HALF-2),BO.HALF-2);
    c.root.position.set(x, c.fly ? c.ry : groundAt(x,z)+c.baseY, z);
    c.root.rotation.y=rs(0,6.28);
    if(!c.fly && c.body && BO.scene.addShadow) BO.scene.addShadow(c.body);
    critters.push(c); return c;
  }
  function disposeCritter(c){ if(c.body && BO.scene.rmShadow) BO.scene.rmShadow(c.body); c.root.getChildMeshes(false).forEach(function(m){ m.dispose(); }); c.root.dispose(); }

  /* ---- animations ---- */
  function walkAnim(c){
    if(c.walk==='hop'){ c.hopY=Math.abs(Math.sin(c.t*6.5))*0.13; if(c.ears) c.ears.forEach(function(e,i){ e.rotation.z=Math.sin(c.t*6.5+i)*0.1; }); }
    else if(c.walk==='waddle'){ c.hopY=Math.abs(Math.sin(c.t*11))*0.03; c.root.rotation.z=Math.sin(c.t*11)*0.13; if(c.wings) c.wings.forEach(function(w,i){ w.rotation.z=(i?-1:1)*Math.sin(c.t*11)*0.22; }); }
    else { c.hopY=Math.sin(c.t*7)*0.02; if(c.tailPiv) c.tailPiv.rotation.y=Math.sin(c.t*4)*0.35; if(c.legs) c.legs.forEach(function(l,i){ l.rotation.x=Math.sin(c.t*8+i*1.6)*0.4; }); }
  }
  function idleAnim(c){
    c.hopY=0; c.root.rotation.z=0;
    if(c.type==='bunny'&&c.ears){ c.ears[0].rotation.x=-0.2+Math.sin(c.t*3)*0.18; }
    else if(c.type==='chick'&&c.head){ c.head.rotation.x=Math.max(0,Math.sin(c.t*2.5))*0.4; }
    else if(c.tailPiv){ c.tailPiv.rotation.y=Math.sin(c.t*3)*0.3; }
  }
  function flyAnim(c,dt,lim){
    c.wings.forEach(function(w){ w.rotation.z=w._side*(0.5+Math.sin(c.t*20)*0.7); });
    c.roamT-=dt; if(c.roamT<=0||c.rx===undefined){ c.rx=rs(-(BO.HALF-2),BO.HALF-2); c.rz=rs(-(BO.HALF-2),BO.HALF-2); c.roamT=rs(2,4.5); c.ry=rs(0.9,2.1); }
    var x=c.root.position.x, z=c.root.position.z, rdx=c.rx-x, rdz=c.rz-z, rd=Math.hypot(rdx,rdz)||1e-4, sp=c.speed*dt;
    c.root.position.x=Math.max(-lim,Math.min(lim,x+rdx/rd*sp));
    c.root.position.z=Math.max(-lim,Math.min(lim,z+rdz/rd*sp));
    c.root.rotation.y=Math.atan2(rdx,rdz);
    c.root.position.y=c.ry+Math.sin(c.t*3)*0.18;
  }

  function tick(){
    if(!scene || !critters.length) return;
    var now=performance.now(), dt=lastTick?Math.min((now-lastTick)/1000,0.05):0; lastTick=now;
    var lim=BO.HALF+3;
    for(var i=0;i<critters.length;i++){
      var c=critters[i]; c.t+=dt;
      if(c.fly){ flyAnim(c,dt,lim); continue; }
      var x=c.root.position.x, z=c.root.position.z; c._gy=groundAt(x,z);
      if(c.petT>0){ c.petT-=dt; c.hopY=Math.abs(Math.sin(c.t*13))*0.24; }
      else if(c.st==='idle'){ c.roamT-=dt; idleAnim(c); if(c.roamT<=0){ pickRoam(c); } }
      else {
        c.roamT-=dt;
        if(c.roamT<=0 || c.rx===undefined) pickRoam(c);
        var rdx=c.rx-x, rdz=c.rz-z, rd=Math.hypot(rdx,rdz)||1e-4;
        if(rd>0.5){ if(steerTo(c,rdx/rd,rdz/rd,c.speed*dt)) walkAnim(c); else pickRoam(c); }
        else { if(Math.random()<0.4){ c.st='idle'; c.roamT=rs(1.3,3.3); } else pickRoam(c); }
      }
      var nx=Math.max(-lim,Math.min(lim,c.root.position.x)), nz=Math.max(-lim,Math.min(lim,c.root.position.z));
      c.root.position.set(nx, c._gy+c.baseY+(c.hopY||0), nz);
    }
  }
  function ensureHook(){ if(hooked) return; scene=BO.scene.getScene(); if(scene){ scene.onBeforeRenderObservable.add(tick); hooked=true; } }

  function clearAmbient(){ for(var i=critters.length-1;i>=0;i--){ if(!critters[i].isPet){ disposeCritter(critters[i]); critters.splice(i,1); } } }
  function setActive(on){
    on=!!on; if(on===active) return; active=on;
    if(on){ ensureHook(); lastTick=0; for(var i=0;i<target;i++) makeCritter(SPAWN[i%SPAWN.length]); }
    else clearAmbient();
  }

  BO.critters = {
    init:function(o){ o=o||{}; for(var k in o) opts[k]=o[k]; scene=BO.scene.getScene(); },
    setActive:setActive,
    toggle:function(){ setActive(!active); return active; },
    isActive:function(){ return active; },
    count:function(){ return critters.length; },
    pet:function(c){ if(!c||c.fly){ if(c) c.ry=Math.min(2.4,(c.ry||1.1)+0.4); } else { c.petT=0.6; c.st='walk'; c.roamT=Math.min(c.roamT,0.4); } opts.onPet(c); },
    spawnPet:function(kind,x,z,petId){ ensureHook(); if(!lastTick) lastTick=performance.now(); return makeCritter(kind,x,z,petId); },
    removePet:function(petId){ for(var i=critters.length-1;i>=0;i--){ if(critters[i].petId===petId){ disposeCritter(critters[i]); critters.splice(i,1); return true; } } return false; }
  };
})();
