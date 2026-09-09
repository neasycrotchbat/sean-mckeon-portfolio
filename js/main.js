/* Sean McKeon — "Warp" portfolio behavior.
   Vanilla port of the design-reference logic (Warp.dc.html): four wheel-driven
   views, two-stage critically-damped springs for the home column and project
   row, a metaball marching-squares cursor blob, a pixel trail, and the
   page-inverting toggle. Physics ported verbatim from the reference. */
(function () {
  'use strict';

  /* ---------------- config (README "Tweaks") ---------------- */
  var CFG = {
    transitionSpeed: 1,
    hoverDuration: 1.7,
    invertDuration: 2,
    invertRadius: 20,
    invertCooldown: 5,
    cursorBlob: true,
    blobSize: 120,
    pixelGrid: true,
    gridSize: 10,
    gridDecay: 2.2,
    gridOpacity: 1,
    monochrome: true
  };
  var GRAD = 'linear-gradient(135deg,#ffb347 0%,#ff4fa3 35%,#4f7dff 70%,#2bd4c6 100%)';

  /* ---------------- data ---------------- */
  var data = [
    { id: '1154777635', title: 'Reel 2026', cat: 'Showreel', year: '2026', role: 'Motion design & 3D', desc: 'A selection of motion, 3D and real‑time work from the last few years.' },
    { id: '1206224578', title: 'Copa Mundial de la FIFA 2026', cat: 'Broadcast', year: '2026', role: 'Design & animation', desc: 'Broadcast graphics package for Telemundo’s coverage of the 2026 FIFA World Cup, produced with NBCUniversal’s The Arthouse.' },
    { id: '1206225395', title: 'GameStop × PSA Powerpacks', cat: 'Brand Film', year: '2025', role: 'Motion design & 3D', desc: 'Brand film introducing PSA-graded Powerpacks for GameStop, delivered freelance with INTER NYC.' },
    { id: '1206553563', hash: 'a8923c61c8', title: 'Laser at AMC Preshow', cat: 'Experiential', year: '2024', role: 'Direction & 3D', desc: 'Pre-show spot for AMC’s Laser at AMC premium format, built around light, depth and scale.' },
    { id: '1018012812', hash: '668da7feac', title: 'AMC — Grocery Popcorn', cat: 'Commercial', year: '2024', role: 'Motion design & 3D', poster: 'https://i.vimeocdn.com/video/1936123676-14150535f8eb80f5b1d4686876985bf3bb0fe7a1a89cb61836e803e7c77b246b-d_1280?region=us', desc: 'Commercial launching AMC Theatres popcorn into grocery aisles — product animation and packaging renders.' },
    { id: '1026714999', title: 'Garmin — Epix', cat: 'Product', year: '2021', role: 'Senior Motion Designer', desc: 'Product animation and UI motion for Garmin devices, produced in-house.' },
    { id: '1026972287', title: 'Missouri Lottery — Lucky 7 Playbook', cat: 'Broadcast', year: '2020', role: 'Motion design & 3D', desc: 'Broadcast campaign for Missouri Lottery’s Lucky 7 Playbook, from concept boards through final animation.' },
    { id: '1206226377', hash: '44afa32ce5', title: 'Kauffman Center Opening Gala', cat: 'Live Projection', year: '2012', role: 'Projection design', poster: 'https://i.vimeocdn.com/video/2175016392-f13a5265cd75e9bbe2eae80805a924222e3f210ca37ed02d23acb35c17aa014e-d_1280?region=us', desc: 'Architectural projection for the opening gala of the Kauffman Center for the Performing Arts, Kansas City.' }
  ];
  var archive = [
    { id: '1026975603', title: 'Mariners — Robinson Canó Headshot', year: '2024' }, { id: '1026975155', title: "A's — Andrew Lambo Headshot", year: '2024' }, { id: '1026714591', title: 'AMC — Discount Matinees', year: '2024' }, { id: '1018026567', title: 'MST3K Movie Sign Recreation', year: '2024' }, { id: '1018023238', title: 'IT Chapter 2 — Featured Drink', year: '2024' }, { id: '1018021255', title: 'Venom — Featured Drink', year: '2024' }, { id: '1018020286', title: 'Solo — Featured Drink', year: '2024' },
    { id: '1018019368', title: 'The Predator — Featured Drink', year: '2024' }, { id: '1018017656', title: 'S Group Bumpers', year: '2024' }, { id: '1017734278', title: 'Reel 2024', year: '2024' }, { id: '578600776', title: 'DEG Party Wall', year: '2021' }, { id: '549152322', title: 'AMC — Rise of Skywalker Popcorn Tins', year: '2021' }, { id: '526228048', title: 'Reel 2020', year: '2020' }, { id: '255592407', title: 'Electric Forest', year: '2018' },
    { id: '255594706', title: '2016–18 Motion Graphics Showcase', year: '2018' }, { id: '255592631', title: 'Sixx Tape Production Tag', year: '2018' }, { id: '147652395', title: 'Reel 2015', year: '2015' }, { id: '96955797', title: "Graphics Reel '14", year: '2014' }, { id: '73189758', title: 'FFAC Projection Compilation', year: '2013' }, { id: '68255749', title: 'BEZOAR', year: '2013' }, { id: '54195520', title: 'Missouri Lottery — Play It Forward', year: '2012' }, { id: '45977086', title: 'Reel 2012', year: '2012' }
  ];
  var N = data.length;

  /* direct Vimeo CDN posters (1280px) — vumbnail.com is only a fallback */
  var posters = { '45977086': '369723620-7e450ff9e805d843b58eb62f53331aa9a75c0c67b8b432429052f437cccf258c', '54195520': '374632987-92b115a3dbf721ffe3281a55addd00ddc4199ba3a77cc2d983e82f6a9871d589', '68255749': '440578404-2894b93bb5530dfb7b4311a8f7b9683c10fd881f11b0c6ae5ecd0d9e0dcbcdb7', '73189758': '447225455-f64236772d01a644ddcd89f94deb6988200eee5cac7ce1a951268d6b15ebcd92', '96955797': '477247816-5cf91b6438282e2572e861b23f95f7162be4bc59bd5704a73cec275da8d983fd', '147652395': '546380954-1fddf50d2d9789b7f88c4cd937037b8334f5f29917c3534960ef6626cf2b5f00', '255592407': '683038800-f78f49b0145ab31cbab318db6f051750e8d6e665e12578ab17af8f7678f104fd', '255592631': '683039049-776d1d9d59583ebcc6160a944aceaeb474f43440385e6eab2666631bfeeff6b7', '255594706': '683041847-57d51e25b74ac2300e79b3c751c766ed8cafae7fca600182b313c213d2b21851', '526228048': '1089276947-7d7f10ee00528124fff0fb54bcd776137d8e9b4dce49efb98635e1a0757a558a', '549152322': '1136948711-3c654807a997be6435a23e30b3c4060159e49e48606fd7dee98d91d921f32b8b', '578600776': '1196882806-badeafbd6ef3e531232e42f0379c7b4a3822998dfc038963c7e2de059d1ab5c8', '1017734278': '1935792379-5292e689df80e6a789af17f1e13200123b4025296a20ad21d35b19c8cd12898f', '1018017656': '1936129402-6544ab43737be3ba1978094e75a27e6a272acd4c1b4e0e67420b71fe88511dc9', '1018019368': '1936131408-4374a381bdaeeaab4f69e3362216bdd7064de0c785e06fdd811d498619cfa54f', '1018020286': '1936132466-b832339b71d6baf489f7b7fcc8b1913fecc9753b5b92e3fd3adbb1ebe044d93d', '1018021255': '1936146725-08cdf45d3249f5b2ad9230e69ddd4385020868420e44e9de9c7552d6e92b4b42', '1018023238': '1936136105-ff00390693ad6493b4205a28f46f2098e0b3460de80a217d9175829123e3763e', '1018026567': '1936140183-a76f5835a932f4c2619821f0c1e0898978832d8b78b323ac68fabe93008ccc40', '1026714591': '1946548128-644e17f59709fb3c124d71af1daf1a0f418506c06e00c905ac74927e76bf4de9', '1026714999': '1946549894-9d8d3974425b7fd62c5f04bfd77332489894d6e200eb5c149077363188d2489d', '1026972287': '1946854338-751eca4d095458ae2d860d4ac1e563dc84a6a5fb398ef1ed91edf7db7903d8ca', '1026975155': '1946857578-76f6fc0a954ccc228d0abab7f9fed3a08bb645cffe5f54a5e7e0ed5cee35999b', '1026975603': '1946858038-6948d8b0c5e8d8f521530fe474fb6beb80f0327c193a5838b2032ec4e1a25f7b', '1154777635': '2107215553-ff83128111d49be28b40602c232461d7d7c06c3dfa69da0930fe188f0a882791', '1206224578': '2175013905-9eada3d6e81e06789be571e3041333e09a938765f1380c88070c1e1fe2a2b7d6', '1206225395': '2175430270-1779d19a1a8bdd2310f8f7534d9d981218b0e1653f76d2706e2f440ce3bdfc4b', '1206553563': '2175429415-be88654c0ede2d5bca95e891441780bd3c9b011794d1234e709ff50e6688e079' };

  var vimeoUrl = function (p) { return 'https://vimeo.com/' + p.id + (p.hash ? '/' + p.hash : ''); };
  var posterOf = function (p) { return p.poster || (posters[p.id] ? 'https://i.vimeocdn.com/video/' + posters[p.id] + '-d_1280?region=us' : 'https://vumbnail.com/' + p.id + '.jpg'); };
  var embedOf = function (p) { return 'https://player.vimeo.com/video/' + p.id + '?' + (p.hash ? 'h=' + p.hash + '&' : '') + 'background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1'; };

  /* ---------------- state & fixed elements ---------------- */
  var S = { view: 'home', idx: 0, hover: -1, transitioning: false, videoLive: false, stackLive: false };

  var app = document.getElementById('app');
  var viewRoot = document.getElementById('viewRoot');
  var blobLayer = document.getElementById('blobLayer');
  var gridCanvas = document.getElementById('gridCanvas');
  var invertLayer = document.getElementById('invertLayer');
  var dot = document.getElementById('invertDot');
  var overlay = document.getElementById('transition');
  var hdrIndex = document.getElementById('hdrIndex');
  var hdrInfo = document.getElementById('hdrInfo');
  var hdrContact = document.getElementById('hdrContact');

  if (!CFG.cursorBlob) blobLayer.remove();
  if (!CFG.pixelGrid) gridCanvas.remove();

  /* per-view element handles (nulled on view swap) */
  var stackOuter = null, stackInner = null, footerEl = null;
  var stackTiles = [], maskEls = [], grayEls = [], feEls = [];
  var workLinks = [];
  var stripTiles = [], titleEl = null, infoEl = null;
  var projEls = null;

  /* spring / cursor state */
  var stackY = 0, stackV = 0, goalY = null, goalV = 0, stackGoal = null, stackTargetY = null;
  var tileY = [], tileV = [], lastDrive = 0, edgeZone = 0;
  var freeP = [], freeV = [], rowTarget = 0, freeDir = 1, freeActive = false, freeLead, lastFree = 0;
  var enterIdx = 0, lock = 0, homeAt = 0;
  var mouse = null, last = null, speed = 0, headR = 0, stamps = [], cells = new Map();
  var inverted = false, holeMode = false, lastInvert = -1e9, lastLoops = null, maskC = null, holeRaf = 0;
  var t1, t2, t3, t8, t9;

  /* ---------------- view rendering ---------------- */
  function clone(id) { return document.getElementById(id).content.firstElementChild.cloneNode(true); }

  function renderView(view) {
    stackOuter = stackInner = footerEl = titleEl = infoEl = projEls = null;
    stackTiles = []; maskEls = []; grayEls = []; feEls = []; workLinks = []; stripTiles = [];
    if (blobLayer) delete blobLayer.dataset.sig;
    if (gridCanvas) delete gridCanvas.dataset.sig;
    viewRoot.textContent = '';
    if (view === 'home') renderHome();
    else if (view === 'project') renderProject();
    else if (view === 'mosaic') renderMosaic();
    else renderInfo();
    /* header state (hidden-toggle restarts the Index link's fadeUp) */
    hdrIndex.hidden = view === 'home';
    hdrInfo.textContent = (view === 'project' || view === 'mosaic') ? 'Info,' : 'Info';
    hdrContact.hidden = !(view === 'project' || view === 'mosaic');
  }

  function renderHome() {
    var sec = clone('tpl-home');
    stackOuter = sec.querySelector('[data-stack-outer]');
    stackInner = sec.querySelector('[data-stack-inner]');
    footerEl = sec.querySelector('[data-footer]');
    var defs = sec.querySelector('[data-filter-defs]');
    var titles = sec.querySelector('[data-titles]');
    var SVG = 'http://www.w3.org/2000/svg';

    data.forEach(function (p, i) {
      var a = document.createElement('a');
      a.href = '#'; a.className = 'stack-tile';
      a.style.animationDelay = (0.15 + i * 0.07).toFixed(2) + 's';
      var mask = document.createElement('div');
      mask.className = 'tile-mask';
      if (CFG.monochrome) mask.style.filter = 'url(#tileF' + i + ')';
      var img = document.createElement('img');
      img.src = posterOf(p); img.alt = p.title;
      mask.appendChild(img);
      a.appendChild(mask);
      var gray = null;
      if (CFG.monochrome) { gray = document.createElement('div'); gray.className = 'tile-gray'; a.appendChild(gray); }
      a.addEventListener('click', function (e) { e.preventDefault(); navigate('project', i); });
      a.addEventListener('mouseenter', function () { setHover(i); });
      stackInner.appendChild(a);
      stackTiles[i] = a; maskEls[i] = mask; grayEls[i] = gray;

      /* per-tile SVG colour-reveal filter: feImage mask -> colour in, desaturated out */
      var f = document.createElementNS(SVG, 'filter');
      f.setAttribute('id', 'tileF' + i);
      f.setAttribute('x', '0'); f.setAttribute('y', '0');
      f.setAttribute('width', '100%'); f.setAttribute('height', '100%');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      var fe = document.createElementNS(SVG, 'feImage');
      fe.setAttribute('preserveAspectRatio', 'none'); fe.setAttribute('result', 'm');
      var cm = document.createElementNS(SVG, 'feColorMatrix');
      cm.setAttribute('in', 'SourceGraphic'); cm.setAttribute('type', 'saturate'); cm.setAttribute('values', '0'); cm.setAttribute('result', 'g');
      var c1 = document.createElementNS(SVG, 'feComposite');
      c1.setAttribute('in', 'SourceGraphic'); c1.setAttribute('in2', 'm'); c1.setAttribute('operator', 'in'); c1.setAttribute('result', 'col');
      var c2 = document.createElementNS(SVG, 'feComposite');
      c2.setAttribute('in', 'g'); c2.setAttribute('in2', 'm'); c2.setAttribute('operator', 'out'); c2.setAttribute('result', 'gray');
      var mg = document.createElementNS(SVG, 'feMerge');
      var m1 = document.createElementNS(SVG, 'feMergeNode'); m1.setAttribute('in', 'gray');
      var m2 = document.createElementNS(SVG, 'feMergeNode'); m2.setAttribute('in', 'col');
      mg.appendChild(m1); mg.appendChild(m2);
      f.appendChild(fe); f.appendChild(cm); f.appendChild(c1); f.appendChild(c2); f.appendChild(mg);
      defs.appendChild(f);
      feEls[i] = fe;
    });

    stackOuter.addEventListener('mousemove', onStackMove);
    stackOuter.addEventListener('mouseleave', onStackLeave);

    var reel = sec.querySelector('[data-reel]');
    reel.addEventListener('click', function (e) { e.preventDefault(); navigate('project', 0); });
    reel.addEventListener('mouseenter', function () { setHover(0); scrollToTile(0); });
    reel.addEventListener('mouseleave', function () { setHover(-1); });

    data.slice(1).forEach(function (p, k) {
      var i = k + 1;
      var a = document.createElement('a');
      a.href = '#'; a.textContent = p.title;
      a.addEventListener('click', function (e) { e.preventDefault(); navigate('project', i); });
      a.addEventListener('mouseenter', function () { setHover(i); scrollToTile(i); });
      titles.appendChild(a);
      workLinks[k] = a;
    });
    titles.addEventListener('mouseleave', function () { setHover(-1); });

    viewRoot.appendChild(sec);
    applyHoverColors();
    syncStackIframes();
    riseFooter();
  }

  function renderProject() {
    var sec = clone('tpl-project');
    var track = sec.querySelector('[data-track]');
    titleEl = sec.querySelector('[data-title]');
    infoEl = sec.querySelector('[data-info]');
    projEls = {
      desc: sec.querySelector('[data-desc]'), year: sec.querySelector('[data-year]'),
      role: sec.querySelector('[data-role]'), url: sec.querySelector('[data-url]'),
      next: sec.querySelector('[data-next]'), nextTitle: sec.querySelector('[data-next-title]'),
      nextPoster: sec.querySelector('[data-next-poster]')
    };
    var fromEnd = enterIdx === N - 1;
    data.forEach(function (p, i) {
      var a = document.createElement('a');
      a.href = '#'; a.className = 'strip-tile';
      a.style.animationDelay = (0.05 + (fromEnd ? (N - 1 - i) : i) * 0.04).toFixed(2) + 's';
      a.style.setProperty('--dir', fromEnd ? '-1' : '1');
      a.style.setProperty('--offx', 'calc(' + (fromEnd ? 0 : enterIdx) + ' * (min(60vw,80vh) + 40px))');
      var img = document.createElement('img');
      img.src = posterOf(p); img.alt = p.title;
      a.appendChild(img);
      a.addEventListener('click', function (e) { e.preventDefault(); slideTo(i); });
      track.appendChild(a);
      stripTiles[i] = a;
    });
    track.style.transform = 'translateX(calc(' + (-enterIdx) + ' * (min(60vw,80vh) + 40px)))';
    projEls.next.addEventListener('click', function (e) { e.preventDefault(); slideTo((S.idx + 1) % N); });
    viewRoot.appendChild(sec);
    updateProjectText(S.idx);
    updateStripLive();
  }

  function renderMosaic() {
    var sec = clone('tpl-mosaic');
    var grid = sec.querySelector('[data-grid]');
    archive.forEach(function (c, i) {
      var a = document.createElement('a');
      a.className = 'mosaic-tile';
      a.href = 'https://vimeo.com/' + c.id; a.target = '_blank'; a.rel = 'noreferrer';
      a.style.animationDelay = (0.1 + i * 0.05).toFixed(2) + 's';
      var img = document.createElement('img');
      img.src = posterOf(c); img.alt = c.title;
      var cap = document.createElement('div');
      cap.className = 'mosaic-cap';
      var st = document.createElement('span'); st.className = 'cap-title'; st.textContent = c.title;
      var sy = document.createElement('span'); sy.className = 'cap-year'; sy.textContent = c.year;
      cap.appendChild(st); cap.appendChild(sy);
      a.appendChild(img); a.appendChild(cap);
      grid.appendChild(a);
    });
    viewRoot.appendChild(sec);
  }

  function renderInfo() {
    viewRoot.appendChild(clone('tpl-info'));
  }

  /* nav links present in the fixed header and the mosaic bar */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-nav]');
    if (!t) return;
    e.preventDefault();
    navigate(t.getAttribute('data-nav'));
  });

  function setHover(i) {
    if (S.hover === i) return;
    S.hover = i;
    applyHoverColors();
  }
  function applyHoverColors() {
    workLinks.forEach(function (a, k) {
      var i = k + 1;
      a.style.color = (S.hover === -1 || S.hover === i) ? '#111' : '#b5b5b5';
    });
  }

  function updateProjectText(i) {
    if (!projEls) return;
    var p = data[i], nx = data[(i + 1) % N];
    titleEl.textContent = p.title;
    projEls.desc.textContent = p.desc;
    projEls.year.textContent = p.year;
    projEls.role.textContent = p.role;
    projEls.url.href = vimeoUrl(p);
    projEls.nextTitle.textContent = nx.title;
    projEls.nextPoster.src = posterOf(nx);
  }

  /* only the active strip tile hosts a live player */
  function updateStripLive() {
    stripTiles.forEach(function (el, i) {
      if (!el) return;
      var fr = el.querySelector('iframe');
      if (S.view === 'project' && S.videoLive && i === S.idx) {
        if (!fr) {
          var f = document.createElement('iframe');
          f.src = embedOf(data[i]); f.allow = 'autoplay'; f.tabIndex = -1;
          f.setAttribute('frameborder', '0');
          el.appendChild(f);
        }
      } else if (fr) fr.remove();
    });
  }

  /* home column players appear 300ms after first mount, immediately after */
  function syncStackIframes() {
    if (!S.stackLive || S.view !== 'home') return;
    maskEls.forEach(function (mask, i) {
      if (!mask || mask.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = embedOf(data[i]); f.allow = 'autoplay'; f.tabIndex = -1;
      f.setAttribute('frameborder', '0');
      mask.appendChild(f);
    });
  }

  /* ---------------- home column: footer rise ---------------- */
  function riseFooter() {
    homeAt = performance.now();
    clearTimeout(t8);
    var o0 = stackOuter;
    if (o0) {
      o0.style.transition = 'none';
      o0.style.height = 'calc(100% + 20px)';
      requestAnimationFrame(function () { o0.style.transition = 'height 1.2s cubic-bezier(.16,.7,.2,1)'; });
    }
    t8 = setTimeout(function () {
      var f = footerEl; if (!f) return;
      if (stackOuter) stackOuter.style.height = 'calc(100% - 52px)';
      f.style.transition = 'none'; f.style.opacity = '0'; f.style.transform = 'translate3d(0,40px,0)';
      requestAnimationFrame(function () {
        f.style.transition = 'opacity 1.5s cubic-bezier(.16,.7,.2,1), transform 1.5s cubic-bezier(.16,.7,.2,1)';
        f.style.opacity = '1'; f.style.transform = 'translate3d(0,0,0)';
      });
    }, 1900);
  }

  /* ---------------- home column springs ---------------- */
  // two-stage: the goal is a critically-damped follower of the target (soft
  // ease-in) and tiles spring toward that moving goal (soft ease-out)
  function driveStack() {
    var outer = stackOuter, inner = stackInner;
    if (!outer || !inner) return;
    var max = Math.max(0, inner.scrollHeight - outer.clientHeight + 20);
    var now = performance.now(), dt = Math.min(.05, (now - (lastDrive || now)) / 1000) || 1 / 60;
    lastDrive = now;
    if (stackTargetY !== null) stackGoal = stackTargetY;
    var target = Math.max(0, Math.min(max, stackGoal != null ? stackGoal : stackY));
    var T = CFG.hoverDuration, wg = 2 * Math.PI / (T * .5), base = 2 * Math.PI / (T * .42), n = stackTiles.length;
    goalV = (goalV || 0) + (-wg * wg * ((goalY != null ? goalY : stackY) - target) - 2 * wg * (goalV || 0)) * dt;
    goalY = (goalY != null ? goalY : stackY) + goalV * dt;
    var goal = goalY, up = target > stackY;
    var step = function (y, v, w) { v += (-w * w * (y - goal) - 2 * w * v) * dt; y += v * dt; return [y, v]; };
    var r = step(stackY, stackV || 0, base); stackY = r[0]; stackV = r[1];
    inner.style.transform = 'translateY(' + (-stackY).toFixed(2) + 'px)';
    stackTiles.forEach(function (el, i) {
      if (!el) return;
      var order = up ? i : (n - 1 - i), w = base * (1 - order * .07); // softer springs further down the cascade
      var rr = step(tileY[i] != null ? tileY[i] : stackY, tileV[i] || 0, w);
      tileY[i] = rr[0]; tileV[i] = rr[1];
      var off = stackY - tileY[i];
      el.style.transform = Math.abs(off) < .05 ? '' : 'translateY(' + off.toFixed(2) + 'px)';
    });
  }

  function scrollToTile(i) {
    var el = stackTiles[i]; if (!el || !stackOuter || !stackInner) return;
    var max = Math.max(0, stackInner.scrollHeight - stackOuter.clientHeight + 20);
    stackGoal = Math.min(max, el.offsetTop);
    stackTargetY = null;
  }

  function onStackMove(e) {
    var outer = stackOuter; if (!outer) return;
    var b = outer.getBoundingClientRect(), y = (e.clientY - b.top) / b.height;
    // edge zones behave like hovering the first / last title
    var zone = y < .25 ? -1 : y > .75 ? 1 : 0;
    if (zone !== edgeZone) { edgeZone = zone; if (zone) scrollToTile(zone < 0 ? 0 : N - 1); }
    stackTargetY = null;
  }
  function onStackLeave() { edgeZone = 0; }

  /* ---------------- project row: free scroll ---------------- */
  function tileW() {
    var el = stripTiles[0];
    return (el ? el.getBoundingClientRect().width : 600) + 40;
  }

  // wheel delta accumulates into rowTarget (tile units); each tile springs
  // toward it with the cascade; text tracks the nearest tile's distance to centre
  function freeScroll(dy) {
    rowTarget = Math.max(0, Math.min(N - 1, (rowTarget != null ? rowTarget : S.idx) + dy / (tileW() * 1.1)));
    freeDir = dy > 0 ? 1 : -1;
    freeActive = true;
  }

  function driveFree() {
    if (!freeActive) return;
    var els = stripTiles;
    var now = performance.now(), dt = Math.min(.05, (now - (lastFree || now)) / 1000) || 1 / 60;
    lastFree = now;
    var T = CFG.hoverDuration * .75, base = 2 * Math.PI / (T * .42), n = els.length, w = tileW();
    var tgt = rowTarget != null ? rowTarget : S.idx;
    var lead = Math.round(freeLead != null ? freeLead : tgt), settled = true;
    els.forEach(function (el, i) {
      if (!el) return;
      var rel = (i - lead) * (freeDir || 1), order = Math.min(3, Math.max(0, 1 + rel)), k = base * (1 - order * .11);
      var p = freeP[i] != null ? freeP[i] : S.idx, v = freeV[i] || 0;
      v += (-k * k * (p - tgt) - 2 * k * v) * dt; p += v * dt;
      freeP[i] = p; freeV[i] = v;
      if (Math.abs(p - tgt) > .001 || Math.abs(v) > .001) settled = false;
      el.style.transform = 'translateX(' + ((enterIdx - p) * w).toFixed(2) + 'px)';
    });
    // the active tile's position drives the text
    var pos = freeP[Math.round(tgt)] != null ? freeP[Math.round(tgt)] : tgt;
    var near = Math.max(0, Math.min(n - 1, Math.round(pos)));
    var d = Math.min(1, Math.abs(pos - near) / .45);
    freeLead = pos;
    var op = (1 - d).toFixed(3), ty = (d * 22 * (pos > near ? -1 : 1)).toFixed(1) + 'px';
    [titleEl, infoEl].forEach(function (t) { if (t) { t.style.opacity = op; t.style.transform = 'translateY(' + ty + ')'; } });
    // video plays whenever its name is visible (d < 1), stops once fully out
    var live = d < 1;
    if (near !== S.idx) { S.idx = near; S.videoLive = live; updateProjectText(near); updateStripLive(); }
    else if (live !== S.videoLive) { S.videoLive = live; updateStripLive(); }
    if (settled) freeActive = false;
  }

  function slideTo(n) {
    if (S.transitioning || n === S.idx) return;
    if (n < 0) return navigate('home');
    if (n >= N) return navigate('mosaic');
    rowTarget = n;
    freeDir = n > S.idx ? 1 : -1;
    freeActive = true;
  }

  /* ---------------- navigation ---------------- */
  function navigate(view, idx) {
    if (S.transitioning) return;
    if (view === S.view && (view !== 'project' || idx === S.idx)) return;
    var speed = CFG.transitionSpeed;
    S.transitioning = true; S.hover = -1; S.videoLive = false;
    freeActive = false;
    updateStripLive();
    if (blobLayer) { blobLayer.style.display = 'none'; }
    overlay.hidden = true; void overlay.offsetHeight; overlay.hidden = false; // restart wipe
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(function () {
      enterIdx = idx != null ? idx : S.idx;
      freeP = []; freeV = []; rowTarget = enterIdx; freeLead = undefined;
      S.view = view; S.idx = idx != null ? idx : S.idx; S.transitioning = false;
      overlay.hidden = true;
      if (blobLayer) { blobLayer.style.display = ''; delete blobLayer.dataset.sig; }
      renderView(view);
    }, 680 * speed);
    t2 = setTimeout(function () { S.videoLive = true; updateStripLive(); }, 680 * speed + 900);
  }

  /* ---------------- wheel ---------------- */
  function onWheel(e) {
    var inRow = S.view === 'project';
    var now = Date.now(), dir = e.deltaY > 0 ? 1 : -1;
    if (inRow) { // free scroll; pushing past an end (while resting there) turns the page
      var t = rowTarget != null ? rowTarget : S.idx;
      var atEnd = (dir < 0 && t <= 0.001) || (dir > 0 && t >= N - 1.001);
      if (atEnd && !freeActive) {
        if (now - lock < 1400 || Math.abs(e.deltaY) < 12) return;
        lock = now;
        return navigate(dir < 0 ? 'home' : 'mosaic');
      }
      freeScroll(e.deltaY);
      return;
    }
    if (now - lock < 1400 || Math.abs(e.deltaY) < 12) return;
    lock = now;
    if (S.view === 'home') { if (dir > 0) navigate('project', 0); }
    else if (S.view === 'mosaic') { if (dir > 0) navigate('info'); else navigate('project', N - 1); }
    else if (dir < 0) navigate('mosaic'); // info
  }

  /* ---------------- invert toggle ---------------- */
  function toggleInvert(e) {
    if (e && e.preventDefault) e.preventDefault();
    var L = invertLayer; if (!L) return;
    if (performance.now() - lastInvert < CFG.invertCooldown * 1000) return; // shared cooldown for click and proximity
    var b = dot ? dot.getBoundingClientRect() : { left: window.innerWidth - 25, top: 25, width: 10, height: 10 };
    var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    var R = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 20;
    inverted = !inverted; holeMode = false; lastInvert = performance.now();
    var dur = CFG.invertDuration * 1000, ease = 'cubic-bezier(.65,0,.25,1)', fade = dur * .45;
    cancelAnimationFrame(holeRaf);
    clearTimeout(t9);
    if (inverted) {
      L.style.webkitMaskImage = L.style.maskImage = 'none';
      L.style.transition = 'clip-path ' + dur + 'ms ' + ease;
      L.style.clipPath = 'circle(' + R + 'px at ' + cx + 'px ' + cy + 'px)';
    } else {
      // expanding hole: full page minus a growing circle (polygonised), so the
      // plain page is revealed with text intact
      L.style.transition = 'none';
      L.style.webkitMaskImage = L.style.maskImage = 'none';
      var t0 = performance.now();
      var E = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
      var stepFn = function () {
        var p = Math.min(1, (performance.now() - t0) / dur), r = Math.max(.5, R * E(p));
        var s = 'polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0';
        for (var i = 0; i <= 72; i++) {
          var th = i / 72 * Math.PI * 2;
          s += ',' + (cx + r * Math.cos(th)).toFixed(1) + 'px ' + (cy + r * Math.sin(th)).toFixed(1) + 'px';
        }
        // the cursor hole dissolves too: keep punching the blob through,
        // shrinking it toward its centre over the fade
        var hf = Math.min(1, (performance.now() - t0) / fade), k = 1 - hf;
        if (k > 0 && lastLoops) lastLoops.forEach(function (l) {
          var mx = 0, my = 0;
          l.forEach(function (q) { mx += q[0]; my += q[1]; });
          mx /= l.length; my /= l.length;
          s += ',0 0,' + l.map(function (q) { return (mx + (q[0] - mx) * k).toFixed(1) + 'px ' + (my + (q[1] - my) * k).toFixed(1) + 'px'; }).join(',') + ',' + (mx + (l[0][0] - mx) * k).toFixed(1) + 'px ' + (my + (l[0][1] - my) * k).toFixed(1) + 'px';
        });
        L.style.clipPath = s + ',0 0)';
        if (p < 1) holeRaf = requestAnimationFrame(stepFn);
        else L.style.clipPath = 'circle(0px at ' + cx + 'px ' + cy + 'px)';
      };
      holeRaf = requestAnimationFrame(stepFn);
    }
    // crossfade the cursor: the gradient blob dissolves as the circle spreads,
    // then the hole takes over; reverting, the hole closes and the gradient fades back
    var B0 = blobLayer;
    if (B0) { B0.style.transition = 'opacity ' + fade + 'ms ease'; B0.style.opacity = '0'; }
    t9 = setTimeout(function () {
      var B = blobLayer; if (!B) return;
      if (inverted) {
        B.style.background = 'transparent'; B.style.mixBlendMode = 'normal'; B.style.animation = 'none';
        B.style.opacity = '1'; holeMode = true; L.style.transition = 'none';
      } else {
        B.style.background = GRAD; B.style.mixBlendMode = 'difference'; B.style.animation = 'hueLoop 20s linear infinite';
        requestAnimationFrame(function () { B.style.opacity = '1'; });
      }
    }, inverted ? dur * .8 : fade * .7);
  }

  /* ---------------- cursor: pointer + blob + pixel trail ---------------- */
  var vel = null, raf = 0;
  function onPointer(e) {
    var now = performance.now();
    if (mouse) {
      var dtp = Math.max(8, now - mouse.t), dd = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
      speed = speed * .5 + (dd / dtp) * .5;
      vel = { x: (e.clientX - mouse.x) / dtp, y: (e.clientY - mouse.y) / dtp };
    }
    mouse = { x: e.clientX, y: e.clientY, t: now };
    var d = dot;
    if (d && now - lastInvert > CFG.invertCooldown * 1000) {
      var b = d.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      if (Math.hypot(dx, dy) <= CFG.invertRadius + b.width / 2) toggleInvert(null);
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    driveStack(); driveFree();
    if (!mouse) return;
    var now = performance.now(), t = now / 1000;
    if (now - mouse.t > 40) speed *= .9;
    var s = Math.min(1, speed / 1.2);
    var target = s * CFG.blobSize;
    headR += (target - headR) * (target > headR ? .3 : .05);
    // lay stamps along the path so fast moves leave a continuous smear
    var life = 900;
    if (headR > 3) {
      if (!last) last = { x: mouse.x, y: mouse.y };
      var dx = mouse.x - last.x, dy = mouse.y - last.y, d = Math.hypot(dx, dy), step = 7;
      var n = Math.floor(d / step);
      for (var k = 1; k <= n; k++) {
        var f = k / n;
        stamps.push({ x: last.x + dx * f, y: last.y + dy * f, r: headR * (.7 + .3 * Math.random()), born: now });
      }
      if (n > 0) last = { x: last.x + dx * (n * step / d), y: last.y + dy * (n * step / d) };
      if (stamps.length > 110) stamps.splice(0, stamps.length - 110);
    } else last = null;
    stamps = stamps.filter(function (p) { return now - p.born < life; });
    var live = stamps.map(function (p) {
      var k = 1 - (now - p.born) / life;
      return { x: p.x, y: p.y, r: p.r * Math.pow(k, .75) };
    });
    if (headR > 3) live.push({ x: mouse.x, y: mouse.y, r: headR });
    var loops = live.length ? contours(live, t) : [];
    drawGrid(live, now);
    paint(loops);
  }

  /* gradient colour under a point (matches the 135deg gradient + 20s hue loop) */
  var stops = [[255, 179, 71, 0], [255, 79, 163, .35], [79, 125, 255, .7], [43, 212, 198, 1]];
  function blobColor(x, y, now) {
    var W = window.innerWidth, H = window.innerHeight, L = Math.hypot(W, H), dx = W / L, dy = H / L;
    var glen = W * dx + H * dy, u = Math.max(0, Math.min(1, ((x - W / 2) * dx + (y - H / 2) * dy) / glen + .5));
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
    var c = gridCanvas; if (!c || !c.isConnected) return;
    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    var cs = CFG.gridSize, life = CFG.gridDecay * 1000;
    balls.forEach(function (b) {
      var rr = b.r * .95; if (rr < 4) return;
      var i0 = Math.floor((b.x - rr) / cs), i1 = Math.floor((b.x + rr) / cs), j0 = Math.floor((b.y - rr) / cs), j1 = Math.floor((b.y + rr) / cs);
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
        var cx = (i + .5) * cs, cy = (j + .5) * cs;
        if ((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y) > rr * rr) continue;
        var k = i + ',' + j, prev = cells.get(k);
        if (!prev || now - prev.t > 60) cells.set(k, { i: i, j: j, t: now, col: blobColor(cx, cy, now) });
      }
    });
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    cells.forEach(function (v, k) {
      var a = 1 - (now - v.t) / life;
      if (a <= 0) { cells.delete(k); return; }
      var op = CFG.gridOpacity, x = v.i * cs, y = v.j * cs;
      ctx.fillStyle = inverted
        ? 'rgba(255,255,255,' + (a * a * op * .85).toFixed(3) + ')'
        : 'hsla(' + v.col[0].toFixed(0) + ',' + v.col[1].toFixed(0) + '%,' + v.col[2].toFixed(0) + '%,' + (a * a * op).toFixed(3) + ')';
      ctx.fillRect(x, y, cs, cs);
    });
    c.style.mixBlendMode = inverted ? 'normal' : 'difference';
    // inverted: hide the canvas and cut the same cells as holes through the
    // invert layer via a low-res alpha mask (1 px per cell)
    var IL = invertLayer;
    if (holeMode && IL) {
      c.style.visibility = 'hidden';
      var m = maskC || (maskC = document.createElement('canvas'));
      var mw = Math.ceil(W / cs), mh = Math.ceil(H / cs);
      if (m.width !== mw || m.height !== mh) { m.width = mw; m.height = mh; }
      var mx = m.getContext('2d');
      mx.globalCompositeOperation = 'source-over'; mx.fillStyle = '#fff'; mx.fillRect(0, 0, mw, mh);
      mx.globalCompositeOperation = 'destination-out';
      cells.forEach(function (v) {
        var a = 1 - (now - v.t) / life;
        mx.fillStyle = 'rgba(0,0,0,' + Math.min(1, a * a * CFG.gridOpacity).toFixed(3) + ')';
        mx.fillRect(v.i, v.j, 1, 1);
      });
      var url = 'url(' + m.toDataURL() + ')';
      IL.style.webkitMaskImage = IL.style.maskImage = url;
      IL.style.webkitMaskSize = IL.style.maskSize = (mw * cs) + 'px ' + (mh * cs) + 'px';
      IL.style.webkitMaskRepeat = IL.style.maskRepeat = 'no-repeat';
      IL.style.imageRendering = 'pixelated';
    } else {
      c.style.visibility = '';
      if (IL && IL.style.maskImage) { IL.style.webkitMaskImage = IL.style.maskImage = 'none'; }
    }
  }

  /* metaball field on an 8px grid -> marching squares -> chained, smoothed loops */
  function contours(balls, t) {
    var cs = 8, W = window.innerWidth, H = window.innerHeight;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    balls.forEach(function (b) {
      var m = b.r * 1.4 + 2 * cs;
      x0 = Math.min(x0, b.x - m); y0 = Math.min(y0, b.y - m);
      x1 = Math.max(x1, b.x + m); y1 = Math.max(y1, b.y + m);
    });
    x0 = Math.max(-2 * W, x0); y0 = Math.max(-2 * H, y0); x1 = Math.min(3 * W, x1); y1 = Math.min(3 * H, y1);
    var nx = Math.ceil((x1 - x0) / cs) + 1, ny = Math.ceil((y1 - y0) / cs) + 1;
    if (nx < 2 || ny < 2 || nx * ny > 90000) return [];
    var f = new Float32Array(nx * ny);
    for (var j = 0; j < ny; j++) {
      var y = y0 + j * cs;
      for (var i = 0; i < nx; i++) {
        var x = x0 + i * cs, v = 0;
        // compact-support falloff: each stamp contributes 1 at its centre and
        // exactly 0 at d = 1.35r, so the field can't saturate
        for (var k = 0; k < balls.length; k++) {
          var b = balls[k], dx = x - b.x, dy = y - b.y, R = b.r * 1.35, q = (dx * dx + dy * dy) / (R * R);
          if (q < 1) { var w = 1 - q; v += w * w * w; }
        }
        v += .06 * Math.sin(x * .05 + t * 4.5) * Math.sin(y * .055 - t * 3.2); // surface ripple
        f[j * nx + i] = v;
      }
    }
    var T = .32, segs = [];
    var lerp = function (p, q, va, vb) { var u = (T - va) / (vb - va); return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; };
    var TABLE = [[], [[3, 2]], [[1, 2]], [[3, 1]], [[0, 1]], [[0, 3], [1, 2]], [[0, 2]], [[0, 3]], [[0, 3]], [[0, 2]], [[0, 1], [2, 3]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 2]], []];
    for (var jj = 0; jj < ny - 1; jj++) for (var ii = 0; ii < nx - 1; ii++) {
      var a = f[jj * nx + ii], b2 = f[jj * nx + ii + 1], c2 = f[(jj + 1) * nx + ii + 1], d2 = f[(jj + 1) * nx + ii];
      var idx = (a > T ? 8 : 0) | (b2 > T ? 4 : 0) | (c2 > T ? 2 : 0) | (d2 > T ? 1 : 0);
      if (!idx || idx === 15) continue;
      if ((idx === 5 || idx === 10) && ((a + b2 + c2 + d2) / 4 > T)) idx = idx === 5 ? 10 : 5; // saddle: choose pairing by centre value so chains never cross
      var X = x0 + ii * cs, Y = y0 + jj * cs;
      var P = [[X, Y], [X + cs, Y], [X + cs, Y + cs], [X, Y + cs]], V = [a, b2, c2, d2];
      var E = function (e2) { return lerp(P[e2], P[(e2 + 1) % 4], V[e2], V[(e2 + 1) % 4]); };
      TABLE[idx].forEach(function (pr) { segs.push([E(pr[0]), E(pr[1])]); });
    }
    // chain segments into loops
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
      var f0 = loop[0], l0 = loop[loop.length - 1];
      if (loop.length > 5 && Math.hypot(f0[0] - l0[0], f0[1] - l0[1]) <= cs * 1.6) loops.push(smooth(smooth(loop)));
    }
    return loops;
  }

  function smooth(l) { // Chaikin corner-cutting, closed loop
    var out = [];
    for (var i = 0; i < l.length; i++) {
      var p = l[i], q = l[(i + 1) % l.length];
      out.push([p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [p[0] * .25 + q[0] * .75, p[1] * .25 + q[1] * .75]);
    }
    return out;
  }

  function paint(loops) {
    var layer = (blobLayer && blobLayer.isConnected) ? blobLayer : null;
    var grid = (gridCanvas && gridCanvas.isConnected) ? gridCanvas : null;
    var poly = function (ox, oy, L) {
      return (L || loops).map(function (l) {
        return '0px 0px,' + l.map(function (p) { return (p[0] - ox).toFixed(1) + 'px ' + (p[1] - oy).toFixed(1) + 'px'; }).join(',') + ',' + (l[0][0] - ox).toFixed(1) + 'px ' + (l[0][1] - oy).toFixed(1) + 'px,0px 0px';
      }).join(',');
    };
    if (layer) layer.style.clipPath = loops.length ? 'polygon(evenodd,' + poly(0, 0) + ')' : 'polygon(0 0,0 0,0 0)';
    lastLoops = loops;
    var IL = invertLayer;
    if (IL && holeMode) IL.style.clipPath = 'polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0' + (loops.length ? ',' + poly(0, 0) : '') + ')';
    if (layer || grid) {
      // keep the difference-blend off the video tiles so they reveal colour
      // instead of inverting
      var so = stackOuter, ob = so && so.getBoundingClientRect();
      var entering = S.view === 'home' && performance.now() - homeAt < 2400;
      var tiles = (S.view === 'home' && ob && !entering)
        ? stackTiles.filter(Boolean).map(function (el) {
            var b = el.getBoundingClientRect();
            var top = Math.max(b.top, ob.top), bottom = Math.min(b.bottom, ob.bottom);
            return { left: b.left, top: top, width: b.width, height: bottom - top };
          }).filter(function (b) { return b.width && b.height > 0; })
        : S.view === 'project'
          ? stripTiles.filter(Boolean).map(function (el) {
              var b = el.getBoundingClientRect();
              var left = Math.max(0, b.left), right = Math.min(window.innerWidth, b.right);
              return { left: left, top: b.top, width: right - left, height: b.height };
            }).filter(function (b) { return b.width > 0 && b.height; })
          : [];
      var sig = tiles.map(function (b) { return Math.round(b.left) + ',' + Math.round(b.top) + ',' + Math.round(b.width) + ',' + Math.round(b.height); }).join('|');
      [layer, grid].filter(Boolean).forEach(function (L) {
        if (L.dataset.sig === sig) return;
        L.dataset.sig = sig;
        if (tiles.length) {
          L.style.webkitMaskImage = L.style.maskImage = Array(tiles.length + 1).fill('linear-gradient(#000,#000)').join(',');
          L.style.webkitMaskSize = L.style.maskSize = ['100% 100%'].concat(tiles.map(function (b) { return Math.round(b.width) + 'px ' + Math.round(b.height) + 'px'; })).join(',');
          L.style.webkitMaskPosition = L.style.maskPosition = ['0 0'].concat(tiles.map(function (b) { return Math.round(b.left) + 'px ' + Math.round(b.top) + 'px'; })).join(',');
          L.style.webkitMaskRepeat = L.style.maskRepeat = 'no-repeat';
          L.style.webkitMaskComposite = ['xor'].concat(tiles.map(function () { return 'source-over'; })).join(',');
          L.style.maskComposite = ['exclude'].concat(tiles.map(function () { return 'add'; })).join(',');
        } else {
          L.style.webkitMaskImage = L.style.maskImage = 'none';
        }
      });
    }
    // per-tile SVG filter: feImage mask (blob in tile-local coords) -> colour
    // inside, desaturated outside
    maskEls.forEach(function (el, i) {
      var fe = feEls[i];
      if (!fe || !el) return;
      var b = el.getBoundingClientRect(); if (!b.width) return;
      var hit = loops.filter(function (l) {
        return l.some(function (p) { return p[0] >= b.left - 2 && p[0] <= b.right + 2 && p[1] >= b.top - 2 && p[1] <= b.bottom + 2; }) || inside(l, b);
      });
      var g = grayEls[i];
      if (g) g.style.clipPath = hit.length ? 'polygon(evenodd,0 0,' + b.width + 'px 0,' + b.width + 'px ' + b.height + 'px,0 ' + b.height + 'px,0 0,' + poly(b.left, b.top, hit) + ')' : '';
      var dpath = '';
      hit.forEach(function (l) {
        dpath += 'M' + l.map(function (p) { return (p[0] - b.left).toFixed(1) + ' ' + (p[1] - b.top).toFixed(1); }).join('L') + 'Z';
      });
      var svg = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + Math.round(b.width) + "' height='" + Math.round(b.height) + "' viewBox='0 0 " + Math.round(b.width) + ' ' + Math.round(b.height) + "'>" + (dpath ? "<path fill='#fff' fill-rule='evenodd' d='" + dpath + "'/>" : '') + '</svg>');
      if (fe.dataset.h !== svg) {
        fe.dataset.h = svg;
        fe.setAttribute('href', svg);
        fe.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', svg);
      }
    });
  }

  function inside(loop, b) { // does the loop fully contain the tile? (point-in-polygon on tile centre)
    var x = (b.left + b.right) / 2, y = (b.top + b.bottom) / 2, c = false;
    for (var i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      var a = loop[i], q = loop[j];
      if ((a[1] > y) !== (q[1] > y) && x < (q[0] - a[0]) * (y - a[1]) / (q[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }

  /* ---------------- boot ---------------- */
  dot.addEventListener('click', toggleInvert);
  app.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('mousemove', onPointer);

  renderView('home');
  t3 = setTimeout(function () { S.stackLive = true; syncStackIframes(); }, 300);
  raf = requestAnimationFrame(tick);
})();
