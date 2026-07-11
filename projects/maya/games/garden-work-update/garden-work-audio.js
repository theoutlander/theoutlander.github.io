/* ===== Garden Work — sound + gentle background music (Web Audio) ===== */
(function(){
  var GW = window.GW = window.GW || {};
  var ctx=null, master=null, muted=false;
  try{ muted = localStorage.getItem('gardenwork_mute')==='1'; }catch(e){}

  function ac(){
    if(window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
    if(ctx) return ctx;
    try{
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value=0.55; master.connect(ctx.destination);
    }catch(e){ ctx=null; }
    return ctx;
  }
  function resume(){ var c=ac(); if(c&&c.state==='suspended') c.resume(); if(!muted) startMusic(); }

  function tone(freq, t0, dur, type, vol, slideTo){
    var c=ac(); if(!c||muted) return;
    var o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq, c.currentTime+t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime+t0+dur);
    g.gain.setValueAtTime(0.0001, c.currentTime+t0);
    g.gain.exponentialRampToValueAtTime(vol||0.3, c.currentTime+t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+t0+dur);
    o.connect(g); g.connect(master);
    o.start(c.currentTime+t0); o.stop(c.currentTime+t0+dur+0.02);
  }
  function noise(t0,dur,vol,lp){
    var c=ac(); if(!c||muted) return;
    var n=Math.floor(dur*c.sampleRate), buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
    for(var i=0;i<n;i++){ d[i]=(Math.random()*2-1)*(1-i/n); }
    var s=c.createBufferSource(); s.buffer=buf;
    var f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp||1200;
    var g=c.createGain(); g.gain.value=vol||0.18;
    s.connect(f); f.connect(g); g.connect(master);
    s.start(c.currentTime+t0);
  }

  GW.sfx = {
    click(){ tone(560,0,0.06,'triangle',0.16); },
    wood(){ tone(180,0,0.09,'square',0.22); noise(0,0.12,0.16,900); tone(120,0.04,0.12,'sine',0.2); },
    pour(){ noise(0,0.5,0.2,800); for(var i=0;i<6;i++) tone(160+i*8,i*0.06,0.12,'sine',0.08); },
    plant(){ tone(440,0,0.1,'sine',0.22,660); tone(660,0.08,0.12,'sine',0.18); },
    water(){ noise(0,0.45,0.14,1600); tone(900,0,0.1,'sine',0.1,500); tone(700,0.12,0.12,'sine',0.08,400); },
    sparkle(){ [880,1175,1568,2093].forEach(function(f,i){ tone(f,i*0.05,0.16,'triangle',0.15); }); },
    harvest(){ tone(523,0,0.09,'sine',0.2,784); tone(784,0.07,0.12,'sine',0.18); },
    coin(){ tone(988,0,0.07,'square',0.15); tone(1319,0.06,0.13,'square',0.15); },
    eat(){ tone(330,0,0.08,'sine',0.2,440); tone(392,0.06,0.1,'sine',0.18); tone(523,0.13,0.14,'sine',0.16); },
    day(){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.12,0.4,'sine',0.16); }); },
    night(){ [392,330,262].forEach(function(f,i){ tone(f,i*0.18,0.6,'sine',0.15); }); },
    win(){ [523,659,784,1047,1319].forEach(function(f,i){ tone(f,i*0.09,0.45,'triangle',0.18); }); }
  };

  /* ---- gentle, faint background music (soft pentatonic loop) ---- */
  var musicGain=null, musicTimer=null, beat=0;
  var MEL=[523.25,587.33,659.25,784.00,880.00,1046.50]; // C5 D5 E5 G5 A5 C6 (pentatonic = always pretty)
  var CHORDS=[[261.63,329.63,392.00],[293.66,349.23,440.00],[220.00,277.18,329.63],[246.94,311.13,392.00]];
  function mGain(){ if(!musicGain){ musicGain=ac().createGain(); musicGain.gain.value=0.5; musicGain.connect(master);} return musicGain; }
  function mnote(freq,dur,vol,type){
    var c=ac(); if(!c||muted) return;
    var o=c.createOscillator(), g=c.createGain();
    o.type=type||'triangle'; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,c.currentTime);
    g.gain.exponentialRampToValueAtTime(vol,c.currentTime+0.06);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    o.connect(g); g.connect(mGain());
    o.start(); o.stop(c.currentTime+dur+0.05);
  }
  function step(){
    if(muted){ return; }
    if(beat%8===0){ CHORDS[(beat/8)%CHORDS.length].forEach(function(f){ mnote(f,4.2,0.022,'sine'); }); }
    if(beat%2===0 && Math.random()<0.72){ mnote(MEL[(Math.random()*MEL.length)|0], 0.55, 0.045, 'triangle'); }
    beat++;
  }
  function startMusic(){ if(musicTimer||muted) return; var c=ac(); if(!c) return; beat=0; step(); musicTimer=setInterval(step, 540); }
  function stopMusic(){ if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } }
  GW.music={ start:startMusic, stop:stopMusic };

  GW.audio = {
    resume:resume,
    isMuted(){ return muted; },
    toggle(){
      muted=!muted;
      try{ localStorage.setItem('gardenwork_mute', muted?'1':'0'); }catch(e){}
      if(muted){ stopMusic(); } else { resume(); GW.sfx.click(); }
      return muted;
    }
  };
})();
