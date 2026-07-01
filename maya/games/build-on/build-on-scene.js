/* ===== Build On — 3D scene (Babylon.js) ===== */
(function(){
  var BO = window.BO = window.BO || {};
  var engine, scene, camera, walkCam, shadow, glow, platform, grass, fenceRoot, crateRoot, hemi, dir, skyLayer, sunMesh, moonMesh, starsRoot, water, bigGrass, sceneryRoot, night=false;
  var clouds=[];
  var mode='orbit', joy={x:0,z:0}, lookJoy={x:0,y:0}, keys={}, floorFn=function(){return 0;}, py=0, vy=0, grounded=true, jumpReq=false;
  var SOLID={cube:1,glass:1,rainbow:1,roof:1,facetex:1};
  var HALF=14;             // buildable cells: -HALF .. HALF
  BO.HALF=HALF;
  var MAXY=16;            // max stack height
  BO.MAXY=MAXY;

  /* ---------- materials ---------- */
  var matCache={};
  function stdMat(name,hex,opts){
    opts=opts||{};
    var m=new BABYLON.StandardMaterial(name,scene);
    var c=BABYLON.Color3.FromHexString(hex);
    m.diffuseColor=c;
    m.specularColor=new BABYLON.Color3(0.12,0.12,0.14);
    m.specularPower=48;
    if(opts.emissive) m.emissiveColor=c.scale(opts.emissive);
    if(opts.alpha!=null){ m.alpha=opts.alpha; m.backFaceCulling=false; }
    return m;
  }
  function mat(hex,opts){
    var k=hex+'|'+((opts&&opts.emissive)||'')+'|'+((opts&&opts.alpha)||'');
    if(matCache[k]) return matCache[k];
    var m=stdMat('m'+k,hex,opts); matCache[k]=m; return m;
  }
  var rainbowMat=null;
  function getRainbow(){
    if(rainbowMat) return rainbowMat;
    var dt=new BABYLON.DynamicTexture('rbtex',{width:256,height:256},scene,false);
    var cx=dt.getContext();
    var g=cx.createLinearGradient(0,0,256,256);
    ['#ff6eb4','#ff9a3c','#ffe14d','#5dffb0','#5bc8ff','#c77dff'].forEach(function(col,i,a){ g.addColorStop(i/(a.length-1),col); });
    cx.fillStyle=g; cx.fillRect(0,0,256,256); dt.update();
    var m=new BABYLON.StandardMaterial('rbmat',scene);
    m.diffuseTexture=dt; m.emissiveColor=new BABYLON.Color3(0.22,0.22,0.22);
    m.specularColor=new BABYLON.Color3(0.2,0.2,0.2);
    rainbowMat=m; return m;
  }
  var faceTexCache={};
  function getFaceTex(kind){
    if(faceTexCache[kind]) return faceTexCache[kind];
    var dt=new BABYLON.DynamicTexture('ft'+kind,{width:128,height:128},scene,true);
    var cx=dt.getContext();
    if(kind==='door'){
      cx.fillStyle='#b07a42'; cx.fillRect(0,0,128,128);
      cx.fillStyle='#7c4f25'; cx.fillRect(30,24,68,104);
      cx.fillStyle='#94612f'; cx.fillRect(37,32,54,96);
      cx.fillStyle='#ffe14d'; cx.beginPath(); cx.arc(83,82,6,0,7); cx.fill();
    } else {
      cx.fillStyle='#e8cb9a'; cx.fillRect(0,0,128,128);
      cx.fillStyle='#bfe6ff'; cx.fillRect(26,26,76,76);
      cx.fillStyle='#ffffff'; cx.fillRect(60,26,8,76); cx.fillRect(26,60,76,8);
      cx.strokeStyle='#ffffff'; cx.lineWidth=7; cx.strokeRect(26,26,76,76);
    }
    dt.update();
    var m=new BABYLON.StandardMaterial('ftm'+kind,scene); m.diffuseTexture=dt; m.specularColor=new BABYLON.Color3(0.06,0.06,0.06);
    faceTexCache[kind]=m; return m;
  }
  var charTexCache={};
  function friendMat(ch){
    if(charTexCache[ch]) return charTexCache[ch];
    var dt=new BABYLON.DynamicTexture('ch'+ch.codePointAt(0),{width:160,height:160},scene,true);
    dt.hasAlpha=true; var cx=dt.getContext(); cx.clearRect(0,0,160,160);
    cx.font='118px sans-serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(ch,80,88);
    dt.update();
    var m=new BABYLON.StandardMaterial('chm'+ch.codePointAt(0),scene);
    m.diffuseTexture=dt; m.diffuseTexture.hasAlpha=true; m.useAlphaFromDiffuseTexture=true;
    m.emissiveColor=new BABYLON.Color3(1,1,1); m.disableLighting=true; m.backFaceCulling=false;
    charTexCache[ch]=m; return m;
  }
  function addCaster(m){ if(shadow) shadow.addShadowCaster(m); }

  /* ---------- init ---------- */
  function init(canvas){
    engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
    scene=new BABYLON.Scene(engine);
    scene.clearColor=BABYLON.Color3.FromHexString('#bfe4ff');
    scene.fogMode=BABYLON.Scene.FOGMODE_EXP2; scene.fogDensity=0.006; scene.fogColor=BABYLON.Color3.FromHexString('#cfeaff');

    camera=new BABYLON.ArcRotateCamera('cam',-Math.PI/2+0.7,1.0,32,new BABYLON.Vector3(0,2,0),scene);
    camera.attachControl(canvas,true);
    camera.lowerRadiusLimit=10; camera.upperRadiusLimit=130;
    camera.lowerBetaLimit=0.18; camera.upperBetaLimit=1.48;
    camera.panningSensibility=0; camera.wheelPrecision=14; camera.pinchPrecision=20;
    camera.inertia=0.72;

    scene.collisionsEnabled=true;
    walkCam=new BABYLON.UniversalCamera('walk',new BABYLON.Vector3(0,1.6,-(HALF-1)),scene);
    walkCam.setTarget(new BABYLON.Vector3(0,1.4,0));
    walkCam.checkCollisions=true; walkCam.applyGravity=false;
    walkCam.ellipsoid=new BABYLON.Vector3(0.4,0.8,0.4);
    walkCam.ellipsoidOffset=new BABYLON.Vector3(0,0.8,0);
    walkCam.minZ=0.08; walkCam.fov=0.95; walkCam.speed=0;

    hemi=new BABYLON.HemisphericLight('hemi',new BABYLON.Vector3(0.2,1,0.1),scene);
    hemi.intensity=0.82; hemi.groundColor=BABYLON.Color3.FromHexString('#7a9e6a');
    dir=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-0.55,-1,-0.35),scene);
    dir.position=new BABYLON.Vector3(20,34,16); dir.intensity=0.9;
    shadow=new BABYLON.ShadowGenerator(1024,dir); shadow.useBlurExponentialShadowMap=true; shadow.blurScale=2; shadow.setDarkness(0.52);

    glow=new BABYLON.GlowLayer('glow',scene); glow.intensity=0.45;

    buildSky();
    buildGround();
    buildFence();
    buildCrate();
    scenery();

    engine.runRenderLoop(function(){ scene.render(); });
    window.addEventListener('resize',function(){ engine.resize(); });

    scene.onBeforeRenderObservable.add(function(){
      var dt=engine.getDeltaTime()/1000;
      for(var i=0;i<clouds.length;i++){ var cl=clouds[i]; cl.position.x+=dt*cl._sp; if(cl.position.x>40) cl.position.x=-40; }
      if(mode==='walk' && walkCam){
        var capDt=Math.min(dt,0.05);
        var mx=joy.x + ((keys.right?1:0)-(keys.left?1:0));
        var mz=joy.z + ((keys.fwd?1:0)-(keys.back?1:0));
        var mag=Math.hypot(mx,mz); if(mag>1){ mx/=mag; mz/=mag; }
        var lim=HALF+7;
        if(mx||mz){
          var sp=3.8*capDt;
          var fwd=walkCam.getDirection(BABYLON.Axis.Z); fwd.y=0; fwd.normalize();
          var right=walkCam.getDirection(BABYLON.Axis.X); right.y=0; right.normalize();
          var dmv=fwd.scale(mz*sp).add(right.scale(mx*sp));
          var nx=Math.max(-lim,Math.min(lim,walkCam.position.x+dmv.x));
          var nz=Math.max(-lim,Math.min(lim,walkCam.position.z+dmv.z));
          if(!grounded || (floorFn(nx,nz)-py)<=1.1){ walkCam.position.x=nx; walkCam.position.z=nz; }
        }
        var yaw=lookJoy.x + ((keys.turnR?1:0)-(keys.turnL?1:0));
        var pitch=lookJoy.y + ((keys.lookD?1:0)-(keys.lookU?1:0));
        if(yaw) walkCam.rotation.y += yaw*1.4*capDt;
        if(pitch) walkCam.rotation.x = Math.max(-1.2, Math.min(1.2, walkCam.rotation.x + pitch*1.1*capDt));
        if(jumpReq){ if(grounded){ vy=7; grounded=false; } jumpReq=false; }
        vy -= 18*capDt; py += vy*capDt;
        var floor=floorFn(walkCam.position.x, walkCam.position.z);
        if(py<=floor){ py=floor; vy=0; grounded=true; }
        walkCam.position.y=py+1.6;
      }
    });
  }

  var dayTex, nightTex;
  function skyTex(name, stops){
    var dt=new BABYLON.DynamicTexture(name,{width:16,height:256},scene,false);
    var cx=dt.getContext(); var g=cx.createLinearGradient(0,0,0,256);
    stops.forEach(function(s){ g.addColorStop(s[0],s[1]); });
    cx.fillStyle=g; cx.fillRect(0,0,16,256); dt.update(); return dt;
  }
  function buildSky(){
    dayTex=skyTex('skyday',[[0,'#6fbcff'],[0.55,'#bfe4ff'],[1,'#eaf7ff']]);
    nightTex=skyTex('skynight',[[0,'#0a1030'],[0.5,'#1a2350'],[1,'#3a356e']]);
    skyLayer=new BABYLON.Layer('bg',null,scene,true); skyLayer.texture=dayTex;

    sunMesh=BABYLON.MeshBuilder.CreateSphere('sun',{diameter:5,segments:12},scene);
    sunMesh.position=new BABYLON.Vector3(-22,27,22);
    var sm=new BABYLON.StandardMaterial('sunm',scene);
    sm.emissiveColor=BABYLON.Color3.FromHexString('#ffe98a'); sm.diffuseColor=sm.emissiveColor; sm.disableLighting=true;
    sunMesh.material=sm; sunMesh.isPickable=false;

    moonMesh=BABYLON.MeshBuilder.CreateSphere('moon',{diameter:4,segments:12},scene);
    moonMesh.position=new BABYLON.Vector3(19,28,20);
    var mm=new BABYLON.StandardMaterial('moonm',scene);
    mm.emissiveColor=BABYLON.Color3.FromHexString('#e8ecff'); mm.diffuseColor=mm.emissiveColor; mm.disableLighting=true;
    moonMesh.material=mm; moonMesh.isPickable=false; moonMesh.setEnabled(false);

    starsRoot=new BABYLON.TransformNode('stars',scene);
    var starMat=new BABYLON.StandardMaterial('starm',scene); starMat.emissiveColor=new BABYLON.Color3(1,1,1); starMat.disableLighting=true;
    for(var s=0;s<70;s++){
      var st=BABYLON.MeshBuilder.CreatePlane('st',{size:0.45+Math.random()*0.5},scene);
      var a=Math.random()*Math.PI*2, r=32+Math.random()*40, el=9+Math.random()*30;
      st.position=new BABYLON.Vector3(Math.cos(a)*r, el, Math.sin(a)*r);
      st.material=starMat; st.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL; st.isPickable=false; st.parent=starsRoot;
      if(glow) glow.addExcludedMesh(st);
    }
    starsRoot.setEnabled(false);

    for(var i=0;i<5;i++){ makeSkyCloud(-30+Math.random()*60, 12+Math.random()*7, -18+Math.random()*36, 0.5+Math.random()*0.8); }
  }
  var _skyTex=null, WORLD={time:'day',env:'water',sky:'clouds'};
  function setCloudsVisible(v){ clouds.forEach(function(c){ if(c.setEnabled) c.setEnabled(v); }); }
  function setWorld(o){
    o=o||{}; if(o.time)WORLD.time=o.time; if(o.env)WORLD.env=o.env; if(o.sky)WORLD.sky=o.sky;
    var night=WORLD.time==='night', space=WORLD.env==='space';
    var stops,clear,fog,hemiI,groundC,dirI;
    if(space){ stops=[[0,'#040310'],[0.6,'#0a0820'],[1,'#170f3a']]; clear='#040310'; fog='#0a0820'; hemiI=0.5; groundC='#2a2740'; dirI=0.42; }
    else if(night){ stops=[[0,'#0a1030'],[0.5,'#1a2350'],[1,'#3a356e']]; clear='#0a1030'; fog='#141a3a'; hemiI=0.46; groundC='#2a3a5a'; dirI=0.34; }
    else { stops=[[0,'#6fbcff'],[0.55,'#bfe4ff'],[1,'#eaf7ff']]; clear='#bfe4ff'; fog='#cfeaff'; hemiI=0.82; groundC='#7a9e6a'; dirI=0.9; }
    if(skyLayer){ if(_skyTex) _skyTex.dispose(); _skyTex=skyTex('sky',stops); skyLayer.texture=_skyTex; }
    if(hemi){ hemi.intensity=hemiI; hemi.groundColor=BABYLON.Color3.FromHexString(groundC); }
    if(dir) dir.intensity=dirI;
    scene.clearColor=BABYLON.Color3.FromHexString(clear); scene.fogColor=BABYLON.Color3.FromHexString(fog);
    if(sunMesh) sunMesh.setEnabled(!night && !space);
    if(moonMesh) moonMesh.setEnabled(night || space);
    if(starsRoot) starsRoot.setEnabled(WORLD.sky==='stars');
    setCloudsVisible(WORLD.sky==='clouds');
    if(water) water.setEnabled(WORLD.env==='water');
    if(bigGrass) bigGrass.setEnabled(WORLD.env==='land');
    if(water&&water.material){ water.material.diffuseColor=BABYLON.Color3.FromHexString(night?'#16386b':'#2f7fd6'); }
  }
  function makeSkyCloud(x,y,z,sp){
    var root=new BABYLON.TransformNode('skycloud',scene);
    var wm=mat('#ffffff',{emissive:0.35});
    [[0,0,0,2.4],[1.6,-0.2,0.3,1.7],[-1.4,-0.1,-0.2,1.6],[0.4,0.5,-0.4,1.4]].forEach(function(p){
      var s=BABYLON.MeshBuilder.CreateSphere('sc',{diameter:p[3],segments:8},scene);
      s.position=new BABYLON.Vector3(p[0],p[1],p[2]); s.scaling.y=0.6; s.material=wm; s.isPickable=false; s.parent=root;
    });
    root.position=new BABYLON.Vector3(x,y,z); root._sp=sp; clouds.push(root);
  }

  function buildGround(){
    water=BABYLON.MeshBuilder.CreateGround('water',{width:320,height:320},scene);
    var wm=new BABYLON.StandardMaterial('waterm',scene);
    wm.diffuseColor=BABYLON.Color3.FromHexString('#2f7fd6'); wm.specularColor=new BABYLON.Color3(0.5,0.6,0.72); wm.specularPower=64;
    wm.emissiveColor=BABYLON.Color3.FromHexString('#123a66').scale(0.5); wm.alpha=0.94;
    water.material=wm; water.position.y=-0.42; water.isPickable=false;
    bigGrass=BABYLON.MeshBuilder.CreateGround('bigGrass',{width:240,height:240},scene);
    bigGrass.material=grassMat(); bigGrass.position.y=-0.05; bigGrass.isPickable=false; bigGrass.receiveShadows=true; bigGrass.setEnabled(false);
    buildPlatform();
  }
  var _grassMat=null;
  function grassMat(){ if(!_grassMat) _grassMat=stdMat('grassm','#5aa64a'); return _grassMat; }
  function buildPlatform(){
    if(platform){ if(platform.material) platform.material.dispose(true,true); platform.dispose(); }
    if(grass) grass.dispose();
    var size=(HALF*2)+1;
    var isle=size+9;
    grass=BABYLON.MeshBuilder.CreateBox('grass',{width:isle,height:0.7,depth:isle},scene);
    grass.material=grassMat(); grass.position.y=-0.37; grass.isPickable=false; grass.receiveShadows=true;
    platform=BABYLON.MeshBuilder.CreateBox('yard',{width:size,height:0.5,depth:size},scene);
    platform.position.y=-0.25;           // top surface at y=0
    platform.material=yardMat(size);
    platform.receiveShadows=true; platform.isPickable=true; platform.metadata={yard:true};
    rebuildScenery();
  }
  function yardMat(size){
    var px=Math.min(size*40, 2048);
    var dt=new BABYLON.DynamicTexture('yardt',{width:px,height:px},scene,false);
    var cx=dt.getContext();
    cx.fillStyle='#6fb84f'; cx.fillRect(0,0,px,px);
    cx.strokeStyle='rgba(28,74,28,0.16)'; cx.lineWidth=2;
    var cell=px/size;
    for(var i=0;i<=size;i++){ var p=i*cell; cx.beginPath(); cx.moveTo(p,0); cx.lineTo(p,px); cx.moveTo(0,p); cx.lineTo(px,p); cx.stroke(); }
    dt.update();
    var m=new BABYLON.StandardMaterial('yardm',scene); m.diffuseTexture=dt; m.specularColor=new BABYLON.Color3(0.04,0.04,0.04);
    return m;
  }

  function buildFence(){
    if(fenceRoot){ fenceRoot.getChildMeshes().forEach(function(m){ if(shadow) shadow.removeShadowCaster(m); }); fenceRoot.dispose(); }
    fenceRoot=new BABYLON.TransformNode('fenceRoot',scene);
    var half=HALF+0.5;
    var railMat=stdMat('railm','#caa06a'), postMat=stdMat('postm','#8a5a2b');
    var L=half*2+0.4;
    function rail(x,z,w,d){ var b=BABYLON.MeshBuilder.CreateBox('rail',{width:w,height:0.5,depth:d},scene); b.position=new BABYLON.Vector3(x,0.05,z); b.material=railMat; b.isPickable=false; b.receiveShadows=true; b.parent=fenceRoot; addCaster(b); }
    rail(0,half+0.2,L,0.4); rail(0,-half-0.2,L,0.4); rail(half+0.2,0,0.4,L); rail(-half-0.2,0,0.4,L);
    [[half+0.2,half+0.2],[half+0.2,-half-0.2],[-half-0.2,half+0.2],[-half-0.2,-half-0.2]].forEach(function(c){
      var p=BABYLON.MeshBuilder.CreateBox('post',{width:0.5,height:0.9,depth:0.5},scene);
      p.position=new BABYLON.Vector3(c[0],0.2,c[1]); p.material=postMat; p.isPickable=false; p.parent=fenceRoot; addCaster(p);
    });
  }

  function buildCrate(){
    var root=crateRoot=new BABYLON.TransformNode('crateRoot',scene);
    var body=BABYLON.MeshBuilder.CreateBox('crate',{width:1.5,height:1.2,depth:1.5},scene);
    body.material=stdMat('cratem','#b07a42'); body.metadata={crate:true}; body.isPickable=true; body.parent=root; addCaster(body);
    var lid=BABYLON.MeshBuilder.CreateBox('lid',{width:1.62,height:0.18,depth:1.62},scene); lid.position.y=0.66; lid.material=stdMat('lidm','#8a5a2b'); lid.isPickable=false; lid.parent=body; addCaster(lid);
    var r1=BABYLON.MeshBuilder.CreateBox('rib1',{width:1.64,height:0.16,depth:0.3},scene); r1.position.y=0.22; r1.material=stdMat('ribm','#ff6eb4',{emissive:0.25}); r1.isPickable=false; r1.parent=body;
    var r2=r1.clone('rib2'); r2.rotation.y=Math.PI/2; r2.parent=body;
    root.position=new BABYLON.Vector3(-(HALF+2),0.6,-(HALF+2));
    scene.onBeforeRenderObservable.add(function(){ root.position.y=0.6+Math.sin(performance.now()/520)*0.08; });
  }

  function scenery(){ /* trees are placed on the island border, rebuilt with the yard */ }
  function rebuildScenery(){
    if(sceneryRoot){ sceneryRoot.getChildMeshes().forEach(function(m){ if(shadow) shadow.removeShadowCaster(m); }); sceneryRoot.dispose(); }
    sceneryRoot=new BABYLON.TransformNode('sceneryRoot',scene);
    var b=HALF+2.6;
    [[-b,-b,1.3],[b,-b,1.2],[-b,b,1.25],[b,b,1.35],[0,-b,1.1],[0,b,1.15]].forEach(function(s){ freeTree(s[0],s[1],s[2]); });
  }
  function freeTree(x,z,sc){
    var root=new BABYLON.TransformNode('atree',scene); root.parent=sceneryRoot;
    var tr=BABYLON.MeshBuilder.CreateCylinder('tr',{diameter:0.5*sc,height:1.6*sc,tessellation:8},scene); tr.material=mat('#8a5a2b'); tr.position.y=0.8*sc; tr.parent=root; tr.isPickable=false; addCaster(tr);
    var lv=BABYLON.MeshBuilder.CreateSphere('lv',{diameter:2.3*sc,segments:8},scene); lv.material=mat('#4fbf5a'); lv.position.y=2.1*sc; lv.scaling.y=0.92; lv.parent=root; lv.isPickable=false; addCaster(lv);
    root.position=new BABYLON.Vector3(x,0,z);
  }

  /* ---------- place / remove a piece ---------- */
  function placePiece(pieceId, cell, color, potState){
    var p=BO.piece(pieceId);
    var pos=new BABYLON.Vector3(cell.x, cell.y+0.5, cell.z);
    var root;
    if(p.kind==='cube'){
      root=BABYLON.MeshBuilder.CreateBox('b',{size:0.94},scene); root.material=mat(color||p.color); root.receiveShadows=true; addCaster(root);
    } else if(p.kind==='glass'){
      root=BABYLON.MeshBuilder.CreateBox('b',{size:0.94},scene); root.material=mat(p.color,{alpha:0.42}); addCaster(root);
    } else if(p.kind==='rainbow'){
      root=BABYLON.MeshBuilder.CreateBox('b',{size:0.94},scene); root.material=getRainbow(); root.receiveShadows=true; addCaster(root);
    } else if(p.kind==='facetex'){
      root=BABYLON.MeshBuilder.CreateBox('b',{size:0.96},scene); root.material=getFaceTex(p.tex); root.receiveShadows=true; addCaster(root);
    } else if(p.kind==='roof'){
      root=BABYLON.MeshBuilder.CreateCylinder('roof',{height:1,diameterTop:0,diameterBottom:1.34,tessellation:4},scene);
      root.rotation.y=Math.PI/4; root.material=mat(p.color); addCaster(root);
    } else if(p.kind==='ball'){
      root=BABYLON.MeshBuilder.CreateSphere('ball',{diameter:0.9,segments:12},scene); root.material=mat(color||'#ff5a6a'); addCaster(root);
    } else if(p.kind==='friend'){
      root=BABYLON.MeshBuilder.CreateBox('col',{size:0.9},scene); root.visibility=0; root.isPickable=true; root.metadata={interactive:'friend'};
      var ped=BABYLON.MeshBuilder.CreateCylinder('ped',{diameter:0.66,height:0.14,tessellation:16},scene);
      ped.material=mat('#6fb84f'); ped.position.y=-0.43; ped.parent=root; ped.isPickable=false; addCaster(ped);
      var bb=BABYLON.MeshBuilder.CreatePlane('bb',{size:1.18},scene);
      bb.material=friendMat(p.char); bb.billboardMode=BABYLON.Mesh.BILLBOARDMODE_Y; bb.position.y=0.12; bb.parent=root; bb.isPickable=false;
      if(glow) glow.addExcludedMesh(bb);
      root.metadata.friendBB=bb;
      var hop=scene.onBeforeRenderObservable.add(function(){ if(bb.isDisposed()){ scene.onBeforeRenderObservable.remove(hop); return; } bb.position.y=0.12+Math.abs(Math.sin(performance.now()/380))*0.13; });
    } else if(p.kind==='balloon'){
      root=BABYLON.MeshBuilder.CreateBox('bcol',{width:0.9,height:1.5,depth:0.9},scene); root.visibility=0; root.isPickable=true;
      var bcol=color||p.color||'#ff6eb4';
      var bmesh=BABYLON.MeshBuilder.CreateSphere('balloon',{diameter:0.66,segments:12},scene); bmesh.scaling.y=1.2; bmesh.material=mat(bcol,{emissive:0.14}); bmesh.position.y=0.36; bmesh.parent=root; bmesh.isPickable=false; addCaster(bmesh);
      var knot=BABYLON.MeshBuilder.CreateCylinder('knot',{diameterTop:0.02,diameterBottom:0.13,height:0.12,tessellation:6},scene); knot.material=mat(bcol); knot.position.y=0.03; knot.parent=root; knot.isPickable=false;
      var strg=BABYLON.MeshBuilder.CreateCylinder('strg',{diameter:0.03,height:0.5,tessellation:4},scene); strg.material=mat('#e8e8f0'); strg.position.y=-0.25; strg.parent=root; strg.isPickable=false;
      var bt=Math.random()*6.28; var bobo=scene.onBeforeRenderObservable.add(function(){ if(bmesh.isDisposed()){ scene.onBeforeRenderObservable.remove(bobo); return; } bmesh.position.y=0.36+Math.sin(performance.now()/700+bt)*0.06; });
    } else if(p.kind==='lamp'){
      root=BABYLON.MeshBuilder.CreateBox('lcol',{size:0.9},scene); root.visibility=0; root.isPickable=true;
      var lpost=BABYLON.MeshBuilder.CreateCylinder('lpost',{diameter:0.14,height:0.7,tessellation:8},scene); lpost.material=mat('#6b5030'); lpost.position.y=-0.1; lpost.parent=root; lpost.isPickable=false; addCaster(lpost);
      var orb=BABYLON.MeshBuilder.CreateSphere('orb',{diameter:0.42,segments:12},scene); orb.material=mat('#fff3a0',{emissive:0.9}); orb.position.y=0.33; orb.parent=root; orb.isPickable=false;
    } else if(p.kind==='water'){
      root=BABYLON.MeshBuilder.CreateBox('wcol',{size:0.94},scene); root.visibility=0; root.isPickable=true;
      var wat=BABYLON.MeshBuilder.CreateBox('water',{width:0.9,height:0.4,depth:0.9},scene); wat.material=mat('#3aa0e0',{alpha:0.72,emissive:0.12}); wat.position.y=-0.27; wat.parent=root; wat.isPickable=false;
    } else if(p.kind==='standee'){
      root=BABYLON.MeshBuilder.CreateBox('scol',{size:0.9},scene); root.visibility=0; root.isPickable=true;
      var sped=BABYLON.MeshBuilder.CreateCylinder('sped',{diameter:0.6,height:0.14,tessellation:16},scene); sped.material=mat('#c8975a'); sped.position.y=-0.43; sped.parent=root; sped.isPickable=false; addCaster(sped);
      var sbb=BABYLON.MeshBuilder.CreatePlane('sbb',{size:1.1},scene); sbb.material=friendMat(p.char); sbb.billboardMode=BABYLON.Mesh.BILLBOARDMODE_Y; sbb.position.y=0.15; sbb.parent=root; sbb.isPickable=false; if(glow) glow.addExcludedMesh(sbb);
    } else if(p.kind==='pot'){
      root=BABYLON.MeshBuilder.CreateBox('potcol',{width:0.94,height:2,depth:0.94},scene);
      root.visibility=0; root.isPickable=true; root.metadata={interactive:'pot'};
      buildPot(root);
      if(potState&&potState.seed){
        hidePotPrompt(root);
        root.metadata.plant={seed:potState.seed, stage:potState.stage||0};
        makePlantMesh(root, potState.seed, root.metadata.plant.stage);
        if(root.metadata.plant.stage<3) showPotPrompt(root,'💧','ALL');
      }
    } else {
      root=BABYLON.MeshBuilder.CreateBox('col',{size:0.94},scene); root.visibility=0; root.isPickable=true;
      buildDecor(p.kind, root, color);
    }
    if(SOLID[p.kind]) root.checkCollisions=true;
    root.position=pos;
    root.metadata=root.metadata||{};
    root.metadata.cell={x:cell.x,y:cell.y,z:cell.z};
    root.metadata.pieceId=pieceId;
    root.metadata.color=color||null;
    popIn(root);
    return root;
  }

  function buildDecor(kind, root, color){
    if(kind==='tree'){
      var tr=BABYLON.MeshBuilder.CreateCylinder('tr',{diameter:0.24,height:0.6,tessellation:7},scene); tr.material=mat('#8a5a2b'); tr.position.y=-0.2; tr.parent=root; tr.isPickable=false; addCaster(tr);
      var lv=BABYLON.MeshBuilder.CreateSphere('lv',{diameter:0.95,segments:8},scene); lv.material=mat('#4fbf5a'); lv.position.y=0.36; lv.parent=root; lv.isPickable=false; addCaster(lv);
    } else if(kind==='flower'){
      var st=BABYLON.MeshBuilder.CreateCylinder('st',{diameter:0.08,height:0.55,tessellation:6},scene); st.material=mat('#3fae52'); st.position.y=-0.2; st.parent=root; st.isPickable=false; addCaster(st);
      var pet=BABYLON.MeshBuilder.CreateSphere('pet',{diameter:0.44,segments:8},scene); pet.scaling.y=0.55; pet.material=mat(color||'#ff6eb4'); pet.position.y=0.12; pet.parent=root; pet.isPickable=false; addCaster(pet);
      var cr=BABYLON.MeshBuilder.CreateSphere('cr',{diameter:0.18,segments:6},scene); cr.material=mat('#ffe14d',{emissive:0.25}); cr.position.y=0.16; cr.parent=root; cr.isPickable=false;
    } else if(kind==='cloud'){
      var wm=mat('#ffffff',{emissive:0.3});
      [[0,0,0,0.72],[0.34,-0.05,0.1,0.52],[-0.32,-0.03,-0.08,0.5],[0.08,0.18,-0.12,0.44]].forEach(function(q){
        var s=BABYLON.MeshBuilder.CreateSphere('cc',{diameter:q[3],segments:7},scene); s.scaling.y=0.7; s.position=new BABYLON.Vector3(q[0],q[1],q[2]); s.material=wm; s.isPickable=false; s.parent=root; addCaster(s);
      });
    } else if(kind==='star'){
      var g=BABYLON.MeshBuilder.CreatePolyhedron('star',{type:1,size:0.34},scene); // octahedron gem
      g.material=mat('#ffd84d',{emissive:0.55}); g.parent=root; g.isPickable=false; addCaster(g);
      var spin=scene.onBeforeRenderObservable.add(function(){ if(g.isDisposed()){ scene.onBeforeRenderObservable.remove(spin); return; } g.rotation.y+=0.02; });
    } else if(kind==='mushroom'){
      var stem=BABYLON.MeshBuilder.CreateCylinder('ms',{diameterTop:0.26,diameterBottom:0.34,height:0.44,tessellation:10},scene); stem.material=mat('#f2e9ff'); stem.position.y=-0.24; stem.parent=root; stem.isPickable=false; addCaster(stem);
      var cap=BABYLON.MeshBuilder.CreateSphere('mc',{diameter:0.64,segments:10},scene); cap.scaling.y=0.6; cap.material=mat('#e0574a'); cap.position.y=0.04; cap.parent=root; cap.isPickable=false; addCaster(cap);
    } else if(kind==='bush'){
      var bm=mat('#4fbf5a');
      [[0,-0.12,0,0.64],[0.26,-0.04,0.1,0.5],[-0.24,-0.06,-0.08,0.48],[0.05,0.16,-0.1,0.5]].forEach(function(q){ var s=BABYLON.MeshBuilder.CreateSphere('bs',{diameter:q[3],segments:8},scene); s.position=new BABYLON.Vector3(q[0],q[1],q[2]); s.material=bm; s.parent=root; s.isPickable=false; addCaster(s); });
    }
  }

  function popIn(root){
    var t0=performance.now();
    var ob=scene.onBeforeRenderObservable.add(function(){
      var k=Math.min(1,(performance.now()-t0)/180);
      var s = k<1 ? (0.25 + 0.9*k + 0.15*Math.sin(k*Math.PI)) : 1;
      root.scaling.set(s,s,s);
      if(k>=1){ root.scaling.set(1,1,1); scene.onBeforeRenderObservable.remove(ob); }
    });
  }

  function removePiece(root){
    root.getChildMeshes(false).forEach(function(c){ if(shadow) shadow.removeShadowCaster(c); c.dispose(); });
    if(shadow) shadow.removeShadowCaster(root);
    root.dispose();
  }

  /* ---------- interactive plant pot ---------- */
  function makeEmojiPlane(ch,size,mode){
    var pl=BABYLON.MeshBuilder.CreatePlane('em',{size:size},scene);
    pl.material=friendMat(ch);
    pl.billboardMode=(mode==='ALL')?BABYLON.Mesh.BILLBOARDMODE_ALL:BABYLON.Mesh.BILLBOARDMODE_Y;
    if(glow) glow.addExcludedMesh(pl);
    return pl;
  }
  function buildPot(root){
    var pot=BABYLON.MeshBuilder.CreateCylinder('pot',{diameterTop:0.74,diameterBottom:0.52,height:0.56,tessellation:20},scene);
    pot.material=mat('#cd7f52'); pot.position.y=-0.2; pot.parent=root; pot.isPickable=false; pot.receiveShadows=true; addCaster(pot);
    var rim=BABYLON.MeshBuilder.CreateCylinder('rim',{diameterTop:0.82,diameterBottom:0.76,height:0.12,tessellation:20},scene);
    rim.material=mat('#e0925f'); rim.position.y=0.06; rim.parent=root; rim.isPickable=false; addCaster(rim);
    var soil=BABYLON.MeshBuilder.CreateCylinder('soil',{diameter:0.66,height:0.12,tessellation:20},scene);
    soil.material=mat('#5a3c24'); soil.position.y=0.05; soil.parent=root; soil.isPickable=false;
    showPotPrompt(root,'🌱','ALL');
  }
  function showPotPrompt(root,ch,mode){
    hidePotPrompt(root);
    var pl=makeEmojiPlane(ch,0.42,mode||'ALL');
    pl.position.y=0.92; pl.parent=root; pl.isPickable=false;
    var bob=scene.onBeforeRenderObservable.add(function(){ if(pl.isDisposed()){ scene.onBeforeRenderObservable.remove(bob); return; } pl.position.y=0.92+Math.sin(performance.now()/420)*0.09; });
    root.metadata.promptMesh=pl; root.metadata.promptObs=bob;
  }
  function hidePotPrompt(root){
    var md=root.metadata; if(md&&md.promptMesh){ if(md.promptObs) scene.onBeforeRenderObservable.remove(md.promptObs); md.promptMesh.dispose(); md.promptMesh=null; md.promptObs=null; }
  }
  var PLANT_SIZE=[0.5,0.64,0.92,1.28];
  function makePlantMesh(root, seedCh, stage){
    var md=root.metadata;
    if(md.plantMesh){ if(md.plantObs) scene.onBeforeRenderObservable.remove(md.plantObs); md.plantMesh.dispose(); md.plantMesh=null; md.plantObs=null; }
    var ch = stage===0 ? '🌱' : seedCh;
    var size=PLANT_SIZE[stage]||0.5;
    var pl=makeEmojiPlane(ch,size,'Y');
    pl.parent=root; pl.isPickable=true; pl.metadata={potRef:root};
    var baseY=0.08+size*0.42;
    pl.position.y=baseY;
    md.plantMesh=pl;
    if(stage>=3){
      md.plantObs=scene.onBeforeRenderObservable.add(function(){ if(pl.isDisposed()){ scene.onBeforeRenderObservable.remove(md.plantObs); return; } var t=performance.now(); pl.rotation.z=Math.sin(t/520)*0.09; pl.position.y=baseY+Math.sin(t/640)*0.04; });
    }
    popIn(pl);
    return pl;
  }
  function potSparkle(root){
    var base=root.getAbsolutePosition();
    for(var i=0;i<9;i++){ (function(){
      var s=makeEmojiPlane(Math.random()<0.5?'✨':'🌟',0.32,'ALL');
      s.position=base.add(new BABYLON.Vector3((Math.random()-0.5)*0.9,0.5+Math.random()*0.4,(Math.random()-0.5)*0.9));
      var t0=performance.now(), dur=760+Math.random()*440;
      var ob=scene.onBeforeRenderObservable.add(function(){ var k=(performance.now()-t0)/dur; if(k>=1||s.isDisposed()){ if(!s.isDisposed()) s.dispose(); scene.onBeforeRenderObservable.remove(ob); return; } s.position.y+=0.013; s.scaling.setAll(1-0.35*k); s.visibility=1-k; });
    })(); }
  }
  function petFriend(root){
    if(root.metadata&&root.metadata.friendBB){ popIn(root.metadata.friendBB); }
    var base=root.getAbsolutePosition();
    for(var i=0;i<5;i++){ (function(){
      var s=makeEmojiPlane(Math.random()<0.5?'💗':'💖',0.34,'ALL');
      s.position=base.add(new BABYLON.Vector3((Math.random()-0.5)*0.6,0.55+Math.random()*0.35,(Math.random()-0.5)*0.6));
      var t0=performance.now(), dur=680+Math.random()*320;
      var ob=scene.onBeforeRenderObservable.add(function(){ var k=(performance.now()-t0)/dur; if(k>=1||s.isDisposed()){ if(!s.isDisposed()) s.dispose(); scene.onBeforeRenderObservable.remove(ob); return; } s.position.y+=0.012; s.scaling.setAll(1-0.3*k); s.visibility=1-k; });
    })(); }
  }
  function potPlant(root, seedCh){
    if(!root.metadata||root.metadata.interactive!=='pot') return;
    hidePotPrompt(root);
    root.metadata.plant={seed:seedCh, stage:0};
    makePlantMesh(root, seedCh, 0);
    showPotPrompt(root,'💧','ALL');
  }
  function potWater(root){
    var pl=root.metadata&&root.metadata.plant; if(!pl) return 0;
    if(pl.stage>=3) return 3;
    pl.stage++;
    makePlantMesh(root, pl.seed, pl.stage);
    if(pl.stage>=3){ hidePotPrompt(root); potSparkle(root); }
    else showPotPrompt(root,'💧','ALL');
    return pl.stage;
  }
  function getPot(root){ return root.metadata&&root.metadata.plant; }

  /* ---------- resolve a tap into an intent ---------- */
  function resolveTap(){ return resolveTapAt(scene.pointerX, scene.pointerY); }
  function resolveTapAt(px,py){
    var pick=scene.pick(px, py, function(m){ return m.isPickable; });
    if(!pick||!pick.hit) return null;
    var m=pick.pickedMesh;
    if(m.metadata&&m.metadata.crate) return {type:'crate'};
    if(m.metadata&&m.metadata.interactive==='pot') return {type:'pot', root:m};
    if(m.metadata&&m.metadata.potRef) return {type:'pot', root:m.metadata.potRef};
    if(m.metadata&&m.metadata.interactive==='friend') return {type:'friend', root:m};
    if(m.metadata&&m.metadata.yard){
      var p=pick.pickedPoint;
      var cx=Math.max(-HALF,Math.min(HALF,Math.round(p.x)));
      var cz=Math.max(-HALF,Math.min(HALF,Math.round(p.z)));
      return {type:'ground', cell:{x:cx,y:0,z:cz}};
    }
    if(m.metadata&&m.metadata.cell){
      var n=pick.getNormal(true,true), nx=0,ny=0,nz=0;
      if(n){ nx=Math.round(n.x); ny=Math.round(n.y); nz=Math.round(n.z); }
      if(nx===0&&ny===0&&nz===0){
        var d=pick.pickedPoint.subtract(m.getAbsolutePosition());
        var ax=Math.abs(d.x),ay=Math.abs(d.y),az=Math.abs(d.z);
        if(ax>=ay&&ax>=az) nx=d.x>0?1:-1; else if(ay>=az) ny=d.y>0?1:-1; else nz=d.z>0?1:-1;
      }
      var c=m.metadata.cell;
      return {type:'block', root:m, place:{x:c.x+nx,y:c.y+ny,z:c.z+nz}, cell:c};
    }
    return null;
  }

  /* ---------- placement ghost (shows exactly where the next piece lands) ---------- */
  var ghostMesh=null, ghostMat=null;
  function ensureGhost(){
    if(ghostMesh) return ghostMesh;
    ghostMat=new BABYLON.StandardMaterial('ghostm',scene);
    ghostMat.emissiveColor=new BABYLON.Color3(0.5,0.5,0.5);
    ghostMat.alpha=0.4; ghostMat.backFaceCulling=false; ghostMat.specularColor=new BABYLON.Color3(0,0,0);
    ghostMesh=BABYLON.MeshBuilder.CreateBox('ghost',{size:0.98},scene);
    ghostMesh.material=ghostMat; ghostMesh.isPickable=false; ghostMesh.setEnabled(false);
    ghostMesh.enableEdgesRendering(); ghostMesh.edgesWidth=7; ghostMesh.edgesColor=new BABYLON.Color4(1,1,1,0.95);
    if(glow) glow.addExcludedMesh(ghostMesh);
    scene.onBeforeRenderObservable.add(function(){ if(ghostMesh&&ghostMesh.isEnabled()){ var s=1+Math.sin(performance.now()/210)*0.035; ghostMesh.scaling.set(s,s,s); } });
    return ghostMesh;
  }
  function showGhostAt(cell,color){
    ensureGhost();
    var c=BABYLON.Color3.FromHexString(color||'#f2e9ff');
    ghostMat.diffuseColor=c; ghostMat.emissiveColor=c.scale(0.45);
    ghostMesh.position.set(cell.x, cell.y+0.5, cell.z);
    ghostMesh.setEnabled(true);
  }
  function hideGhost(){ if(ghostMesh) ghostMesh.setEnabled(false); }

  function frameCamera(){ camera.alpha=-Math.PI/2+0.7; camera.beta=1.0; camera.radius=Math.max(28, HALF*2.4+10); camera.target=new BABYLON.Vector3(0,2,0); }
  function setYardSize(h){
    h=Math.max(6, Math.min(30, h|0));
    HALF=h; BO.HALF=HALF;
    buildPlatform();
    buildFence();
    if(crateRoot){ crateRoot.position.x=-(HALF+2); crateRoot.position.z=-(HALF+2); }
    if(mode==='walk' && walkCam){ var lim=HALF+7;
      walkCam.position.x=Math.max(-lim,Math.min(lim,walkCam.position.x));
      walkCam.position.z=Math.max(-lim,Math.min(lim,walkCam.position.z));
    } else { frameCamera(); }
  }

  function setMode(m){
    mode=m;
    if(m==='walk'){
      camera.detachControl();
      walkCam.position=new BABYLON.Vector3(0,1.6,-(HALF-1));
      walkCam.rotation=new BABYLON.Vector3(0,0,0);
      py=floorFn(0,-(HALF-1)); vy=0; grounded=true; walkCam.position.y=py+1.6;
      scene.activeCamera=walkCam;
    } else {
      joy.x=0; joy.z=0;
      scene.activeCamera=camera;
      camera.attachControl(engine.getRenderingCanvas(),true);
    }
  }
  function walkLook(dx,dy){
    if(!walkCam) return;
    walkCam.rotation.y += dx;
    walkCam.rotation.x = Math.max(-0.85, Math.min(0.85, walkCam.rotation.x + dy));
  }
  function recenterWalk(){ if(!walkCam) return; walkCam.position.set(0,1.6,-(HALF-1)); walkCam.rotation.set(0,0,0); py=floorFn(0,-(HALF-1)); vy=0; grounded=true; walkCam.position.y=py+1.6; }
  function jump(){ jumpReq=true; }
  function setFloorFn(fn){ if(typeof fn==='function') floorFn=fn; }

  BO.scene = { init:init, placePiece:placePiece, removePiece:removePiece, resolveTap:resolveTap, resolveTapAt:resolveTapAt, frameCamera:frameCamera,
    setMode:setMode, setJoy:function(x,z){ joy.x=x; joy.z=z; }, setLook:function(x,y){ lookJoy.x=x; lookJoy.y=y; }, setKey:function(k,d){ keys[k]=d; },
    walkLook:walkLook, getMode:function(){ return mode; }, setYardSize:setYardSize, recenterWalk:recenterWalk, setWorld:setWorld, jump:jump, setFloorFn:setFloorFn,
    showGhostAt:showGhostAt, hideGhost:hideGhost, potPlant:potPlant, potWater:potWater, getPot:getPot, petFriend:petFriend };
})();
