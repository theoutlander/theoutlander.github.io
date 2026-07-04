(function () {
  'use strict';

  var LAB_INDEX = 'index.html';

  function currentGameFile() {
    var last = (location.pathname.split('/').filter(Boolean).pop()) || '';
    if (!/\.html?$/i.test(last)) return null;
    if (/^index\.html?$/i.test(last)) return null;
    return last;
  }

  function labIndexUrl() {
    var p = location.pathname;
    var i = p.lastIndexOf('/');
    var base = i >= 0 ? p.slice(0, i + 1) : '/';
    return base + LAB_INDEX;
  }

  function inMayaPortal() {
    if (window.parent === window) return false;
    try {
      return !!window.parent.document.getElementById('gf');
    } catch (e) {
      return true;
    }
  }

  var gameFile = currentGameFile();
  if (gameFile && window.parent === window) {
    try {
      if (new URLSearchParams(location.search).get('standalone') !== '1') {
        var target = labIndexUrl() + '?play=' + encodeURIComponent(gameFile);
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
    gameFile: gameFile,
  };
})();
