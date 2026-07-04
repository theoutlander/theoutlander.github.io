/* ===== Build On — 3D scene (Babylon.js) ===== */
(function(){
  var BO = window.BO = window.BO || {};
  var engine, scene, camera, walkCam, shadow, glow, platform, grass, fenceRoot, crateRoot, hemi, dir, skyLayer, sunMesh, moonMesh, starsRoot, water, bigGrass, sceneryRoot, night=false;
  var clouds=[];
  var mode='orbit', joy={x:0,z:0}, lookJoy={x:0,y:0}, keys={}, floorFn=function(){return 0;}, py=0, vy=0, grounded=true, jumpReq=false;
  var livePointers=0, liveKeys={};
  var SOLID={cube:1,glass:1,rainbow:1,roof:1,facetex:1,stairs:1,slab:1,pillar:1,fence:1};
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
    camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');   // stuck-key spins: orbit rotates by drag only
    camera.lowerRadiusLimit=10; camera.upperRadiusLimit=130;
    camera.lowerBetaLimit=0.18; camera.upperBetaLimit=1.48;
    camera.panningSensibility=0; camera.wheelPrecision=14; camera.pinchPrecision=20;
    camera.inertia=0.6;   // smooth glide while dragging; the spin governor still stops it dead on release (no coast)

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
    window.addEventListener('blur',function(){ keys={}; lookJoy.x=0; lookJoy.y=0; joy.x=0; joy.z=0; });
    /* spin governor: track REAL input presence at the browser level */
    window.addEventListener('pointerdown',function(){ livePointers++; },true);
    window.addEventListener('pointerup',function(){ livePointers=Math.max(0,livePointers-1); },true);
    window.addEventListener('pointercancel',function(){ livePointers=Math.max(0,livePointers-1); },true);
    window.addEventListener('pointermove',function(e){ if(e.pointerType==='mouse'&&e.buttons===0) livePointers=0; },true);
    window.addEventListener('keydown',function(e){ liveKeys[e.code]=1; },true);
    window.addEventListener('keyup',function(e){ delete liveKeys[e.code]; },true);
    window.addEventListener('blur',function(){ livePointers=0; liveKeys={}; });

    scene.onBeforeRenderObservable.add(function(){
      var dt=engine.getDeltaTime()/1000;
      /* spin governor: with no real input held, rotation state is forced to zero every frame */
      if(livePointers<=0){
        if(camera){ camera.inertialAlphaOffset=0; camera.inertialBetaOffset=0; }
        lookJoy.x=0; lookJoy.y=0;
        var anyKey=false; for(var kk in liveKeys){ anyKey=true; break; }
        if(!anyKey){ joy.x=0; joy.z=0; if(keys.turnL||keys.turnR||keys.fwd||keys.back||keys.lookU||keys.lookD){ keys={}; } }
      }
      for(var i=0;i<clouds.length;i++){ var cl=clouds[i]; cl.position.x+=dt*cl._sp; if(cl.position.x>40) cl.position.x=-40; }
      if(mode==='walk' && walkCam){
        if(!document.hasFocus()){ lookJoy.x=0; lookJoy.y=0; joy.x=0; joy.z=0; keys={}; }   // focus lost = all motion input dies
        var capDt=Math.min(dt,0.05);
        var mx=joy.x + ((keys.right?1:0)-(keys.left?1:0));
        var mz=joy.z + ((keys.fwd?1:0)-(keys.back?1:0));
        var mag=Math.hypot(mx,mz); if(mag>1){ mx/=mag; mz/=mag; }
        var lim=HALF+4;   // stay on the grassy island, not the water
        if(mx||mz){
          var sp=4.2*capDt;
          var fwd=walkCam.getDirection(BABYLON.Axis.Z); fwd.y=0; fwd.normalize();
          var right=walkCam.getDirection(BABYLON.Axis.X); right.y=0; right.normalize();
          var dmv=fwd.scale(mz*sp).add(right.scale(mx*sp));
          var nx=Math.max(-lim,Math.min(lim,walkCam.position.x+dmv.x));
          var nz=Math.max(-lim,Math.min(lim,walkCam.position.z+dmv.z));
          if(!grounded || (floorFn(nx,nz)-py)<=1.1){ walkCam.position.x=nx; walkCam.position.z=nz; }
        }
        var yaw=lookJoy.x + ((keys.turnR?1:0)-(keys.turnL?1:0));
        var pitch=lookJoy.y + ((keys.lookD?1:0)-(keys.lookU?1:0));
        if(Math.abs(yaw)>0.02) walkCam.rotation.y += yaw*2.2*capDt;
        if(Math.abs(pitch)>0.02) walkCam.rotation.x = Math.max(-1.2, Math.min(1.2, walkCam.rotation.x + pitch*1.1*capDt));
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

    for(var i=0;i<6;i++){ makeSkyCloud(-32+Math.random()*64, 21+Math.random()*8, -20+Math.random()*40, 0.5+Math.random()*0.8); }
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
  function placePiece(pieceId, cell, color, potState, rot){
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
      var lmetal=mat('#3a3f4a');
      var lbase=BABYLON.MeshBuilder.CreateCylinder('lb',{diameterTop:0.2,diameterBottom:0.34,height:0.14,tessellation:12},scene); lbase.material=lmetal; lbase.position.y=-0.42; lbase.parent=root; lbase.isPickable=false; addCaster(lbase);
      var lpost=BABYLON.MeshBuilder.CreateCylinder('lpost',{diameter:0.1,height:0.66,tessellation:8},scene); lpost.material=lmetal; lpost.position.y=-0.12; lpost.parent=root; lpost.isPickable=false; addCaster(lpost);
      var lhouse=BABYLON.MeshBuilder.CreateCylinder('lh',{diameterTop:0.16,diameterBottom:0.36,height:0.1,tessellation:8},scene); lhouse.material=lmetal; lhouse.position.y=0.42; lhouse.parent=root; lhouse.isPickable=false;
      var bulb=BABYLON.MeshBuilder.CreateSphere('lorb',{diameter:0.34,segments:12},scene); bulb.material=mat('#fff3a0',{emissive:0.95}); bulb.position.y=0.24; bulb.parent=root; bulb.isPickable=false;
      var lcap=BABYLON.MeshBuilder.CreateCylinder('lcap',{diameterTop:0,diameterBottom:0.3,height:0.16,tessellation:8},scene); lcap.material=lmetal; lcap.position.y=0.52; lcap.parent=root; lcap.isPickable=false;
    } else if(p.kind==='water'){
      root=BABYLON.MeshBuilder.CreateBox('wcol',{size:0.94},scene); root.visibility=0; root.isPickable=true;
      var wat=BABYLON.MeshBuilder.CreateBox('water',{width:1.001,height:0.28,depth:1.001},scene);
      var wm2=mat('#2f8fd8',{alpha:0.82,emissive:0.1}); wm2.specularColor=new BABYLON.Color3(0.72,0.86,1); wm2.specularPower=48;
      wat.material=wm2; wat.position.y=-0.5; wat.parent=root; wat.isPickable=false; wat.receiveShadows=true;
      var wob=scene.onBeforeRenderObservable.add(function(){ if(wat.isDisposed()){ scene.onBeforeRenderObservable.remove(wob); return; } wat.position.y=-0.5+Math.sin(performance.now()/720)*0.015; });
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
    root.metadata.rot=rot||0;
    if(rot) root.rotation.y=(root.rotation.y||0)+rot*Math.PI/2;
    popIn(root);
    return root;
  }

  function buildDecor(kind, root, color){
    if(kind==='tree'){
      var tr=BABYLON.MeshBuilder.CreateCylinder('tr',{diameterTop:0.16,diameterBottom:0.26,height:0.66,tessellation:8},scene); tr.material=mat('#7a4a24'); tr.position.y=-0.2; tr.parent=root; tr.isPickable=false; addCaster(tr);
      var tg1=mat('#3f9a4a'), tg2=mat('#58c162');
      [[0,0.28,0,0.86,tg1],[-0.28,0.16,0.06,0.56,tg2],[0.28,0.14,-0.05,0.54,tg2],[0.06,0.52,-0.04,0.5,tg2],[-0.05,0.34,-0.24,0.44,tg1]].forEach(function(q){ var lv=BABYLON.MeshBuilder.CreateSphere('lv',{diameter:q[3],segments:8},scene); lv.scaling.y=0.92; lv.position.set(q[0],q[1],q[2]); lv.material=q[4]; lv.parent=root; lv.isPickable=false; addCaster(lv); });
    } else if(kind==='flower'){
      var st=BABYLON.MeshBuilder.CreateCylinder('st',{diameter:0.08,height:0.6,tessellation:6},scene); st.material=mat('#3fae52'); st.position.y=-0.18; st.parent=root; st.isPickable=false; addCaster(st);
      [[-0.16,-0.04,0.5],[0.16,-0.12,-0.5]].forEach(function(l){ var lf=BABYLON.MeshBuilder.CreateSphere('lf',{diameter:0.26,segments:6},scene); lf.scaling.set(1,0.26,0.62); lf.position.set(l[0],l[1],0); lf.rotation.y=l[2]; lf.material=mat('#4fbf5a'); lf.parent=root; lf.isPickable=false; });
      var fpm=mat(color||'#ff6eb4',{emissive:0.12});
      for(var fi=0;fi<6;fi++){ var fa=fi/6*6.28; var pet=BABYLON.MeshBuilder.CreateSphere('pet',{diameter:0.26,segments:7},scene); pet.scaling.set(1,0.5,0.62); pet.position.set(Math.cos(fa)*0.17,0.2,Math.sin(fa)*0.17); pet.material=fpm; pet.parent=root; pet.isPickable=false; }
      var fcr=BABYLON.MeshBuilder.CreateSphere('cr',{diameter:0.2,segments:8},scene); fcr.scaling.y=0.7; fcr.material=mat('#ffd84d',{emissive:0.3}); fcr.position.y=0.22; fcr.parent=root; fcr.isPickable=false;
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
      var stem=BABYLON.MeshBuilder.CreateCylinder('ms',{diameterTop:0.22,diameterBottom:0.3,height:0.4,tessellation:12},scene); stem.material=mat('#f4ece0'); stem.position.y=-0.22; stem.parent=root; stem.isPickable=false; addCaster(stem);
      var cap=BABYLON.MeshBuilder.CreateSphere('mc',{diameter:0.66,segments:12},scene); cap.scaling.y=0.62; cap.material=mat('#e0574a',{emissive:0.08}); cap.position.y=0.03; cap.parent=root; cap.isPickable=false; addCaster(cap);
      [[0.16,0.09,0.08],[-0.14,0.11,-0.06],[0.02,0.17,-0.16],[-0.1,0.06,0.18]].forEach(function(sp){ var dot=BABYLON.MeshBuilder.CreateSphere('mp',{diameter:0.12,segments:6},scene); dot.scaling.y=0.5; dot.position.set(sp[0],sp[1],sp[2]); dot.material=mat('#fdf6ec',{emissive:0.15}); dot.parent=root; dot.isPickable=false; });
    } else if(kind==='bush'){
      var bm=mat('#3f9a4a'), bm2=mat('#58c162');
      [[0,-0.14,0,0.6,bm],[0.26,-0.06,0.08,0.5,bm2],[-0.24,-0.08,-0.06,0.5,bm],[0.05,0.14,-0.1,0.52,bm2],[-0.12,0.1,0.16,0.42,bm2]].forEach(function(q){ var s=BABYLON.MeshBuilder.CreateSphere('bs',{diameter:q[3],segments:8},scene); s.position.set(q[0],q[1],q[2]); s.material=q[4]; s.parent=root; s.isPickable=false; addCaster(s); });
      [[0.18,0.03,0.1],[-0.16,0.12,-0.08],[0.02,0.2,0.14]].forEach(function(b){ var berry=BABYLON.MeshBuilder.CreateSphere('by',{diameter:0.1,segments:6},scene); berry.position.set(b[0],b[1],b[2]); berry.material=mat('#ff5a6a',{emissive:0.2}); berry.parent=root; berry.isPickable=false; });
    } else if(kind==='stairs'){
      var sm=mat(color||'#b07a42');
      [[0.9,0.31,0.9,0,-0.34,0],[0.9,0.31,0.6,0,-0.02,-0.15],[0.9,0.31,0.3,0,0.3,-0.3]].forEach(function(s){
        var b=BABYLON.MeshBuilder.CreateBox('sts',{width:s[0],height:s[1],depth:s[2]},scene); b.material=sm; b.position.set(s[3],s[4],s[5]); b.parent=root; b.isPickable=false; b.receiveShadows=true; addCaster(b);
      });
    } else if(kind==='slab'){
      var slb=BABYLON.MeshBuilder.CreateBox('slb',{width:0.92,height:0.46,depth:0.92},scene); slb.material=mat(color||'#9aa6b4'); slb.position.y=-0.24; slb.parent=root; slb.isPickable=false; slb.receiveShadows=true; addCaster(slb);
    } else if(kind==='pillar'){
      var pm=mat(color||'#f2e9ff');
      var shaft=BABYLON.MeshBuilder.CreateBox('psh',{width:0.32,height:0.94,depth:0.32},scene); shaft.material=pm; shaft.parent=root; shaft.isPickable=false; shaft.receiveShadows=true; addCaster(shaft);
      var pba=BABYLON.MeshBuilder.CreateBox('pba',{width:0.54,height:0.14,depth:0.54},scene); pba.material=pm; pba.position.y=-0.4; pba.parent=root; pba.isPickable=false; addCaster(pba);
      var pca=BABYLON.MeshBuilder.CreateBox('pca',{width:0.54,height:0.14,depth:0.54},scene); pca.material=pm; pca.position.y=0.4; pca.parent=root; pca.isPickable=false; addCaster(pca);
    } else if(kind==='fence'){
      var fm=mat(color||'#b07a42');
      [-0.34,0.34].forEach(function(px){ var po=BABYLON.MeshBuilder.CreateBox('fp',{width:0.14,height:0.78,depth:0.14},scene); po.material=fm; po.position.set(px,-0.08,0); po.parent=root; po.isPickable=false; po.receiveShadows=true; addCaster(po); });
      [0.12,-0.16].forEach(function(py){ var ra=BABYLON.MeshBuilder.CreateBox('fr',{width:0.86,height:0.12,depth:0.1},scene); ra.material=fm; ra.position.set(0,py,0); ra.parent=root; ra.isPickable=false; addCaster(ra); });
    } else if(kind==='campfire'){
      var stonem=mat('#8a8f98'), logm=mat('#7a4a24');
      for(var ci=0;ci<7;ci++){ var a=ci/7*6.28; var stn=BABYLON.MeshBuilder.CreateSphere('cs',{diameter:0.2,segments:6},scene); stn.scaling.y=0.55; stn.position.set(Math.cos(a)*0.34,-0.44,Math.sin(a)*0.34); stn.material=stonem; stn.parent=root; stn.isPickable=false; addCaster(stn); }
      [0,1,2].forEach(function(k){ var lg=BABYLON.MeshBuilder.CreateCylinder('lg',{diameter:0.12,height:0.7,tessellation:6},scene); lg.material=logm; lg.position.y=-0.2; lg.rotation.z=0.5; lg.rotation.y=k*2.1; lg.parent=root; lg.isPickable=false; addCaster(lg); });
      var flame=BABYLON.MeshBuilder.CreateCylinder('fl',{diameterTop:0,diameterBottom:0.32,height:0.52,tessellation:8},scene); flame.material=mat('#ff7a1a',{emissive:0.95}); flame.position.y=0.06; flame.parent=root; flame.isPickable=false;
      var flame2=BABYLON.MeshBuilder.CreateCylinder('fl2',{diameterTop:0,diameterBottom:0.16,height:0.32,tessellation:8},scene); flame2.material=mat('#ffd23a',{emissive:1}); flame2.position.y=0.0; flame2.parent=root; flame2.isPickable=false;
      var ft=Math.random()*6.28; var fob=scene.onBeforeRenderObservable.add(function(){ if(flame.isDisposed()){ scene.onBeforeRenderObservable.remove(fob); return; } var t=performance.now(); flame.scaling.set(1,1+Math.sin(t/90+ft)*0.15,1); flame2.scaling.set(1,1+Math.sin(t/70+ft)*0.22,1); });
    } else if(kind==='present'){
      var pc=color||'#ff4d7d', bx=mat(pc), rb=mat('#ffe14d',{emissive:0.15});
      var gbox=BABYLON.MeshBuilder.CreateBox('gb',{width:0.7,height:0.7,depth:0.7},scene); gbox.material=bx; gbox.position.y=-0.1; gbox.parent=root; gbox.isPickable=false; gbox.receiveShadows=true; addCaster(gbox);
      var rb1=BABYLON.MeshBuilder.CreateBox('rb1',{width:0.74,height:0.72,depth:0.16},scene); rb1.material=rb; rb1.position.y=-0.1; rb1.parent=root; rb1.isPickable=false;
      var rb2=BABYLON.MeshBuilder.CreateBox('rb2',{width:0.16,height:0.72,depth:0.74},scene); rb2.material=rb; rb2.position.y=-0.1; rb2.parent=root; rb2.isPickable=false;
      [[-0.1,0.09],[0.1,0.09],[0,-0.09]].forEach(function(pp){ var bw=BABYLON.MeshBuilder.CreateSphere('bw',{diameter:0.2,segments:8},scene); bw.material=rb; bw.position.set(pp[0],0.3,pp[1]); bw.parent=root; bw.isPickable=false; });
    } else if(kind==='lollipop'){
      var stick=BABYLON.MeshBuilder.CreateCylinder('ls',{diameter:0.07,height:0.72,tessellation:8},scene); stick.material=mat('#fdf6ec'); stick.position.y=-0.2; stick.parent=root; stick.isPickable=false; addCaster(stick);
      var candy=BABYLON.MeshBuilder.CreateCylinder('lc',{diameter:0.5,height:0.12,tessellation:20},scene); candy.material=mat(color||'#ff5aa8',{emissive:0.18}); candy.rotation.x=Math.PI/2; candy.position.y=0.28; candy.parent=root; candy.isPickable=false; addCaster(candy);
      var swirl=BABYLON.MeshBuilder.CreateTorus('lsw',{diameter:0.3,thickness:0.06,tessellation:16},scene); swirl.material=mat('#ffffff',{emissive:0.25}); swirl.rotation.x=Math.PI/2; swirl.position.y=0.29; swirl.parent=root; swirl.isPickable=false;
    } else if(kind==='rocket'){
      var bodyc=mat(color||'#eef2f7'), redm=mat('#e0574a');
      var rbod=BABYLON.MeshBuilder.CreateCylinder('rk',{diameter:0.4,height:0.66,tessellation:16},scene); rbod.material=bodyc; rbod.position.y=-0.05; rbod.parent=root; rbod.isPickable=false; addCaster(rbod);
      var rnose=BABYLON.MeshBuilder.CreateCylinder('rn',{diameterTop:0,diameterBottom:0.4,height:0.34,tessellation:16},scene); rnose.material=redm; rnose.position.y=0.42; rnose.parent=root; rnose.isPickable=false;
      var rwin=BABYLON.MeshBuilder.CreateSphere('rw',{diameter:0.18,segments:10},scene); rwin.material=mat('#6fd0ff',{emissive:0.3}); rwin.position.set(0,0.05,0.19); rwin.scaling.z=0.5; rwin.parent=root; rwin.isPickable=false;
      [0,1,2].forEach(function(k){ var fin=BABYLON.MeshBuilder.CreateCylinder('rf',{diameterTop:0,diameterBottom:0.2,height:0.3,tessellation:4},scene); fin.material=redm; fin.rotation.x=Math.PI; fin.position.set(Math.cos(k*2.1)*0.2,-0.34,Math.sin(k*2.1)*0.2); fin.parent=root; fin.isPickable=false; });
      var rflame=BABYLON.MeshBuilder.CreateCylinder('rfl',{diameterTop:0,diameterBottom:0.24,height:0.3,tessellation:8},scene); rflame.material=mat('#ffb02e',{emissive:0.95}); rflame.rotation.x=Math.PI; rflame.position.y=-0.42; rflame.parent=root; rflame.isPickable=false;
      var rt=Math.random()*6.28; var rob=scene.onBeforeRenderObservable.add(function(){ if(rflame.isDisposed()){ scene.onBeforeRenderObservable.remove(rob); return; } rflame.scaling.set(1,1+Math.sin(performance.now()/60+rt)*0.3,1); });
    } else if(kind==='fountain'){
      var fstone=mat('#b8bcc4'), fwater=mat('#3aa0e0',{alpha:0.82,emissive:0.14});
      var fbase=BABYLON.MeshBuilder.CreateCylinder('fb',{diameter:0.92,height:0.18,tessellation:20},scene); fbase.material=fstone; fbase.position.y=-0.42; fbase.parent=root; fbase.isPickable=false; fbase.receiveShadows=true; addCaster(fbase);
      var frim=BABYLON.MeshBuilder.CreateTorus('frm',{diameter:0.86,thickness:0.12,tessellation:20},scene); frim.material=fstone; frim.position.y=-0.32; frim.parent=root; frim.isPickable=false;
      var fw1=BABYLON.MeshBuilder.CreateCylinder('fw',{diameter:0.72,height:0.08,tessellation:20},scene); fw1.material=fwater; fw1.position.y=-0.33; fw1.parent=root; fw1.isPickable=false;
      var fpost=BABYLON.MeshBuilder.CreateCylinder('fp',{diameter:0.16,height:0.4,tessellation:10},scene); fpost.material=fstone; fpost.position.y=-0.12; fpost.parent=root; fpost.isPickable=false; addCaster(fpost);
      var fbowl=BABYLON.MeshBuilder.CreateCylinder('fbw',{diameterTop:0.5,diameterBottom:0.2,height:0.14,tessellation:18},scene); fbowl.material=fstone; fbowl.position.y=0.08; fbowl.parent=root; fbowl.isPickable=false;
      var fw2=BABYLON.MeshBuilder.CreateCylinder('fw2',{diameter:0.4,height:0.06,tessellation:18},scene); fw2.material=fwater; fw2.position.y=0.12; fw2.parent=root; fw2.isPickable=false;
      var fjet=BABYLON.MeshBuilder.CreateCylinder('fj',{diameter:0.06,height:0.3,tessellation:8},scene); fjet.material=fwater; fjet.position.y=0.32; fjet.parent=root; fjet.isPickable=false;
      var fdrops=[]; for(var di=0;di<4;di++){ var dp=BABYLON.MeshBuilder.CreateSphere('fd',{diameter:0.08,segments:6},scene); dp.material=fwater; dp.parent=root; dp.isPickable=false; fdrops.push(dp); }
      var job=scene.onBeforeRenderObservable.add(function(){ if(fjet.isDisposed()){ scene.onBeforeRenderObservable.remove(job); return; } var t=performance.now()/300; fjet.scaling.set(1,1+Math.sin(t*2)*0.15,1); fdrops.forEach(function(dp,i){ var ph=(t+i/4)%1, a=i/4*6.28; dp.position.set(Math.cos(a)*ph*0.34, 0.46-ph*ph*0.72, Math.sin(a)*ph*0.34); dp.scaling.setAll(1-ph*0.5); }); });
    } else if(kind==='pine'){
      var ptr=BABYLON.MeshBuilder.CreateCylinder('pt',{diameterTop:0.12,diameterBottom:0.2,height:0.44,tessellation:7},scene); ptr.material=mat('#6b4a2a'); ptr.position.y=-0.3; ptr.parent=root; ptr.isPickable=false; addCaster(ptr);
      var pgn=mat('#2f7d43');
      [[0.62,-0.04],[0.5,0.18],[0.36,0.38],[0.22,0.54]].forEach(function(c){ var cone=BABYLON.MeshBuilder.CreateCylinder('pc',{diameterTop:0,diameterBottom:c[0],height:0.34,tessellation:8},scene); cone.material=pgn; cone.position.y=c[1]; cone.parent=root; cone.isPickable=false; addCaster(cone); });
    } else if(kind==='rock'){
      var rm=mat('#9aa1ab'), rm2=mat('#7f8790');
      [[0,-0.16,0,0.6,rm,1,0.7,1],[0.24,-0.1,0.14,0.42,rm2,1.1,0.8,0.9],[-0.22,-0.14,-0.1,0.36,rm2,0.9,0.7,1.1]].forEach(function(q){ var s=BABYLON.MeshBuilder.CreateSphere('rk',{diameter:q[3],segments:6},scene); s.position.set(q[0],q[1],q[2]); s.scaling.set(q[5],q[6],q[7]); s.material=q[4]; s.parent=root; s.isPickable=false; addCaster(s); });
    } else if(kind==='bench'){
      var bwm=mat('#a9763f'), bmm=mat('#4a4f57');
      var seat=BABYLON.MeshBuilder.CreateBox('bs',{width:0.86,height:0.08,depth:0.34},scene); seat.material=bwm; seat.position.set(0,-0.1,0.02); seat.parent=root; seat.isPickable=false; addCaster(seat);
      var back=BABYLON.MeshBuilder.CreateBox('bbk',{width:0.86,height:0.3,depth:0.07},scene); back.material=bwm; back.position.set(0,0.12,-0.14); back.parent=root; back.isPickable=false; addCaster(back);
      [[-0.36,0.12],[0.36,0.12],[-0.36,-0.12],[0.36,-0.12]].forEach(function(p){ var l=BABYLON.MeshBuilder.CreateBox('bl',{width:0.07,height:0.34,depth:0.07},scene); l.material=bmm; l.position.set(p[0],-0.3,p[1]); l.parent=root; l.isPickable=false; });
    } else if(kind==='table'){
      var twm=mat('#c8975a'), tmm=mat('#3f434b');
      var top=BABYLON.MeshBuilder.CreateCylinder('tt',{diameter:0.66,height:0.08,tessellation:16},scene); top.material=twm; top.position.y=0.14; top.parent=root; top.isPickable=false; addCaster(top);
      var leg=BABYLON.MeshBuilder.CreateCylinder('tl',{diameter:0.1,height:0.5,tessellation:8},scene); leg.material=tmm; leg.position.y=-0.14; leg.parent=root; leg.isPickable=false;
      var tbb=BABYLON.MeshBuilder.CreateCylinder('tbb',{diameter:0.4,height:0.06,tessellation:12},scene); tbb.material=tmm; tbb.position.y=-0.4; tbb.parent=root; tbb.isPickable=false;
      [-0.42,0.42].forEach(function(sx){ var sts=BABYLON.MeshBuilder.CreateCylinder('ts',{diameter:0.26,height:0.07,tessellation:12},scene); sts.material=twm; sts.position.set(sx,-0.12,0); sts.parent=root; sts.isPickable=false; addCaster(sts); var sl=BABYLON.MeshBuilder.CreateCylinder('tsl',{diameter:0.06,height:0.32,tessellation:6},scene); sl.material=tmm; sl.position.set(sx,-0.3,0); sl.parent=root; sl.isPickable=false; });
    } else if(kind==='streetlamp'){
      var lmm=mat('#2b2f37');
      var lbs=BABYLON.MeshBuilder.CreateCylinder('slb',{diameterTop:0.14,diameterBottom:0.3,height:0.16,tessellation:12},scene); lbs.material=lmm; lbs.position.y=-0.42; lbs.parent=root; lbs.isPickable=false; addCaster(lbs);
      var lpole=BABYLON.MeshBuilder.CreateCylinder('slp',{diameter:0.08,height:0.86,tessellation:8},scene); lpole.material=lmm; lpole.position.y=0.04; lpole.parent=root; lpole.isPickable=false; addCaster(lpole);
      var lhood=BABYLON.MeshBuilder.CreateCylinder('slh',{diameterTop:0.06,diameterBottom:0.26,height:0.14,tessellation:10},scene); lhood.material=lmm; lhood.position.y=0.5; lhood.parent=root; lhood.isPickable=false;
      var lbulb=BABYLON.MeshBuilder.CreateSphere('slbl',{diameter:0.2,segments:10},scene); lbulb.material=mat('#fff2a8',{emissive:1}); lbulb.position.y=0.42; lbulb.parent=root; lbulb.isPickable=false;
    } else if(kind==='car'){
      var cbm=mat(color||'#ff5a6a',{emissive:0.05}), cdk=mat('#20262e');
      var cbody=BABYLON.MeshBuilder.CreateBox('cb',{width:0.92,height:0.26,depth:0.5},scene); cbody.material=cbm; cbody.position.y=-0.06; cbody.parent=root; cbody.isPickable=false; addCaster(cbody);
      var ccab=BABYLON.MeshBuilder.CreateBox('cc',{width:0.5,height:0.24,depth:0.46},scene); ccab.material=cbm; ccab.position.set(-0.04,0.16,0); ccab.parent=root; ccab.isPickable=false;
      var cwin=BABYLON.MeshBuilder.CreateBox('cw',{width:0.44,height:0.17,depth:0.48},scene); cwin.material=mat('#bfe4ff',{alpha:0.72,emissive:0.1}); cwin.position.set(-0.04,0.17,0); cwin.parent=root; cwin.isPickable=false;
      [[0.28,0.22],[0.28,-0.22],[-0.28,0.22],[-0.28,-0.22]].forEach(function(p){ var w=BABYLON.MeshBuilder.CreateCylinder('cwh',{diameter:0.24,height:0.11,tessellation:12},scene); w.material=cdk; w.rotation.x=Math.PI/2; w.position.set(p[0],-0.2,p[1]); w.parent=root; w.isPickable=false; });
      [-0.15,0.15].forEach(function(hz){ var hl=BABYLON.MeshBuilder.CreateSphere('chl',{diameter:0.1,segments:8},scene); hl.material=mat('#fff2a8',{emissive:0.7}); hl.scaling.x=0.5; hl.position.set(0.47,-0.04,hz); hl.parent=root; hl.isPickable=false; });
    } else if(kind==='well'){
      var wsm=mat('#9aa1ab'), wwm=mat('#7a4a2a'), watm=mat('#2f7fd6',{alpha:0.82,emissive:0.12});
      var wring=BABYLON.MeshBuilder.CreateCylinder('wr',{diameter:0.66,height:0.4,tessellation:16},scene); wring.material=wsm; wring.position.y=-0.28; wring.parent=root; wring.isPickable=false; addCaster(wring);
      var wwat=BABYLON.MeshBuilder.CreateCylinder('ww',{diameter:0.5,height:0.06,tessellation:16},scene); wwat.material=watm; wwat.position.y=-0.12; wwat.parent=root; wwat.isPickable=false;
      [-0.28,0.28].forEach(function(px){ var post=BABYLON.MeshBuilder.CreateBox('wp',{width:0.07,height:0.52,depth:0.07},scene); post.material=wwm; post.position.set(px,0.17,0); post.parent=root; post.isPickable=false; addCaster(post); });
      var wroof1=BABYLON.MeshBuilder.CreateBox('wrf',{width:0.72,height:0.06,depth:0.42},scene); wroof1.material=mat('#c0503f'); wroof1.position.set(0,0.42,0); wroof1.rotation.z=0.32; wroof1.parent=root; wroof1.isPickable=false;
      var wroof2=wroof1.clone('wrf2'); wroof2.rotation.z=-0.32; wroof2.parent=root;
      var wbk=BABYLON.MeshBuilder.CreateCylinder('wbk',{diameterTop:0.16,diameterBottom:0.13,height:0.14,tessellation:10},scene); wbk.material=wwm; wbk.position.set(0,0.14,0); wbk.parent=root; wbk.isPickable=false;
    } else if(kind==='stall'){
      var smw=mat('#a9763f'), smc=mat('#8a5a2b');
      var counter=BABYLON.MeshBuilder.CreateBox('mc',{width:0.86,height:0.34,depth:0.3},scene); counter.material=smw; counter.position.set(0,-0.16,0.22); counter.parent=root; counter.isPickable=false; addCaster(counter);
      [-0.38,0.38].forEach(function(px){ var post=BABYLON.MeshBuilder.CreateBox('mp',{width:0.07,height:0.86,depth:0.07},scene); post.material=smc; post.position.set(px,0.05,-0.28); post.parent=root; post.isPickable=false; addCaster(post); });
      for(var si=0;si<5;si++){ var scol= (si%2)? '#f4f4f4':'#e0574a'; var str=BABYLON.MeshBuilder.CreateBox('ma',{width:0.17,height:0.05,depth:0.5},scene); str.material=mat(scol); str.position.set(-0.34+si*0.17,0.45,-0.03); str.rotation.x=-0.34; str.parent=root; str.isPickable=false; }
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

  /* ---------- big drop-in structures (multi-tile, walk-in) ---------- */
  function placeStructure(id, cx, cz, foot, tall, rot, color){
    var root=new BABYLON.TransformNode('struct',scene); root.position.set(cx,0,cz); if(rot) root.rotation.y=rot*Math.PI/2;
    var half=foot/2, th=0.26;
    var wallC = id==='tower' ? '#c2c7cf' : (id==='store' ? (color||'#ead1a8') : '#efe3cf');
    var roofC = id==='tower' ? '#8a9099' : (id==='store' ? '#3a7d5a' : '#c85042');
    var wm=mat(wallC), rfm=mat(roofC), trimM=mat('#7a5230'), glass=mat('#a6d4ff',{alpha:0.55,emissive:0.18});
    function box(w,h,d,x,y,z,m,cast){ var b=BABYLON.MeshBuilder.CreateBox('sw',{width:w,height:h,depth:d},scene); b.material=m; b.position.set(x,y,z); b.parent=root; b.isPickable=true; b.receiveShadows=true; if(cast!==false) addCaster(b); return b; }
    box(th, tall, foot, -half, tall/2, 0, wm);
    box(th, tall, foot,  half, tall/2, 0, wm);
    box(foot, tall, th, 0, tall/2, half, wm);
    var dg=0.75, segW=half-dg;
    if(segW>0.06){ box(segW, tall, th, -(dg+segW/2), tall/2, -half, wm); box(segW, tall, th, (dg+segW/2), tall/2, -half, wm); }
    var doorH=1.9; if(tall>doorH+0.12){ box(2*dg+0.14, tall-doorH, th, 0, doorH+(tall-doorH)/2, -half, wm); }
    box(2*dg+0.26, 0.14, th+0.06, 0, doorH, -half, trimM);
    [-half,half].forEach(function(wx){ var win=BABYLON.MeshBuilder.CreateBox('swn',{width:0.07,height:0.7,depth:0.8},scene); win.material=glass; win.position.set(wx, tall*0.55, 0); win.parent=root; win.isPickable=false; });
    var bwin=BABYLON.MeshBuilder.CreateBox('swn',{width:0.9,height:0.7,depth:0.07},scene); bwin.material=glass; bwin.position.set(0, tall*0.55, half); bwin.parent=root; bwin.isPickable=false;
    if(id==='tower'){
      for(var e=-half; e<=half+0.01; e+=0.5){ [[e,-half],[e,half],[-half,e],[half,e]].forEach(function(p){ box(0.3,0.34,0.3,p[0],tall+0.14,p[1],wm,false); }); }
      box(foot, 0.16, foot, 0, tall+0.02, 0, wm, false);
    } else {
      var roofH=foot*0.5;
      var roof=BABYLON.MeshBuilder.CreateCylinder('sr',{diameterTop:0, diameterBottom:foot*1.44, height:roofH, tessellation:4},scene);
      roof.rotation.y=Math.PI/4; roof.material=rfm; roof.position.set(0, tall+roofH/2, 0); roof.parent=root; roof.isPickable=true; addCaster(roof);
    }
    if(id==='store'){ for(var si=0;si<5;si++){ var scol=(si%2)?'#f4f4f4':'#e0574a'; var str=BABYLON.MeshBuilder.CreateBox('saw',{width:0.34,height:0.06,depth:0.6},scene); str.material=mat(scol); str.position.set(-0.68+si*0.34, doorH+0.22, -half-0.28); str.rotation.x=-0.34; str.parent=root; str.isPickable=false; } }
    root.metadata={structure:{id:id, cx:cx, cz:cz, foot:foot}};
    popIn(root);
    return root;
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
    for(var mm=m; mm; mm=mm.parent){ if(mm.metadata){ if(mm.metadata.mob) return {type:'mob', mob:mm.metadata.mob}; if(mm.metadata.critter) return {type:'critter', critter:mm.metadata.critter}; if(mm.metadata.structure) return {type:'structure', root:mm}; } }
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
  function showGhostAt(cell,color,rot){
    ensureGhost();
    var c=BABYLON.Color3.FromHexString(color||'#f2e9ff');
    ghostMat.diffuseColor=c; ghostMat.emissiveColor=c.scale(0.45);
    ghostMesh.position.set(cell.x, cell.y+0.5, cell.z);
    ghostMesh.rotation.y=(rot||0)*Math.PI/2;
    ghostMesh.setEnabled(true);
  }
  function hideGhost(){ if(ghostMesh) ghostMesh.setEnabled(false); }

  function frameCamera(){ camera.alpha=-Math.PI/2+0.7; camera.beta=1.0; camera.radius=Math.max(28, HALF*2.4+10); camera.target=new BABYLON.Vector3(0,2,0); }
  function setYardSize(h){
    h=Math.max(6, Math.min(40, h|0));
    HALF=h; BO.HALF=HALF;
    buildPlatform();
    buildFence();
    if(crateRoot){ crateRoot.position.x=-(HALF+2); crateRoot.position.z=-(HALF+2); }
    if(mode==='walk' && walkCam){ var lim=HALF+4;
      walkCam.position.x=Math.max(-lim,Math.min(lim,walkCam.position.x));
      walkCam.position.z=Math.max(-lim,Math.min(lim,walkCam.position.z));
    } else { frameCamera(); }
  }

  function setMode(m){
    mode=m;
    keys={}; lookJoy.x=0; lookJoy.y=0; joy.x=0; joy.z=0;   // never carry stale input across mode switches
    if(m==='walk'){
      camera.detachControl();
      walkCam.position=new BABYLON.Vector3(0,1.6,-(HALF-1));
      walkCam.rotation=new BABYLON.Vector3(0,0,0);
      py=floorFn(0,-(HALF-1)); vy=0; grounded=true; walkCam.position.y=py+1.6;
      scene.activeCamera=walkCam;
    } else {
      joy.x=0; joy.z=0;
      scene.activeCamera=camera;
      camera.detachControl();
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
    showGhostAt:showGhostAt, hideGhost:hideGhost, potPlant:potPlant, potWater:potWater, getPot:getPot, petFriend:petFriend,
    placeStructure:placeStructure,
    getScene:function(){ return scene; },
    getPlayerPos:function(){ return (mode==='walk'&&walkCam) ? walkCam.position.clone() : (camera?camera.target.clone():new BABYLON.Vector3(0,0,0)); },
    isWalking:function(){ return mode==='walk'; },
    floorAt:function(x,z){ return floorFn(x,z); },
    addShadow:function(m){ addCaster(m); },
    rmShadow:function(m){ if(shadow) shadow.removeShadowCaster(m); },
    knockbackPlayer:function(nx,nz,amt){ if(mode!=='walk'||!walkCam) return; var lim=HALF+4; walkCam.position.x=Math.max(-lim,Math.min(lim,walkCam.position.x+nx*amt)); walkCam.position.z=Math.max(-lim,Math.min(lim,walkCam.position.z+nz*amt)); },
    makeEmojiPlane:makeEmojiPlane, popIn:popIn };
})();
