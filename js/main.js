/* Sean McKeon — portfolio behavior.
   Vanilla port of the design-prototype component: weighted-random color
   scheme + picker, nav role ticker, hero name letter cycle, scroll reveals,
   Vimeo hero/preview embeds + oEmbed posters, interactive halftone portrait. */
(function () {
  'use strict';

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ============================ color schemes ============================ */

  var SCHEMES = {
    'cream-lime':       { bg: '#F1EEE7', bg2: '#E9E5DA', fg: '#13201A', muted: '#5F6B60', line: 'rgba(19,32,26,0.16)',    accent: '#A8E10C', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 60%,rgba(19,32,26,0.08) 100%)', shadow: '0 -40px 80px -20px rgba(19,32,26,0.18)' },
    'forest-dark':      { bg: '#0D1F18', bg2: '#12281F', fg: '#EDEBE2', muted: '#7E8C82', line: 'rgba(237,235,226,0.14)', accent: '#C0F250', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 55%,rgba(0,0,0,0.35) 100%)',   shadow: '0 -40px 80px -20px rgba(0,0,0,0.55)' },
    'ivory-cobalt':     { bg: '#F2F0EA', bg2: '#E9E7DF', fg: '#101014', muted: '#66666E', line: 'rgba(16,16,20,0.15)',    accent: '#2242FF', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 60%,rgba(16,16,20,0.07) 100%)', shadow: '0 -40px 80px -20px rgba(16,16,20,0.16)' },
    'sand-rust':        { bg: '#EFE7DA', bg2: '#E6DCCA', fg: '#231A10', muted: '#77685A', line: 'rgba(35,26,16,0.16)',    accent: '#C94F1E', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 60%,rgba(35,26,16,0.08) 100%)', shadow: '0 -40px 80px -20px rgba(35,26,16,0.18)' },
    'cortax-blue':      { bg: '#2B43F0', bg2: '#2338D6', fg: '#FFFFFF', muted: '#D4DBFA', line: 'rgba(255,255,255,0.28)', accent: '#FFD43B', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 55%,rgba(10,16,80,0.35) 100%)', shadow: '0 -40px 80px -20px rgba(10,16,80,0.5)' },
    'cortax-red':       { bg: '#E23A2E', bg2: '#D02E23', fg: '#FFFFFF', muted: '#FBDDD9', line: 'rgba(255,255,255,0.28)', accent: '#FFD43B', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 55%,rgba(80,10,6,0.35) 100%)',  shadow: '0 -40px 80px -20px rgba(80,10,6,0.5)' },
    'cortax-ink':       { bg: '#141414', bg2: '#1C1C1C', fg: '#F4F1EA', muted: '#9A968C', line: 'rgba(244,241,234,0.15)', accent: '#F0664A', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 55%,rgba(0,0,0,0.4) 100%)',   shadow: '0 -40px 80px -20px rgba(0,0,0,0.55)' },
    'porcelain-violet': { bg: '#EFECF4', bg2: '#E5E1EE', fg: '#181422', muted: '#6B6478', line: 'rgba(24,20,34,0.15)',    accent: '#6C4DF0', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 60%,rgba(24,20,34,0.08) 100%)', shadow: '0 -40px 80px -20px rgba(24,20,34,0.18)' },
    'graphite-teal':    { bg: '#121717', bg2: '#182020', fg: '#E9EFEE', muted: '#82908E', line: 'rgba(233,239,238,0.14)', accent: '#22D3C6', vig: 'radial-gradient(130% 100% at 50% 0%,transparent 55%,rgba(0,0,0,0.4) 100%)',   shadow: '0 -40px 80px -20px rgba(0,0,0,0.55)' }
  };

  // cream-lime, forest-dark, graphite-teal carry double weight
  var POOL = [
    'cream-lime', 'cream-lime',
    'forest-dark', 'forest-dark',
    'graphite-teal', 'graphite-teal',
    'ivory-cobalt', 'sand-rust', 'cortax-blue', 'cortax-red', 'cortax-ink', 'porcelain-violet'
  ];

  // black or white ink for text sitting on the accent color
  function inkFor(hex) {
    var h = (hex || '#FF3B1F').replace('#', '');
    if (h.length < 6) return '#ffffff';
    var r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    var lin = function (c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.5 ? '#141416' : '#ffffff';
  }

  var rootStyle = document.documentElement.style;

  function applyScheme(key) {
    var p = SCHEMES[key] || SCHEMES['cream-lime'];
    rootStyle.setProperty('--bg', p.bg);
    rootStyle.setProperty('--bg2', p.bg2);
    rootStyle.setProperty('--fg', p.fg);
    rootStyle.setProperty('--muted', p.muted);
    rootStyle.setProperty('--line', p.line);
    rootStyle.setProperty('--accent', p.accent);
    rootStyle.setProperty('--accent-ink', inkFor(p.accent));
    rootStyle.setProperty('--vignette', p.vig);
    rootStyle.setProperty('--panel-shadow', p.shadow);
    document.body.style.background = p.bg;
    document.querySelectorAll('.swatch').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-scheme') === key));
    });
  }

  // fresh weighted-random pick each load — no persistence, by design
  applyScheme(POOL[Math.floor(Math.random() * POOL.length)]);

  document.querySelectorAll('.swatch').forEach(function (b) {
    b.addEventListener('click', function () { applyScheme(b.getAttribute('data-scheme')); });
  });

  /* ============================ nav load-in ============================ */

  if (!reduced) {
    (function () {
      var nav = document.querySelector('[data-load-nav]');
      if (!nav) return;
      var delay = 60, dur = 700;
      nav.style.transform = 'translateY(-110%)';
      var ease = function (x) { return 1 - Math.pow(1 - x, 4); };
      var t0 = performance.now();
      var tick = function (now) {
        var p = Math.min(1, Math.max(0, (now - t0 - delay) / dur));
        nav.style.transform = 'translateY(' + (-110 * (1 - ease(p))) + '%)';
        if (p >= 1) { nav.style.transform = ''; return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      // safety: never leave the nav stuck off-screen
      setTimeout(function () { nav.style.transform = ''; }, 2400);
    })();
  }

  /* ============================ role ticker ============================ */

  if (!reduced) {
    (function () {
      var reel = document.querySelector('[data-role-reel]');
      if (!reel) return;
      var idx = 0;
      setInterval(function () {
        idx += 1;
        reel.style.transition = 'transform .55s cubic-bezier(.7,0,.2,1)';
        reel.style.transform = 'translateY(-' + (idx * 1.25) + 'em)';
        if (idx === 3) {
          // we've just scrolled onto the duplicated first label; once it settles,
          // snap back to the real first label with no transition — invisible seam
          var onEnd = function () {
            reel.removeEventListener('transitionend', onEnd);
            reel.style.transition = 'none';
            reel.style.transform = 'translateY(0)';
            idx = 0;
            void reel.offsetHeight;
          };
          reel.addEventListener('transitionend', onEnd);
        }
      }, 2600);
    })();
  }

  /* ============================ hero name cycle ============================ */

  (function () {
    var line = document.querySelector('[data-name-line]');
    if (!line) return;
    if (reduced) { line.style.transform = 'translateY(0)'; return; }

    var letters = Array.prototype.slice.call(document.querySelectorAll('[data-letter]'));
    var letterTs = [];
    var clearLetterTimers = function () { letterTs.forEach(clearTimeout); letterTs = []; };

    var loadIn = function () {
      clearLetterTimers();
      // reset letters flush inside the line, no transition
      letters.forEach(function (l) {
        l.style.transition = 'none';
        l.style.transitionDelay = '0ms';
        l.style.transform = 'translateY(0)';
      });
      // drop the whole line below the mask, then rise it in
      line.style.transition = 'none';
      line.style.transform = 'translateY(110%)';
      void line.offsetHeight;
      line.style.transition = 'transform 1s cubic-bezier(.2,.8,.2,1)';
      line.style.transform = 'translateY(0)';
    };

    var outro = function () {
      // anticipation: each letter eases up slightly, then falls out with a long ease-out
      clearLetterTimers();
      letters.forEach(function (l, i) {
        letterTs.push(setTimeout(function () {
          l.style.transitionDelay = '0ms';
          l.style.transition = 'transform .5s cubic-bezier(.33,1,.68,1)';
          l.style.transform = 'translateY(-9%)';
          letterTs.push(setTimeout(function () {
            l.style.transition = 'transform 1.5s cubic-bezier(.16,1,.3,1)';
            l.style.transform = 'translateY(135%)';
          }, 500));
        }, i * 70));
      });
    };

    var SIT = 5000, GAP = 2000, LOAD = 1000;
    var runCycle = function () {
      loadIn();
      var outDur = 2000 + Math.max(0, letters.length - 1) * 70 + 100;
      setTimeout(function () {
        outro();
        setTimeout(function () {
          setTimeout(runCycle, GAP);
        }, outDur);
      }, LOAD + SIT);
    };

    setTimeout(runCycle, 150);
  })();

  /* ============================ hero video ============================ */

  (function () {
    var mount = document.querySelector('[data-hero-video]');
    if (!mount || mount.firstChild || reduced) return;
    var f = document.createElement('iframe');
    f.src = 'https://player.vimeo.com/video/1154777635?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1';
    f.allow = 'autoplay';
    f.setAttribute('frameborder', '0');
    mount.appendChild(f);
  })();

  /* ============================ scroll reveals ============================ */

  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    // hidden state applied imperatively (not in markup) so content never gates on JS
    items.forEach(function (t) { t.style.opacity = '0'; t.style.transform = 'translateY(28px)'; });
    var show = function (t) {
      t.style.transitionDelay = (t.getAttribute('data-delay') || 0) + 'ms';
      t.style.opacity = '1';
      t.style.transform = 'none';
    };
    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (t) { io.observe(t); });
    // safety net: reveal only items already in view that somehow stayed hidden
    setTimeout(function () {
      items.forEach(function (t) {
        if (getComputedStyle(t).opacity !== '0') return;
        var r = t.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show(t);
      });
    }, 2600);
  })();

  /* ============================ project cards ============================ */

  document.querySelectorAll('a[data-video]').forEach(function (card) {
    var previewT = null;

    card.addEventListener('mouseenter', function () {
      card.style.transform = 'translateY(-6px)';
      var thumb = card.querySelector('.card-dots'); if (thumb) thumb.style.transform = 'scale(1.05)';
      var poster = card.querySelector('[data-poster]'); if (poster) poster.style.transform = 'scale(1.05)';
      var vid = card.getAttribute('data-video');
      var hash = card.getAttribute('data-hash');
      var mount = card.querySelector('[data-preview]');
      if (vid && mount && !mount.firstChild) {
        clearTimeout(previewT);
        // 130ms intent delay before spinning up the muted background embed
        previewT = setTimeout(function () {
          if (!mount.firstChild) {
            var f = document.createElement('iframe');
            f.src = 'https://player.vimeo.com/video/' + vid + '?' + (hash ? 'h=' + hash + '&' : '') + 'background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1';
            f.allow = 'autoplay';
            f.setAttribute('frameborder', '0');
            mount.appendChild(f);
            requestAnimationFrame(function () { f.style.opacity = '1'; });
          }
        }, 130);
      }
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(0)';
      var thumb = card.querySelector('.card-dots'); if (thumb) thumb.style.transform = 'scale(1)';
      var poster = card.querySelector('[data-poster]'); if (poster) poster.style.transform = 'scale(1)';
      clearTimeout(previewT);
      var mount = card.querySelector('[data-preview]');
      if (mount) mount.innerHTML = '';
    });
  });

  /* ============================ posters: fallback + oEmbed upgrade ============================ */

  document.querySelectorAll('img[data-poster]').forEach(function (img) {
    var hide = function () { img.style.display = 'none'; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0 && img.src) hide();
  });

  document.querySelectorAll('a[data-video]').forEach(function (card) {
    var vid = card.getAttribute('data-video');
    var hash = card.getAttribute('data-hash');
    var img = card.querySelector('img[data-poster]');
    if (!vid || !img) return;
    var link = 'https://vimeo.com/' + vid + (hash ? '/' + hash : '');
    var api = 'https://vimeo.com/api/oembed.json?width=1280&url=' + encodeURIComponent(link);
    fetch(api).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (d && d.thumbnail_url) {
        img.style.display = '';
        img.src = d.thumbnail_url.replace(/_[0-9x]+(\.[a-z]+)?(\?.*)?$/i, '_1280$1');
      }
    }).catch(function () {});
  });

  /* ============================ halftone portrait ============================ */

  var htCleanup = null;
  var htWidth = 0;

  function initHalftone() {
    var canvas = document.querySelector('[data-halftone]');
    if (!canvas || canvas._htInit) return;
    canvas._htInit = true;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'uploads/portrait.png';
    img.onload = function () {
      var wrap = canvas.parentElement;
      var cssW = Math.min(340, wrap.clientWidth || 340);
      htWidth = cssW;
      var cssH = Math.round(cssW * img.height / img.width);
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.height = cssH + 'px';

      // sample luminance on a grid (over white, so alpha reads as paper)
      var cell = 5; // css px per dot cell
      var gw = Math.ceil(cssW / cell), gh = Math.ceil(cssH / cell);
      var off = document.createElement('canvas');
      off.width = gw; off.height = gh;
      var octx = off.getContext('2d');
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, gw, gh);
      octx.drawImage(img, 0, 0, gw, gh);
      var data = octx.getImageData(0, 0, gw, gh).data;

      // particle system: one dot per visible cell, with home position, velocity,
      // and an "energy" that colorizes + excites it near the cursor
      var px = [], py = [], hx = [], hy = [], vx = [], vy = [], rad = [], en = [];
      for (var gy = 0; gy < gh; gy++) {
        for (var gx = 0; gx < gw; gx++) {
          var i = gy * gw + gx;
          var l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
          var r = (1 - l) * cell * 0.62;
          if (r < 0.35) continue;
          var x = gx * cell + cell / 2, y = gy * cell + cell / 2;
          px.push(x); py.push(y); hx.push(x); hy.push(y);
          vx.push(0); vy.push(0); rad.push(r);
          en.push(0);
        }
      }
      var N = px.length;
      var hueOff = new Float32Array(N);
      for (var j = 0; j < N; j++) hueOff[j] = (Math.random() - 0.5) * 70; // per-dot hue spread around accent

      var hexToHsl = function (hex) {
        var n = parseInt(hex.replace('#', ''), 16);
        var r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        var h = 0;
        if (d) {
          if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
          h *= 60; if (h < 0) h += 360;
        }
        var lum = (mx + mn) / 2;
        var s = d ? d / (1 - Math.abs(2 * lum - 1)) : 0;
        return [h, s * 100, lum * 100];
      };

      var cur = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
      var R = 80; // influence radius (css px)
      var reveal = 0, revealTarget = 0; // 0..1 lens strength

      var draw = function () {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        // read the accent live so scheme switches recolor the effect
        var accent = (rootStyle.getPropertyValue('--accent') || '#A8E10C').trim();
        var hsl = hexToHsl(accent);
        var ah = hsl[0], as = hsl[1], al = hsl[2];
        for (var i = 0; i < N; i++) {
          // color ramps with displacement from home, in hues around the accent
          var t = Math.min(1, Math.hypot(px[i] - hx[i], py[i] - hy[i]) / 26);
          var r = rad[i] * (1 + t * 0.9);
          if (t > 0.04) {
            var h = (ah + hueOff[i] * t + 360) % 360;
            var s = Math.max(45, as);
            var l = 8 + t * Math.max(38, al);
            ctx.fillStyle = 'hsl(' + h.toFixed(1) + ',' + s.toFixed(1) + '%,' + Math.min(72, l).toFixed(1) + '%)';
          } else {
            ctx.fillStyle = '#141414';
          }
          ctx.beginPath();
          ctx.arc(px[i], py[i], r, 0, 6.2832);
          ctx.fill();
        }
        // cursor lens: reveal the clean photo inside the influence circle
        if (reveal > 0.01 && cur.x > -999) {
          var lensR = R * (0.5 + 0.4 * reveal);
          ctx.save();
          ctx.beginPath();
          ctx.arc(cur.x, cur.y, lensR * reveal, 0, 6.2832);
          ctx.clip();
          ctx.drawImage(img, 0, 0, cssW, cssH);
          ctx.restore();
          ctx.beginPath();
          ctx.arc(cur.x, cur.y, lensR * reveal, 0, 6.2832);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#141414';
          ctx.stroke();
        }
      };

      var physics = function () {
        var alive = 0;
        for (var i = 0; i < N; i++) {
          // spring home
          vx[i] += (hx[i] - px[i]) * 0.055;
          vy[i] += (hy[i] - py[i]) * 0.055;
          // cursor force: radial burst + tangential swirl (flock-like curl)
          if (cur.x > -999) {
            var dx = px[i] - cur.x, dy = py[i] - cur.y;
            var d = Math.hypot(dx, dy);
            if (d < R) {
              var f = 1 - d / R;
              var inv = 1 / (d || 1);
              vx[i] += dx * inv * f * f * 2.6 - dy * inv * f * 1.1;
              vy[i] += dy * inv * f * f * 2.6 + dx * inv * f * 1.1;
              en[i] = Math.min(1.6, en[i] + f * 0.5);
            }
          }
          vx[i] *= 0.84; vy[i] *= 0.84;
          px[i] += vx[i]; py[i] += vy[i];
          en[i] *= 0.93;
          if (en[i] > 0.01 || Math.abs(px[i] - hx[i]) > 0.3 || Math.abs(py[i] - hy[i]) > 0.3 || Math.abs(vx[i]) > 0.05 || Math.abs(vy[i]) > 0.05) alive++;
        }
        return alive;
      };

      var raf = 0, settling = false;
      var tick = function () {
        cur.x += (cur.tx - cur.x) * 0.2;
        cur.y += (cur.ty - cur.y) * 0.2;
        reveal += (revealTarget - reveal) * 0.16;
        var alive = physics();
        draw();
        // loop runs only while dots are displaced/energized, then stops
        if (settling && alive === 0 && Math.abs(revealTarget - reveal) < 0.01 && cur.tx === -9999) {
          settling = false; reveal = 0; draw(); return;
        }
        raf = requestAnimationFrame(tick);
      };
      var start = function () { cancelAnimationFrame(raf); settling = true; raf = requestAnimationFrame(tick); };

      if (reduced) { draw(); return; }
      canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        var nx = e.clientX - rect.left, ny = e.clientY - rect.top;
        if (cur.x < -999) { cur.x = nx; cur.y = ny; }
        cur.tx = nx; cur.ty = ny;
        revealTarget = 1;
        start();
      });
      canvas.addEventListener('mouseleave', function () {
        revealTarget = 0; cur.tx = -9999; cur.ty = -9999; start();
      });
      htCleanup = function () { cancelAnimationFrame(raf); };
      draw();
    };
  }

  initHalftone();

  // rebuild the halftone when the portrait column resizes meaningfully
  var htRz = null;
  window.addEventListener('resize', function () {
    clearTimeout(htRz);
    htRz = setTimeout(function () {
      var c = document.querySelector('[data-halftone]');
      if (!c || !c.parentElement) return;
      var w = Math.min(340, c.parentElement.clientWidth || 340);
      if (Math.abs(w - htWidth) > 12) {
        if (htCleanup) htCleanup();
        c._htInit = false;
        initHalftone();
      }
    }, 250);
  });

})();
