/* Release groups case: animated "Move multiple devices" wizard.
   Builds the stage inside every [data-rg-wizard] element and plays one loop:
   select company → select devices → select new group → confirmation.
   Plays only while visible; with reduced motion it shows the static Confirmation step. */
(function () {
  'use strict';

  var script = document.currentScript;
  var ASSETS = new URL('assets/', script ? script.src : location.href).href;
  var STAGE_W = 1600;

  // ── Copy from the Figma frames (word for word) ──
  var COMPANIES = ['Backhaus Krämer', 'Backstube Wendel', 'Bäckerei Lindner GmbH', 'Bäckerei Seidel am Markt',
    'Brotmanufaktur Holm', 'Café Rosenhain', 'Café Sonnenhof GmbH', 'Feinbäckerei Ott',
    'Konditorei Albrecht', 'Landbäckerei Brandt'];
  var DEVICES = [
    ['Café Ecke', 'SC23071N0214', 'Hamburg', 'Ottensen'],
    ['Filiale Altona 1', 'SC23071N0220', 'Hamburg', 'Altona'],
    ['Filiale Altona 2', 'SC23071N0221', 'Hamburg', 'Altona'],
    ['Hauptkasse', 'SC22094C0558', 'Hamburg', 'Eimsbüttel'],
    ['Markthalle', 'SC23102P0415', 'Hamburg', 'Winterhude'],
    ['Wagen 1', 'SC24059K0077', 'Hamburg', 'Wochenmarkt'],
    ['Wagen 2', 'SC24059K0078', 'Hamburg', 'Wochenmarkt'],
    ['Zentrale', 'SC21118L0399', 'Pinneberg', 'Bahnhofstraße']
  ];
  var PICKED = [3, 5, 6]; // Hauptkasse, Wagen 1, Wagen 2
  var GROUPS = ['Pilot', 'Test', 'Wave', 'Enterprise'];
  var WAVE = 2;
  var STEPS = ['Select company', 'Select devices', 'Select new group', 'Confirmation'];

  var ROW = 77.5;      // table row pitch: rule, 12.5 gap, 52.5 row, 12.5 gap
  var ITEM = 70;       // list item pitch: 60 item + 10 gap

  function img(name, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + ASSETS + name + '" alt="">';
  }
  function px(n) { return n + 'px'; }

  function markup() {
    var h = '';
    h += '<div class="rgw-stage" aria-hidden="true"><div class="rgw-paper">';
    h += '<div class="a rgw-title">Move multiple devices</div>';
    h += '<div class="a rgw-hr rgw-hr-top"></div><div class="a rgw-hr rgw-hr-bottom"></div><div class="a rgw-vr"></div>';
    h += '<div class="rgw-body">';

    // Stepper
    STEPS.forEach(function (s, i) {
      var top = 111.25 + i * ITEM;
      h += '<div class="rgw-step" data-step="' + (i + 1) + '">' +
        '<div class="a rgw-step-icon" style="top:' + px(top) + '"><span>' + (i + 1) + '</span>' + img('step-done.svg') + '</div>' +
        '<div class="a rgw-step-label" style="top:' + px(top) + '">' + s + '</div></div>';
      if (i < 3) h += '<div class="a rgw-connector" style="top:' + px(top + 40) + '"></div>';
    });

    // Step 1: Select company
    h += '<div class="rgw-panel" data-panel="1">';
    h += '<div class="a rgw-h">Select company</div>';
    h += '<div class="a rgw-search" style="width:581.25px">Search' + img('search.svg') + '</div>';
    h += '<div class="a rgw-list" style="top:228.75px;height:665px">';
    COMPANIES.forEach(function (c, i) {
      h += '<div class="rgw-item" data-company="' + i + '" style="top:' + px(i * ITEM) + '">' + c + img('check.svg') + '</div>';
    });
    h += '</div></div>';

    // Step 2: Select devices
    h += '<div class="rgw-panel" data-panel="2">';
    h += '<div class="a rgw-h">Select devices</div>';
    h += '<div class="a rgw-chip"><span>0 selected</span></div>';
    h += '<div class="a rgw-search" style="width:461.25px">Search' + img('search.svg') + '</div>';
    h += '<div class="a" style="left:770px;top:158.75px">' + img('view-toggle-bg.svg') + '</div>';
    h += '<div class="a" style="left:770px;top:158.75px">' + img('view-toggle.svg') + '</div>';
    h += '<div class="a rgw-cb rgw-cb-all" style="left:288.75px;top:225px"><i></i>' + img('checkbox-indeterminate.svg') + '</div>';
    h += '<div class="a rgw-th" style="left:333.75px">Device</div>';
    h += '<div class="a rgw-sort" style="left:388.75px;top:228.75px">' + img('arrow-downward.svg') + '</div>';
    h += '<div class="a rgw-th" style="left:580px">Location</div>';
    h += '<div class="a rgw-th" style="left:735px">Branch</div>';
    h += '<div class="a rgw-rows" style="top:263.75px;height:630px">';
    DEVICES.forEach(function (d, i) { h += '<div class="rgw-band" data-band="' + i + '" style="top:' + px(i * ROW) + '"></div>'; });
    for (var r = 0; r <= DEVICES.length; r++) h += '<div class="rgw-rule" style="top:' + px(r * ROW) + '"></div>';
    DEVICES.forEach(function (d, i) {
      h += '<div class="rgw-row" style="top:' + px(i * ROW + 12.5) + '">' +
        '<div class="rgw-cb" data-device="' + i + '"><i></i>' + img('checkbox-checked.svg') + '</div>' +
        '<div class="rgw-td" style="left:45px;top:0">' + d[0] + '</div>' +
        '<div class="rgw-td is-sub" style="left:45px">' + d[1] + '</div>' +
        '<div class="rgw-td is-mid" style="left:291.25px">' + d[2] + '</div>' +
        '<div class="rgw-td is-mid" style="left:446.25px">' + d[3] + '</div></div>';
    });
    h += '</div></div>';

    // Step 3: Select new group
    h += '<div class="rgw-panel" data-panel="3">';
    h += '<div class="a rgw-h">Select new group</div>';
    h += '<div class="a rgw-list" style="top:163.75px;height:643.75px">';
    GROUPS.forEach(function (g, i) {
      h += '<div class="rgw-item" data-group="' + i + '" style="top:' + px(i * ITEM) + '">' + g + img('check.svg') + '</div>';
    });
    h += '</div></div>';

    // Step 4: Confirmation
    h += '<div class="rgw-panel" data-panel="4">';
    h += '<div class="a rgw-h">Confirmation</div>';
    h += '<dl class="a rgw-summary"><div><dt>App</dt><dd>Smart Checkout</dd></div><hr>' +
      '<div><dt>Company</dt><dd>Backhaus Krämer</dd></div></dl>';
    h += '<div class="a rgw-alert">' + img('info-outlined.svg') +
      '<p style="top:15px">The selected devices will be moved to the <b>Wave</b> group.</p>' +
      '<p style="top:37.5px">The group\'s current version will be installed automatically.</p></div>';
    h += '<div class="a rgw-th" style="left:288.75px;top:328.75px">Device</div>';
    h += '<div class="a rgw-sort" style="left:343.75px;top:328.75px">' + img('arrow-downward.svg') + '</div>';
    h += '<div class="a rgw-th" style="left:550px;top:328.75px">Location</div>';
    h += '<div class="a rgw-th" style="left:697.5px;top:328.75px">Branch</div>';
    h += '<div class="a rgw-rows" style="top:362.5px;height:531.25px">';
    for (var k = 0; k <= PICKED.length; k++) h += '<div class="rgw-rule" style="top:' + px(k * ROW) + '"></div>';
    PICKED.forEach(function (idx, i) {
      var d = DEVICES[idx];
      h += '<div class="rgw-row" style="top:' + px(i * ROW + 12.5) + '">' +
        '<div class="rgw-td" style="left:0;top:0">' + d[0] + '</div>' +
        '<div class="rgw-td is-sub" style="left:0">' + d[1] + '</div>' +
        '<div class="rgw-td is-mid" style="left:261.25px">' + d[2] + '</div>' +
        '<div class="rgw-td is-mid" style="left:408.75px">' + d[3] + '</div></div>';
    });
    h += '</div></div>';

    // Footer
    h += '<div class="a rgw-actions"><div class="rgw-btn rgw-btn-outlined">Cancel</div>' +
      '<div class="rgw-btn rgw-btn-contained"><span class="rgw-btn-label">Continue</span><span class="rgw-ripple"></span></div></div>';

    h += '</div></div>'; // .rgw-body, .rgw-paper
    h += '<div class="rgw-ring"></div><div class="rgw-cursor"><i></i></div>';
    h += '</div>';
    return h;
  }

  // ── Motion helpers ──
  function easeInOut(p) { return -(Math.cos(Math.PI * p) - 1) / 2; } // sine: soft start and stop, calm peak speed
  // Quadratic curve with the control point pushed sideways: a slight arc instead of a straight line
  function arc(a, b, p) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var cx = (a[0] + b[0]) / 2 + dy * 0.14, cy = (a[1] + b[1]) / 2 - dx * 0.14;
    var u = 1 - p;
    return [u * u * a[0] + 2 * u * p * cx + p * p * b[0], u * u * a[1] + 2 * u * p * cy + p * p * b[1]];
  }
  function restartClass(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function init(host) {
    host.classList.add('rgw');
    host.innerHTML = markup();

    var stage = host.querySelector('.rgw-stage');
    var body = host.querySelector('.rgw-body');
    var cursor = host.querySelector('.rgw-cursor');
    var ring = host.querySelector('.rgw-ring');
    var steps = [].slice.call(host.querySelectorAll('.rgw-step'));
    var panels = [].slice.call(host.querySelectorAll('.rgw-panel'));
    var primary = host.querySelector('.rgw-btn-contained');
    var primaryLabel = host.querySelector('.rgw-btn-label');
    var chip = host.querySelector('.rgw-chip');
    var chipText = chip.querySelector('span');
    var cbAll = host.querySelector('.rgw-cb-all');
    function company(i) { return host.querySelector('[data-company="' + i + '"]'); }
    function group(i) { return host.querySelector('[data-group="' + i + '"]'); }
    function checkbox(i) { return host.querySelector('[data-device="' + i + '"]'); }
    function band(i) { return host.querySelector('[data-band="' + i + '"]'); }

    // Scale the 1600×1200 stage to the container width
    function fit() { stage.style.transform = 'scale(' + (host.clientWidth / STAGE_W) + ')'; }
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host);
    else window.addEventListener('resize', fit);

    // Point inside an element, in stage px (offsets ignore the scale transform)
    function stagePoint(el, fx, fy) {
      var x = el.offsetWidth * fx, y = el.offsetHeight * fy, n = el;
      while (n && n !== stage) {
        x += n.offsetLeft; y += n.offsetTop;
        n = n.offsetParent;
        if (n && n !== stage) { x += n.clientLeft; y += n.clientTop; }
      }
      return [x, y];
    }

    // ── Wizard state ──
    var selected = [];
    function setStep(n) {
      panels.forEach(function (p, i) { p.classList.toggle('is-current', i === n - 1); });
      steps.forEach(function (s, i) {
        s.classList.toggle('is-done', i < n - 1);
        s.classList.toggle('is-active', i === n - 1);
      });
      primaryLabel.textContent = n === 4 ? 'Move 3 devices' : 'Continue';
    }
    function setDevice(i, on) {
      checkbox(i).classList.toggle('is-on', on);
      selected = selected.filter(function (x) { return x !== i; });
      if (on) selected.push(i);
      if (selected.length) chipText.textContent = selected.length + ' selected';
      chip.classList.toggle('is-shown', selected.length > 0);
      cbAll.classList.toggle('is-on', selected.length > 0);
    }
    var hovered = null;
    function setHover(el) {
      if (hovered) hovered.classList.remove('is-hover');
      hovered = el;
      if (el) el.classList.add('is-hover');
    }
    function setState(final) {
      host.classList.add('rgw-instant');
      setHover(null);
      setStep(final ? 4 : 1);
      company(0).classList.toggle('is-selected', final);
      group(WAVE).classList.toggle('is-selected', final);
      DEVICES.forEach(function (d, i) { setDevice(i, final && PICKED.indexOf(i) > -1); });
      primary.classList.remove('is-pressed');
      void host.offsetWidth;
      host.classList.remove('rgw-instant');
    }

    // ── Timeline (ms). One loop ≈ 16 s ──
    var LOOP = 16000;
    var START = [1430, 760];
    var events = [];
    var moves = [];
    function at(ms, fn) { events.push({ at: ms, run: fn }); }
    function move(ms, dur, target, hover, fx) {
      moves.push({ at: ms, dur: dur, target: target, fx: fx == null ? 0.5 : fx });
      at(ms, function () { if ((hover ? hover() : target()) !== hovered) setHover(null); }); // stays hovered if it doesn't leave
      at(ms + dur, function () { setHover(hover ? hover() : target()); });
    }
    function click(ms, target, effect) {
      at(ms, function () {
        restartClass(cursor, 'is-pressing');
        // Position the ring with left/top: its animation uses `scale`, which would also scale a translate in `transform`
        ring.style.left = (cursorPos[0] - CURSOR_R) + 'px';
        ring.style.top = (cursorPos[1] - CURSOR_R) + 'px';
        restartClass(ring, 'is-on');
        var el = target();
        if (el === primary) restartClass(primary, 'is-pressed');
      });
      at(ms + 90, effect);
    }
    function btn() { return primary; }
    // Aim points, like a person would: list items at 75% across (vertically centred); buttons and checkboxes at their centre
    var ITEM_X = 0.75;
    var CURSOR_R = 16; // half of the 32px cursor

    at(250, function () { cursor.classList.add('is-shown'); });
    // 1. Select company
    move(700, 750, function () { return company(0); }, null, ITEM_X);
    click(1850, function () { return company(0); }, function () { company(0).classList.add('is-selected'); });
    move(2350, 750, btn);
    click(3450, btn, function () { primary.classList.remove('is-pressed'); setStep(2); });
    // 2. Select devices
    var picks = [[3950, 700, 4900], [5250, 550, 6050], [6350, 500, 7100]];
    PICKED.forEach(function (idx, i) {
      var p = picks[i];
      move(p[0], p[1], function () { return checkbox(idx); }, function () { return band(idx); });
      click(p[2], function () { return checkbox(idx); }, function () { setDevice(idx, true); });
    });
    move(7500, 750, btn);
    click(8550, btn, function () { primary.classList.remove('is-pressed'); setStep(3); });
    // 3. Select new group
    move(9050, 700, function () { return group(WAVE); }, null, ITEM_X);
    click(10000, function () { return group(WAVE); }, function () { group(WAVE).classList.add('is-selected'); });
    move(10450, 700, btn);
    click(11450, btn, function () { primary.classList.remove('is-pressed'); setStep(4); });
    // 4. Confirmation: the button is now wider, the cursor settles on its new centre
    move(12600, 500, btn);
    click(13300, btn, function () {});
    // Hold, then fade back to step 1
    at(14800, function () { body.classList.add('is-faded'); cursor.classList.remove('is-shown'); });
    at(15150, function () { setState(false); body.classList.remove('is-faded'); });

    events.sort(function (a, b) { return a.at - b.at; });

    var t = 0, cursorPos = START;
    function loopStart() {
      setState(false);
      body.classList.remove('is-faded');
      cursor.classList.remove('is-shown');
      moves.forEach(function (m) { m.from = m.to = null; });
      t = 0;
      placeCursor();
    }
    function fire(a, b) {
      for (var i = 0; i < events.length; i++) if (events[i].at > a && events[i].at <= b) events[i].run();
    }
    function placeCursor() {
      var cur = START;
      for (var i = 0; i < moves.length; i++) {
        var m = moves[i];
        if (t < m.at) break;
        if (!m.to) { m.from = cur; m.to = stagePoint(m.target(), m.fx, 0.5); }
        cur = arc(m.from, m.to, easeInOut(Math.min(1, (t - m.at) / m.dur)));
      }
      cursorPos = cur;
      cursor.style.transform = 'translate3d(' + cur[0].toFixed(2) + 'px,' + cur[1].toFixed(2) + 'px,0)';
    }
    function advance(dt) {
      var nt = t + dt;
      if (nt >= LOOP) { fire(t, LOOP); loopStart(); nt -= LOOP; }
      fire(t, nt);
      t = nt;
      placeCursor();
    }

    // ── Playback: only while visible, never with reduced motion ──
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var inView = false, raf = 0, last = 0;
    function frame(now) {
      advance(Math.min(now - last, 50)); // no jumps after a hidden tab or a slow frame
      last = now;
      raf = requestAnimationFrame(frame);
    }
    function update() {
      var play = inView && !reduce.matches;
      if (play && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!play && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function applyMotionPref() {
      host.classList.toggle('rgw-static', reduce.matches);
      if (reduce.matches) setState(true); else loopStart();
      update();
    }
    if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPref);
    else if (reduce.addListener) reduce.addListener(applyMotionPref);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        update();
      }, { threshold: 0.25 }).observe(host);
    } else {
      inView = true;
    }
    applyMotionPref();
  }

  [].forEach.call(document.querySelectorAll('[data-rg-wizard]'), init);
})();
