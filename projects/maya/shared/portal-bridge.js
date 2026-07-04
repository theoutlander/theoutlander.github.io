(function () {
  'use strict';

  // Each game lives in its own folder (/maya/games/<slug>/index.html) and declares
  // its play-key via window.MAYA_GAME (e.g. 'games/pipe-flow/index.html') before
  // loading this script. We strip that key off the current path to find the lab
  // root, so "back to lab" works no matter how deep the game folder is.
  function currentGameKey() {
    return (typeof window.MAYA_GAME === 'string' && window.MAYA_GAME) || null;
  }

  var gameKey = currentGameKey();

  function labIndexUrl() {
    var p = location.pathname;
    if (gameKey && p.length >= gameKey.length && p.slice(-gameKey.length) === gameKey) {
      return p.slice(0, -gameKey.length) + 'index.html';
    }
    return '../../index.html'; // fallback: games/<slug>/index.html is two levels deep
  }

  function inMayaPortal() {
    if (window.parent === window) return false;
    try {
      return !!window.parent.document.getElementById('gf');
    } catch (e) {
      return true;
    }
  }

  if (gameKey && window.parent === window) {
    try {
      if (new URLSearchParams(location.search).get('standalone') !== '1') {
        var target = labIndexUrl() + '?play=' + encodeURIComponent(gameKey);
        if (location.hash) target += location.hash;
        location.replace(target);
        return;
      }
    } catch (e) {}
  }

  function leaveToLab() {
    if (inMayaPortal()) {
      try {
        window.parent.postMessage('maya:leave-game', '*');
      } catch (e) {}
      return;
    }
    window.location.href = labIndexUrl();
  }

  function notifyScreen(name) {
    if (!inMayaPortal()) return;
    try {
      window.parent.postMessage({ type: 'maya:screen', screen: name }, '*');
    } catch (e) {}
  }

  function applyPortalChrome() {
    if (!inMayaPortal()) return;
    document.documentElement.classList.add('maya-in-portal');
    if (document.getElementById('maya-portal-chrome')) return;
    var style = document.createElement('style');
    style.id = 'maya-portal-chrome';
    style.textContent = 'html.maya-in-portal .maya-portal-hide{display:none!important}';
    (document.head || document.documentElement).appendChild(style);
  }

  applyPortalChrome();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPortalChrome);
  }

  window.MayaPortal = {
    inMayaPortal: inMayaPortal,
    leaveToLab: leaveToLab,
    notifyScreen: notifyScreen,
    labIndexUrl: labIndexUrl,
    gameKey: gameKey,
    gameFile: gameKey,
  };
})();
