/* Liquid gradient cursor blob + pixel trail.
   Verbatim port of the Portfolio Classic reference logic (onPointer, tick,
   drawGrid, contours, smooth, blobColor). The rAF loop starts on pointer
   move and stops itself once nothing is alive and the pointer is idle 1s.
   Off for touch-only devices, prefers-reduced-motion, and hidden tabs. */
(function () {
  'use strict';

  var BLOB_SIZE = 120, GRID_SIZE = 26, PIXEL_GRID = true;

  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.getElementById('gridCanvas');
  var blob = document.getElementById('blobLayer');
  if (!canvas || !blob) return;

  var mouse = null, last = null, speed = 0, headR = 0, stamps = [], cells = new Map(), raf = 0;
  var stops = [[255, 179, 71, 0], [255, 79, 163, .35], [79, 125, 255, .7], [43, 212, 198, 1]];

  function onPointer(e) {
    if (document.hidden) return;
    var now = performance.now();
    if (mouse) {
      var dt = Math.max(8, now - mouse.t), d = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
      speed = speed * .5 + (d / dt) * .5;
    }
    mouse = { x: e.clientX, y: e.clientY, t: now };
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    var now = performance.now(), t = now / 1000;
    if (now - mouse.t > 40) speed *= .9;
    var target = Math.min(1, speed / 1.2) * BLOB_SIZE;
    headR += (target - headR) * (target > headR ? .3 : .05);
    var life = 900;
    if (headR > 3) {
      if (!last) last = { x: mouse.x, y: mouse.y };
      var dx = mouse.x - last.x, dy = mouse.y - last.y, d = Math.hypot(dx, dy), step = 7, n = Math.floor(d / step);
      for (var k = 1; k <= n; k++) {
        var f = k / n;
        stamps.push({ x: last.x + dx * f, y: last.y + dy * f, r: headR * (.7 + .3 * Math.random()), born: now });
      }
      if (n > 0) last = { x: last.x + dx * (n * step / d), y: last.y + dy * (n * step / d) };
      if (stamps.length > 110) stamps.splice(0, stamps.length - 110);
    } else last = null;
    stamps = stamps.filter(function (p) { return now - p.born < life; });
    var live = stamps.map(function (p) {
      return { x: p.x, y: p.y, r: p.r * Math.pow(1 - (now - p.born) / life, .75) };
    });
    if (headR > 3) live.push({ x: mouse.x, y: mouse.y, r: headR });
    if (PIXEL_GRID) drawGrid(live, now);
    var loops = live.length ? contours(live, t) : [];
    blob.style.clipPath = loops.length
      ? 'polygon(evenodd,' + loops.map(function (l) {
          return '0px 0px,' + l.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ',' + l[0][0].toFixed(1) + 'px ' + l[0][1].toFixed(1) + 'px,0px 0px';
        }).join(',') + ')'
      : 'polygon(0 0,0 0,0 0)';
    // self-stop: nothing alive and pointer idle for 1s
    if (!live.length && !cells.size && now - mouse.t > 1000) { cancelAnimationFrame(raf); raf = 0; }
  }

  /* gradient colour under a point (135deg gradient + 20s hue loop) */
  function blobColor(x, y, now) {
    var W = window.innerWidth, H = window.innerHeight, Lh = Math.hypot(W, H), dx = W / Lh, dy = H / Lh;
    var u = Math.max(0, Math.min(1, ((x - W / 2) * dx + (y - H / 2) * dy) / (W * dx + H * dy) + .5));
    var a = stops[0], b = stops[3];
    for (var i = 0; i < 3; i++) if (u >= stops[i][3] && u <= stops[i + 1][3]) { a = stops[i]; b = stops[i + 1]; }
    var f = (u - a[3]) / ((b[3] - a[3]) || 1);
    var r = (a[0] + (b[0] - a[0]) * f) / 255, g = (a[1] + (b[1] - a[1]) * f) / 255, bl = (a[2] + (b[2] - a[2]) * f) / 255;
    var mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), l = (mx + mn) / 2, d = mx - mn;
    var hh = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      hh = mx === r ? ((g - bl) / d) % 6 : mx === g ? (bl - r) / d + 2 : (r - g) / d + 4;
      hh *= 60; if (hh < 0) hh += 360;
    }
    return [(hh + (now / 20000) * 360) % 360, s * 100, l * 100];
  }

  function drawGrid(balls, now) {
    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    var cs = GRID_SIZE, life = 2200;
    balls.forEach(function (b) {
      var rr = b.r * .95; if (rr < 4) return;
      for (var j = Math.floor((b.y - rr) / cs); j <= Math.floor((b.y + rr) / cs); j++)
        for (var i = Math.floor((b.x - rr) / cs); i <= Math.floor((b.x + rr) / cs); i++) {
          var cx = (i + .5) * cs, cy = (j + .5) * cs;
          if ((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y) > rr * rr) continue;
          var k = i + ',' + j, prev = cells.get(k);
          if (!prev || now - prev.t > 60) cells.set(k, { i: i, j: j, t: now, col: blobColor(cx, cy, now) });
        }
    });
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    cells.forEach(function (v, k) {
      var a = 1 - (now - v.t) / life;
      if (a <= 0) { cells.delete(k); return; }
      ctx.fillStyle = 'hsla(' + v.col[0].toFixed(0) + ',' + v.col[1].toFixed(0) + '%,' + v.col[2].toFixed(0) + '%,' + (a * a).toFixed(3) + ')';
      ctx.fillRect(v.i * cs, v.j * cs, cs, cs);
    });
  }

  /* metaball field on an 8px grid -> marching squares -> Chaikin-smoothed loops */
  function contours(balls, t) {
    var cs = 8, W = window.innerWidth, H = window.innerHeight;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    balls.forEach(function (b) {
      var m = b.r * 1.4 + 2 * cs;
      x0 = Math.min(x0, b.x - m); y0 = Math.min(y0, b.y - m);
      x1 = Math.max(x1, b.x + m); y1 = Math.max(y1, b.y + m);
    });
    x0 = Math.max(-W, x0); y0 = Math.max(-H, y0); x1 = Math.min(2 * W, x1); y1 = Math.min(2 * H, y1);
    var nx = Math.ceil((x1 - x0) / cs) + 1, ny = Math.ceil((y1 - y0) / cs) + 1;
    if (nx < 2 || ny < 2 || nx * ny > 90000) return [];
    var f = new Float32Array(nx * ny);
    for (var j = 0; j < ny; j++) {
      var y = y0 + j * cs;
      for (var i = 0; i < nx; i++) {
        var x = x0 + i * cs, v = 0;
        for (var k = 0; k < balls.length; k++) {
          var b = balls[k], ddx = x - b.x, ddy = y - b.y, R = b.r * 1.35, q = (ddx * ddx + ddy * ddy) / (R * R);
          if (q < 1) { var w = 1 - q; v += w * w * w; }
        }
        f[j * nx + i] = v + .06 * Math.sin(x * .05 + t * 4.5) * Math.sin(y * .055 - t * 3.2);
      }
    }
    var T = .32, segs = [];
    var lerp = function (p, q, va, vb) { var u = (T - va) / (vb - va); return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; };
    var TABLE = [[], [[3, 2]], [[1, 2]], [[3, 1]], [[0, 1]], [[0, 3], [1, 2]], [[0, 2]], [[0, 3]], [[0, 3]], [[0, 2]], [[0, 1], [2, 3]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 2]], []];
    for (var jj = 0; jj < ny - 1; jj++) for (var ii = 0; ii < nx - 1; ii++) {
      var a = f[jj * nx + ii], b2 = f[jj * nx + ii + 1], c2 = f[(jj + 1) * nx + ii + 1], d2 = f[(jj + 1) * nx + ii];
      var idx = (a > T ? 8 : 0) | (b2 > T ? 4 : 0) | (c2 > T ? 2 : 0) | (d2 > T ? 1 : 0);
      if (!idx || idx === 15) continue;
      if ((idx === 5 || idx === 10) && ((a + b2 + c2 + d2) / 4 > T)) idx = idx === 5 ? 10 : 5;
      var X = x0 + ii * cs, Y = y0 + jj * cs;
      var P = [[X, Y], [X + cs, Y], [X + cs, Y + cs], [X, Y + cs]], V = [a, b2, c2, d2];
      var E = function (e2) { return lerp(P[e2], P[(e2 + 1) % 4], V[e2], V[(e2 + 1) % 4]); };
      TABLE[idx].forEach(function (pr) { segs.push([E(pr[0]), E(pr[1])]); });
    }
    var key = function (p) { return Math.round(p[0] * 4) + ',' + Math.round(p[1] * 4); };
    var map = new Map();
    segs.forEach(function (sg, i2) {
      [key(sg[0]), key(sg[1])].forEach(function (k2) {
        var arr = map.get(k2); if (!arr) { arr = []; map.set(k2, arr); } arr.push(i2);
      });
    });
    var used = new Uint8Array(segs.length), loops = [];
    for (var s2 = 0; s2 < segs.length; s2++) {
      if (used[s2]) continue;
      used[s2] = 1;
      var loop = [segs[s2][0], segs[s2][1]], cur = segs[s2][1], guard = 0;
      while (guard++ < 5000) {
        var nbArr = map.get(key(cur)) || [];
        var nb = -1; // reset every iteration — `var` persists across the while loop
        for (var q2 = 0; q2 < nbArr.length; q2++) if (!used[nbArr[q2]]) { nb = nbArr[q2]; break; }
        if (nb === -1) break;
        used[nb] = 1;
        var sg2 = segs[nb];
        cur = key(sg2[0]) === key(cur) ? sg2[1] : sg2[0];
        loop.push(cur);
      }
      var a0 = loop[0], z0 = loop[loop.length - 1];
      if (loop.length > 5 && Math.hypot(a0[0] - z0[0], a0[1] - z0[1]) <= cs * 1.6) loops.push(smooth(smooth(loop)));
    }
    return loops;
  }

  function smooth(l) {
    var out = [];
    for (var i = 0; i < l.length; i++) {
      var p = l[i], q = l[(i + 1) % l.length];
      out.push([p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [p[0] * .25 + q[0] * .75, p[1] * .25 + q[1] * .75]);
    }
    return out;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf); raf = 0;
      stamps = []; cells.clear();
      blob.style.clipPath = 'polygon(0 0,0 0,0 0)';
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  window.addEventListener('pointermove', onPointer);
})();
