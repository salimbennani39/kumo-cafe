/* Kumo page code. The engine is untouched; everything bespoke lives here:
   the cartouche, the hero's pointer depth and petals, the menu settle, and the
   signature move, "Pour your sign". */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WA = '34647591229';
  var root = document.documentElement;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* --------------------------------------------- plates and the cartouche */
  var plates = Array.prototype.slice.call(document.querySelectorAll('.plate'));
  var grounds = {
    sky:   ['#F4E7D7', '#1E2A44', '#B5392A'],
    blush: ['#F5E0D8', '#1E2A44', '#B5392A'],
    paper: ['#FAF2E8', '#1E2A44', '#B5392A'],
    night: ['#1E2A44', '#F4E7D7', '#EC8070']
  };
  var cartJp = document.querySelector('[data-cart-jp]');
  var cartEn = document.querySelector('[data-cart-en]');
  var cartBtn = document.querySelector('.cartouche__tab');
  var cartList = document.getElementById('plate-list');
  var listLinks = Array.prototype.slice.call(cartList.querySelectorAll('a'));
  var current = -1;

  function groundOf(el) {
    for (var k in grounds) if (el.classList.contains('plate--' + k)) return grounds[k];
    return grounds.sky;
  }
  function trackPlate() {
    var probe = window.innerHeight * 0.3, idx = 0;
    for (var i = 0; i < plates.length; i++) {
      var r = plates[i].getBoundingClientRect();
      if (r.top <= probe) idx = i;
    }
    if (idx === current) return;
    current = idx;
    var el = plates[idx], g = groundOf(el);
    root.style.setProperty('--bar-bg', g[0]);
    root.style.setProperty('--bar-ink', g[1]);
    root.style.setProperty('--bar-accent', g[2]);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', g[0]);
    cartJp.textContent = el.getAttribute('data-plate-jp');
    cartEn.textContent = el.getAttribute('data-plate-en');
    listLinks.forEach(function (a, i) { if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }

  function setList(open) {
    cartList.hidden = !open;
    cartBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  cartBtn.addEventListener('click', function () { setList(cartList.hidden); if (!cartList.hidden) listLinks[Math.max(current, 0)].focus(); });
  listLinks.forEach(function (a) { a.addEventListener('click', function () { setList(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cartList.hidden) { setList(false); cartBtn.focus(); } });
  document.addEventListener('click', function (e) { if (!cartList.hidden && !e.target.closest('.cartouche')) setList(false); });

  /* ----------------------------------------------------- hero: depth, petals */
  var heroStage = document.querySelector('.hero__stage');
  var heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      heroVisible = es[0].isIntersecting;
      heroStage.classList.toggle('is-offscreen', !heroVisible);
    }).observe(heroStage.parentNode);
  }
  if (!reduce) {
    var petals = heroStage.querySelector('.petals');
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('span');
      s.className = 'petal';
      var size = 9 + Math.random() * 8;
      s.style.cssText = 'left:' + (8 + Math.random() * 96).toFixed(1) + '%;width:' + size.toFixed(1) + 'px;height:' + (size * 0.7).toFixed(1) +
        'px;--d:' + (12 + Math.random() * 10).toFixed(1) + 's;--delay:' + (-Math.random() * 20).toFixed(1) + 's;--dx:' + (-6 - Math.random() * 22).toFixed(1) + 'vw';
      petals.appendChild(s);
    }
  }
  var mx = 0, my = 0, tx = 0, ty = 0, pointerLoop = false;
  function pointerTick() {
    mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
    heroStage.style.setProperty('--mx', mx.toFixed(3));
    heroStage.style.setProperty('--my', my.toFixed(3));
    if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) requestAnimationFrame(pointerTick);
    else pointerLoop = false;
  }
  if (finePointer && !reduce) {
    window.addEventListener('pointermove', function (e) {
      if (!heroVisible) return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!pointerLoop) { pointerLoop = true; requestAnimationFrame(pointerTick); }
    }, { passive: true });
  }

  /* --------------------------------------------- menu: panels settle in turn */
  var rail = document.querySelector('.menu__rail');
  function measureRail() {
    var vw = window.innerWidth, over = Math.max(rail.scrollWidth - vw, 1);
    Array.prototype.forEach.call(rail.querySelectorAll('.panel, .menu__end'), function (el) {
      var pFull = Math.max(0, (el.offsetLeft - vw * 0.72) / over);
      el.style.setProperty('--k', (pFull * 9 - 1).toFixed(3));
    });
  }

  /* ----------------------------------------- the signature: pour your sign */
  var C = { matcha: '#6F9238', latte: '#9DB66A', milk: '#F3EADB', sakura: '#EFA6B2', mango: '#F2B33D', honey: '#DFA23A',
            deep: '#4E6E25', fizz: '#C4D97F', mizu: '#BCD186', blue: '#6E89CF', blueMilk: '#D9E1F2', choco: '#6B4430' };
  // Pairings marked "post" come from Kumo's own zodiac series; the rest are
  // drawn from the real menu and are for the owner to confirm (see BRIEF.md).
  var SIGNS = [
    { n: 'Aries', d: '21 Mar to 19 Apr', drink: 'Matcha Tea', trait: 'Pure, bold, and unapologetic.', line: "You don't need extras to stand out, your energy speaks first.", L: [[C.matcha, 1]], hot: 1, max: 0.84 },
    { n: 'Taurus', d: '20 Apr to 20 May', drink: 'Neko Matcha Latte', trait: 'Warm, sensual, and comforting.', line: 'You are grounded to the core, animal obsessed, quietly competitive. Simply you, in a cup!', L: [[C.milk, .35], [C.latte, .65]], hot: 1, neko: 1, max: 0.86 },
    { n: 'Gemini', d: '21 May to 20 Jun', drink: 'Mango Matcha Latte', trait: 'Curious, quick, never just one flavour.', line: 'Two moods in one glass: bright mango below, matcha on top. You like it that way.', L: [[C.mango, .3], [C.milk, .3], [C.matcha, .4]], ice: 1 },
    { n: 'Cancer', d: '21 Jun to 22 Jul', drink: 'Sakura Matcha Latte', trait: 'Delicate and nostalgic.', line: 'Like a warm hug, you carry spring in your heart, even when the sky turns grey.', L: [[C.sakura, .32], [C.milk, .33], [C.matcha, .35]], ice: 1 },
    { n: 'Leo', d: '23 Jul to 22 Aug', drink: 'Matcha Heaven', trait: 'Radiant, generous, a little dramatic.', line: 'You arrive like royalty and melt hearts without trying.', L: [[C.milk, .45], [C.latte, .55]], heaven: 1, max: 0.8 },
    { n: 'Virgo', d: '23 Aug to 22 Sep', drink: 'Mizu Matcha', trait: 'Clear, calm, and essential.', line: "You listen deeply, and turn small talk into soul talk. That's why you keep refilling your own glass.", L: [[C.mizu, 1]], ice: 1 },
    { n: 'Libra', d: '23 Sep to 22 Oct', drink: 'Matcha Honey', trait: 'Balanced, graceful, a little sweet.', line: 'Iced ceremonial matcha, softened with honey. Nothing sharp, nothing missing.', L: [[C.honey, .14], [C.matcha, .86]], ice: 1 },
    { n: 'Scorpio', d: '23 Oct to 21 Nov', drink: 'Matcha Shot', trait: 'Intense, magnetic, all depth.', line: 'A concentrated shot of ceremonial grade matcha. Small, dark, unforgettable.', L: [[C.deep, 1]], max: 0.3 },
    { n: 'Sagittarius', d: '22 Nov to 21 Dec', drink: 'Matcha Lemonade', trait: 'Restless, bright, always somewhere new.', line: 'Soda, ceremonial matcha and lemon. It fizzes like your plans.', L: [[C.fizz, 1]], ice: 1, fizz: 1, lemon: 1 },
    { n: 'Capricorn', d: '22 Dec to 19 Jan', drink: 'Matcha Latte', trait: 'Steady, patient, quietly ambitious.', line: 'Milk and ceremonial grade matcha. The classic, done properly, every time.', L: [[C.milk, .4], [C.latte, .6]], hot: 1, max: 0.88 },
    { n: 'Aquarius', d: '20 Jan to 18 Feb', drink: 'Blue Matcha Latte', trait: 'Original, airy, ahead of the room.', line: 'Milk and butterfly pea flower. Blue, because of course it is.', L: [[C.blue, .55], [C.blueMilk, .45]], ice: 1 },
    { n: 'Pisces', d: '19 Feb to 20 Mar', drink: 'Cotton Cheesecake + Matcha Choco', trait: 'Soft, intuitive and dreamy.', line: 'You like to keep it low profile, yet with one bite open a whole new sky. Are you even real?', L: [[C.choco, .4], [C.latte, .6]], cake: 1, max: 0.86 }
  ];
  function signForDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    var edges = [[1, 20, 10], [2, 19, 11], [3, 21, 0], [4, 20, 1], [5, 21, 2], [6, 21, 3], [7, 23, 4], [8, 23, 5], [9, 23, 6], [10, 23, 7], [11, 22, 8], [12, 22, 9]];
    var e = edges[m - 1];
    return day >= e[1] ? e[2] : (e[2] + 11) % 12;
  }

  var sign = document.getElementById('sign');
  var dial = sign.querySelector('[data-dial]');
  var signsBox = sign.querySelector('[data-signs]');
  var glass = sign.querySelector('.glass');
  var layersG = glass.querySelector('[data-layers]');
  var stream = glass.querySelector('.glass__stream');
  var extras = {};
  Array.prototype.forEach.call(glass.querySelectorAll('[data-extra]'), function (g) { (extras[g.getAttribute('data-extra')] = extras[g.getAttribute('data-extra')] || []).push(g); });
  var side = glass.querySelector('.glass__side');
  var copy = sign.querySelector('.sign__copy');
  var out = {
    today: sign.querySelector('[data-today]'), name: sign.querySelector('[data-name]'), drink: sign.querySelector('[data-drink]'),
    trait: sign.querySelector('[data-trait]'), line: sign.querySelector('[data-line]')
  };
  var carries = Array.prototype.slice.call(document.querySelectorAll('[data-carry]'));
  var waLinks = Array.prototype.slice.call(document.querySelectorAll('[data-wa]'));

  var todayIdx = signForDate(new Date());
  var saved = parseInt(store('kumo-sign'), 10);
  var idx = saved >= 0 && saved < 12 ? saved : todayIdx;
  var chosen = saved >= 0 && saved < 12;
  var rects = [];
  var buttons = SIGNS.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'dial__sign';
    b.setAttribute('role', 'radio');
    b.style.setProperty('--i', i);
    b.textContent = s.n;
    b.addEventListener('click', function () { select(i, true); });
    b.addEventListener('keydown', function (e) {
      var k = e.key, step = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 : (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var n = (i + step + 12) % 12; select(n, true); buttons[n].focus();
    });
    signsBox.appendChild(b);
    return b;
  });

  function waHref() {
    var text = "Hello Kumo! I'd like to order.";
    if (chosen) text = "Hello Kumo! I'd like to order. I'm a " + SIGNS[idx].n + ', so: ' + SIGNS[idx].drink + '.';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }
  function syncCarry() {
    var s = SIGNS[idx];
    waLinks.forEach(function (a) { a.href = waHref(); });
    carries.forEach(function (p) { p.textContent = chosen ? 'Your message already mentions the ' + s.drink + ' (' + s.n + ').' : ''; });
  }

  var t0 = -1e9;   // when the current re-pour began
  function select(i, byHand) {
    var changed = i !== idx;
    idx = i;
    var s = SIGNS[i];
    buttons.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
    dial.style.setProperty('--rot', (-i * 30) + 'deg');
    out.today.textContent = i === todayIdx ? "Today's sign. Tap yours." : s.d;
    out.name.textContent = s.n;
    out.drink.textContent = s.drink;
    out.trait.textContent = s.trait;
    out.line.textContent = s.line;
    if (byHand) {
      chosen = true; store('kumo-sign', String(i));
      if (changed) {
        copy.classList.remove('swap'); void copy.offsetWidth; copy.classList.add('swap');
        if (!reduce) t0 = performance.now();
      }
    }
    // rebuild the liquid for this recipe
    layersG.textContent = '';
    rects = s.L.map(function (l) {
      var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', 70); r.setAttribute('width', 120); r.setAttribute('fill', l[0]);
      layersG.appendChild(r);
      return r;
    });
    syncCarry();
    last = -1;
  }

  var Y_BOTTOM = 274, H = 228, last = -1, liveSign = false;
  function render(fill) {
    var s = SIGNS[idx], max = s.max || 0.9, level = fill * max * H, acc = 0, active = s.L[0][0];
    for (var i = 0; i < rects.length; i++) {
      var hgt = s.L[i][1] * max * H, from = acc, to = Math.min(acc + hgt, level);
      var h = Math.max(0, to - from);
      rects[i].setAttribute('y', (Y_BOTTOM - from - h).toFixed(1));
      rects[i].setAttribute('height', h.toFixed(1));
      if (level > from) active = s.L[i][0];
      acc += hgt;
    }
    var surface = Y_BOTTOM - level;
    stream.setAttribute('height', Math.max(0, surface - 6).toFixed(1));
    stream.setAttribute('fill', active);
    var full = fill > 0.97;
    function on(key, cond, y) {
      (extras[key] || []).forEach(function (g) {
        g.classList.toggle('on', !!cond);
        if (y !== undefined) g.setAttribute('transform', 'translate(0 ' + y.toFixed(1) + ')');
      });
    }
    on('ice', s.ice && fill > 0.55, surface - 8);
    on('neko', s.neko && full, surface + 2);
    on('bubbles', s.fizz && fill > 0.85);
    on('heaven', s.heaven && full);
    on('lemon', s.lemon && full);
    on('steam', s.hot && full, Y_BOTTOM - max * H - 2);
    side.classList.toggle('on', !!s.cake);
  }

  function signTick(now) {
    if (liveSign) requestAnimationFrame(signTick);
    var p = parseFloat(sign.style.getPropertyValue('--sc-p')) || 0;
    var scrollFill = reduce ? 1 : ease(clamp01((p - 0.24) / 0.5));
    var handFill = reduce ? 1 : ease(clamp01((now - t0) / 1200));
    var fill = Math.min(scrollFill, handFill);
    if (!chosen && scrollFill >= 1) { chosen = true; syncCarry(); }
    glass.classList.toggle('is-pouring', !reduce && fill > 0.004 && fill < 0.985 && (handFill < 1 || (p > 0.24 && p < 0.74)));
    if (Math.abs(fill - last) > 0.0005) { render(fill); last = fill; }
  }

  select(idx, false);
  render(reduce ? 1 : 0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var was = liveSign; liveSign = es[0].isIntersecting;
      if (liveSign && !was) requestAnimationFrame(signTick);
    }).observe(sign);
  } else { liveSign = true; requestAnimationFrame(signTick); }

  /* ------------------------------------------------------------ the loop */
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; trackPlate(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measureRail(); onScroll(); });
  trackPlate();
  measureRail();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureRail);
})();
