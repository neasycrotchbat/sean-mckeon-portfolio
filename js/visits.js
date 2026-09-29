/* Visit notifications via ntfy.sh push topic.
   Fires only for real humans: crawlers don't execute JS, and we additionally
   require genuine interaction (pointer/scroll/touch/key) before anything is
   sent, and skip webdriver/bot user-agents. One "visit" ping per session,
   then a per-page summary of clicks and video playback on page exit. */
(function () {
  'use strict';

  var TOPIC = 'https://ntfy.sh/smck-visits-a06d81b24433';

  if (navigator.webdriver) return;
  if (/bot|crawl|spider|slurp|headless|lighthouse|prerender|preview|facebookexternalhit/i.test(navigator.userAgent)) return;
  var storage;
  try { storage = window.sessionStorage; storage.getItem('x'); } catch (e) { return; }

  var path = location.pathname;
  var events = [];        // per-page: clicks + video plays
  var watch = {};         // video name -> seconds watched
  var playStart = {};     // video name -> timestamp while playing
  var interacted = false;

  function post(text) {
    try {
      var blob = new Blob([text], { type: 'text/plain' });
      if (!(navigator.sendBeacon && navigator.sendBeacon(TOPIC, blob))) {
        fetch(TOPIC, { method: 'POST', body: text, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* never break the site over analytics */ }
  }

  function vidName(src) {
    var m = (src || '').match(/([^\/]+)\.mp4/);
    return m ? m[1] : 'video';
  }

  /* ---- session start: first genuine interaction of the session ---- */
  var moves = 0;
  function onFirstInteraction(e) {
    if (e.type === 'pointermove' && ++moves < 3) return; // a couple of real moves, not a synthetic one
    interacted = true;
    ['pointermove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(function (t) {
      window.removeEventListener(t, onFirstInteraction, true);
    });
    if (!storage.getItem('smckSession')) {
      storage.setItem('smckSession', String(Date.now()));
      var ref = document.referrer && document.referrer.indexOf(location.host) === -1 ? ' — from ' + document.referrer : '';
      post('Visit: landed on ' + path + ref + ' (' + window.innerWidth + 'x' + window.innerHeight + ')');
    }
  }
  ['pointermove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(function (t) {
    window.addEventListener(t, onFirstInteraction, true);
  });

  /* ---- clicks on links ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || !interacted) return;
    var label = (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 60);
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') return;
    events.push('clicked "' + (label || href) + '"');
  }, true);

  /* ---- self-hosted <video> playback ---- */
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO' || !v.controls) return; // ignore autoplaying cover loops
    var n = vidName(v.currentSrc || v.src);
    playStart[n] = performance.now();
    if (!(n in watch)) { watch[n] = 0; events.push('played ' + n); }
  }, true);
  function stopWatch(e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO' || !v.controls) return;
    var n = vidName(v.currentSrc || v.src);
    if (playStart[n]) { watch[n] += (performance.now() - playStart[n]) / 1000; playStart[n] = 0; }
  }
  document.addEventListener('pause', stopWatch, true);
  document.addEventListener('ended', stopWatch, true);

  /* ---- Vimeo iframes: play events via the player postMessage API ---- */
  var vimeoFrames = [].slice.call(document.querySelectorAll('iframe[src*="player.vimeo.com"]'));
  if (vimeoFrames.length) {
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://player.vimeo.com') return;
      var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
      if (d.event === 'ready') {
        vimeoFrames.forEach(function (f) {
          if (f.contentWindow === e.source) {
            f.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'play' }), 'https://player.vimeo.com');
          }
        });
      } else if (d.event === 'play') {
        var idx = vimeoFrames.findIndex(function (f) { return f.contentWindow === e.source; });
        var tag = 'vimeo embed' + (vimeoFrames.length > 1 ? ' #' + (idx + 1) : '');
        if (events.indexOf('played ' + tag) === -1) events.push('played ' + tag);
      }
    });
  }

  /* ---- per-page summary on exit ---- */
  var reported = false;
  function report() {
    if (reported || !interacted) return;
    Object.keys(playStart).forEach(function (n) {
      if (playStart[n]) { watch[n] += (performance.now() - playStart[n]) / 1000; playStart[n] = 0; }
    });
    var parts = [];
    Object.keys(watch).forEach(function (n) {
      if (watch[n] >= 1) parts.push('watched ' + n + ' ~' + Math.round(watch[n]) + 's');
    });
    events.forEach(function (ev) {
      if (ev.indexOf('played ') === 0 && watch[ev.slice(7)] >= 1) return; // superseded by watch time
      parts.push(ev);
    });
    if (!parts.length) return;
    reported = true;
    post('On ' + path + ': ' + parts.join('; ').slice(0, 900));
  }
  window.addEventListener('pagehide', report);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') report();
  });
})();
