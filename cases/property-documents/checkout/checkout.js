/* Property documents case: animated checkout.
   Builds the stage inside every [data-pd-checkout] element and plays one loop:
   verify email → your details → property details → payment → order placed → request page.
   Every editable text input starts empty and is typed in; prefilled, greyed-out fields and selects
   show their frame value from the start.
   Plays only while visible; with reduced motion it shows the static Payment step.
   Every visual change is a function of one timeline clock (t, in ms), so recording the stage
   frame by frame gives exactly what a visitor would see live. */
(function () {
  'use strict';

  var script = document.currentScript;
  var ASSETS = new URL('assets/', script ? script.src : location.href).href;
  var STAGE_W = 1600;

  // ── Copy from the Figma frames (word for word) ──
  var STEPS = ['Verify email', 'Your details', 'Property details', 'Payment'];
  var STEP_W = [81, 81, 110, 60]; // label boxes as in Figma, so the centred stepper lands on x = 370
  var CODE = '482915';
  // Typed fields and their end values (frames 295:7801 and 295:8114)
  var FIELDS = {
    fullname: 'Jordan Smith',
    phone: '412 345 678',
    card: '4242 4242 4242 4242',
    expiry: '12 / 28',
    cvc: '•••',
    cardname: 'Jordan Smith',
    address: '14 Blackwood St, Kingston ACT 2604'
  };
  var PAYMENT_FIELDS = ['card', 'expiry', 'cvc', 'cardname', 'address'];
  var PLACEHOLDERS = {
    fullname: 'Enter your full name',
    phone: '412 345 678',
    card: '1234 1234 1234 1234',
    expiry: 'MM / YY',
    cvc: '123',
    cardname: 'Name on card',
    address: 'Enter your billing address'
  };
  var SALE = [
    ['auction', 'Auction sale', 0, 0], ['rural', 'Rural property', 332, 0],
    ['tenancy', 'Subject to tenancy', 0, 34], ['landtax', 'Adjustable land tax', 332, 34],
    ['gst', 'Subject to GST', 0, 68], ['bodycorp', 'Subject to Body Corporate', 332, 68],
    ['restrictions', 'Known transfer restrictions', 0, 102]
  ];
  var INCLUSIONS = [
    ['floor', 'Fixed floor coverings', 0, 0], ['window', 'Window treatments', 332, 0],
    ['garage', 'Garage', 0, 34], ['carport', 'Car port', 332, 34],
    ['homeunit', 'Home unit', 0, 68], ['carspace', 'Car space', 332, 68]
  ];
  var TICKED = ['auction', 'floor', 'window']; // end state of frame 295:7881
  var DISBURSEMENTS = [
    ['Land Titles Office - Title Search', '$23.00'],
    ['Land Titles Office - Common Property Search', '$23.00'],
    ['Land Titles Office - Unit Plan Search', '$19.00'],
    ['ACTPLA - Leasing Enquiry', '$80.00'],
    ['Body Corporate - Section 119 Certificate', '$94.60'],
    ['Body Corporate - Past Official Minutes for 2 years', '$150.00 to $240.00'],
    ['Disbursements total', '$389.60 to $479.60']
  ];

  function img(name, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + ASSETS + name + '" alt="">';
  }
  function field(label, control) {
    return '<div class="pdc-field"><div class="pdc-label-row">' + label + '</div>' + control + '</div>';
  }
  function label(text) { return '<span class="pdc-label">' + text + '</span>'; }
  function input(text, cls) { return '<div class="pdc-input' + (cls ? ' ' + cls : '') + '">' + text + '</div>'; }
  // An editable input: a placeholder until the timeline types its first character.
  function typed(name, cls, before) {
    return '<div class="pdc-input' + (cls ? ' ' + cls : '') + '" data-field="' + name + '">' + (before || '') +
      '<span class="pdc-val" data-placeholder="' + PLACEHOLDERS[name] + '"></span><i class="pdc-tcaret"></i></div>';
  }
  function select(text) { return '<div class="pdc-input is-select"><span>' + text + '</span>' + img('chevron-down.svg') + '</div>'; }
  function button(text, attr) { return '<div class="pdc-btn is-block" ' + attr + '><span>' + text + '</span></div>'; }
  function checks(list, height) {
    var h = '<div class="pdc-checks" style="height:' + height + 'px">';
    list.forEach(function (c) {
      h += '<div class="pdc-check" data-check="' + c[0] + '" style="left:' + c[2] + 'px;top:' + c[3] + 'px">' +
        '<span class="pdc-box-wrap"><span class="pdc-box">' + img('check.svg') + '</span></span>' +
        '<span class="pdc-check-label">' + c[1] + '</span></div>';
    });
    return h + '</div>';
  }
  function lines(list) {
    return '<div class="pdc-lines">' + list.map(function (l) {
      return '<div class="pdc-line"><span>' + l[0] + '</span><span>' + l[1] + '</span></div>';
    }).join('') + '</div>';
  }
  function summary(alert) {
    var h = '<aside class="pdc-side"><div class="pdc-side-in">';
    h += '<p class="pdc-h1">Order Summary</p>';
    if (alert) {
      h += '<div class="pdc-alert">' + img('info.svg') + '<b>This quote is not final yet</b>' +
        '<p class="pdc-caption">Your answers on this page decide which searches are required, so both the documents listed and the prices beside them can still change.</p></div>';
    }
    h += '<div class="pdc-section"><p class="pdc-h2">Disbursements</p>' + lines(DISBURSEMENTS) + '</div>';
    h += '<div class="pdc-rule"></div>';
    h += '<div class="pdc-section"><p class="pdc-h2">Legal Fee</p>' + lines([['Stage 1', '$329.00'], ['Legal Fee total', '$329.00']]) + '</div>';
    h += '<div class="pdc-rule"></div>';
    h += '<div class="pdc-total"><p class="pdc-h2">Grand Total</p><strong>$718.60 to $808.60</strong><p class="pdc-caption">(Inclusive of GST)</p></div>';
    h += '<div class="pdc-rule"></div>';
    h += '<p class="pdc-caption">We pass search costs directly to you with no markup. By proceeding, you authorize us to order any legally required searches and pre-authorize your card for the estimated total. You will only be charged the exact final cost of these searches plus our professional fee when your draft contract is complete.</p>';
    return h + '</div></aside>';
  }

  function markup() {
    var h = '<div class="pdc-stage" aria-hidden="true"><div class="pdc-card">';

    // Header
    h += '<div class="pdc-header">' + img('logo.png', 'pdc-logo') + '<ol class="pdc-steps">';
    STEPS.forEach(function (s, i) {
      if (i) h += '<li class="pdc-step-line"></li>';
      h += '<li class="pdc-step"><span class="pdc-step-num"><b>' + (i + 1) + '</b>' + img('step-done.svg') + '</span>' +
        '<span class="pdc-step-label" style="width:' + STEP_W[i] + 'px">' + s + '</span></li>';
    });
    h += '</ol><div class="pdc-btn-secondary">Back to website</div></div>';
    h += '<div class="pdc-content">';

    // 1. Verify email
    h += '<section class="pdc-panel" data-panel="1"><div class="pdc-main"><div class="pdc-scroll"><div class="pdc-verify">';
    h += '<div class="pdc-verify-head"><p class="pdc-h1">Confirm your email</p>' +
      '<p class="pdc-lead">We sent a 6-digit code to <b>jordan.smith@gmail.com</b>. Enter it below to verify the address and keep going.</p></div>';
    h += '<div class="pdc-otp">';
    for (var d = 0; d < 6; d++) h += '<div class="pdc-otp-box" data-otp="' + d + '"><span></span><i class="pdc-caret"></i></div>';
    h += '</div>' + button('Continue', 'data-next="1"') + '</div></div></div></section>';

    // 2. Your details: full name and phone are typed, email is prefilled and disabled
    h += '<section class="pdc-panel" data-panel="2"><div class="pdc-main"><div class="pdc-scroll"><div class="pdc-col">';
    h += '<p class="pdc-h1">Your details</p><div class="pdc-form"><div class="pdc-fields">';
    h += field(label('Full name'), typed('fullname'));
    h += field(label('Phone number'), '<div class="pdc-phone" data-field="phone"><div class="pdc-phone-country"><span><span class="pdc-flag">' +
      img('flag-au.svg') + '</span>+61</span>' + img('chevron-down.svg') + '</div><div class="pdc-phone-number">' +
      '<span class="pdc-val" data-placeholder="' + PLACEHOLDERS.phone + '"></span><i class="pdc-tcaret"></i></div></div>');
    h += field(label('Email'), input('jordan.smith@gmail.com', 'is-readonly'));
    h += '</div>' + button('Continue', 'data-next="2"') + '</div></div></div></div></section>';

    // 3. Property details
    h += '<section class="pdc-panel" data-panel="3"><div class="pdc-main"><div class="pdc-scroll"><div class="pdc-col">';
    h += '<p class="pdc-h1">Property details</p><div class="pdc-form">';
    h += '<div class="pdc-section"><p class="pdc-h2">Property and sale details</p><div class="pdc-section"><div class="pdc-fields">';
    h += field(label('Search for your address') + '<span class="pdc-link">Change address</span>', input('14 Blackwood St, Kingston ACT 2604', 'is-readonly'));
    h += field(label('Property type'), select('Unit or apartment'));
    h += '</div>' + checks(SALE, 126) + '</div></div>';
    h += '<div class="pdc-section"><p class="pdc-h2">Inclusions</p>' + checks(INCLUSIONS, 92) + '</div>';
    h += button('Continue', 'data-next="3"') + '</div></div></div></div>' + summary(true) + '</section>';

    // 4. Payment (the left column scrolls down to the billing address and the Pay button)
    h += '<section class="pdc-panel" data-panel="4"><div class="pdc-main"><div class="pdc-scroll" data-scroll><div class="pdc-col">';
    h += '<p class="pdc-h1">Payment</p>';
    h += '<div class="pdc-wallets"><div class="pdc-wallet is-apple">' + img('apple-pay.svg') + '</div>' +
      '<div class="pdc-wallet is-google">' + img('google-pay.svg') + '</div></div>';
    h += '<div class="pdc-or"><i></i><span class="pdc-caption">Or pay with card</span><i></i></div>';
    h += '<div class="pdc-form"><div class="pdc-section"><p class="pdc-h2">Card details</p><div class="pdc-fields">';
    h += field(label('Card number'), typed('card', 'has-icon', img('card.svg', 'pdc-input-icon')));
    h += '<div class="pdc-row"><div class="pdc-row">' +
      '<div style="width:148px">' + field(label('Expiry date'), typed('expiry')) + '</div>' +
      '<div style="width:148px">' + field(label('CVC'), typed('cvc')) + '</div></div>' +
      '<div style="width:312px">' + field(label('Name on card'), typed('cardname')) + '</div></div>';
    h += '</div><div class="pdc-check is-static"><span class="pdc-box-wrap"><span class="pdc-box">' + img('check.svg') +
      '</span></span><span class="pdc-check-label">Save this card</span></div></div>';
    h += '<div class="pdc-section"><p class="pdc-h2">Billing details</p><div class="pdc-fields">';
    h += field(label('Country'), select('Australia'));
    h += field(label('Address'), typed('address', 'is-area'));
    h += '</div></div>' + button('Pay $808.60', 'data-next="4"') + '</div></div></div></div>' + summary(false) + '</section>';

    // 5. Order placed
    h += '<section class="pdc-panel" data-panel="5"><div class="pdc-done"><div class="pdc-done-in">';
    h += '<div class="pdc-done-icon">' + img('success-check.svg') + '</div>';
    h += '<div class="pdc-done-text"><p class="pdc-h1" style="color:var(--pdc-ink)">Your order is placed</p>' +
      '<p>We’ve received your details and pre-authorised your card. A lawyer is preparing your draft marketing contract.</p>' +
      '<p style="white-space:nowrap">You can follow its progress in your account any time.</p></div>';
    h += '<div class="pdc-btn" data-next="5"><span>Open app</span></div></div></div></section>';

    h += '</div></div>'; // .pdc-content, .pdc-card
    h += img('request-page.webp', 'pdc-request');
    h += '<div class="pdc-ring"></div><div class="pdc-cursor"><i></i></div></div>';
    return h;
  }

  // ── Motion helpers ──
  function clamp01(p) { return p < 0 ? 0 : p > 1 ? 1 : p; }
  function easeInOut(p) { return -(Math.cos(Math.PI * p) - 1) / 2; } // sine: soft start and stop
  function easeOut(p) { return 1 - (1 - p) * (1 - p) * (1 - p); }
  // Quadratic curve with the control point pushed sideways: a slight arc instead of a straight line
  function arc(a, b, p) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var cx = (a[0] + b[0]) / 2 + dy * 0.14, cy = (a[1] + b[1]) / 2 - dx * 0.14;
    var u = 1 - p;
    return [u * u * a[0] + 2 * u * p * cx + p * p * b[0], u * u * a[1] + 2 * u * p * cy + p * p * b[1]];
  }
  // Typing rhythm: about 45 ms per character with a small, repeatable jitter, a touch longer after a space
  var keyIndex = 0;
  function keyDelay(prev) {
    var r = Math.sin(++keyIndex * 12.9898) * 43758.5453;
    r -= Math.floor(r);
    return Math.round(45 + (r - 0.5) * 28 + (prev === ' ' ? 20 : 0));
  }

  function init(host) {
    host.classList.add('pdc');
    host.innerHTML = markup();

    var stage = host.querySelector('.pdc-stage');
    var cursor = host.querySelector('.pdc-cursor');
    var cursorDot = cursor.querySelector('i');
    var ring = host.querySelector('.pdc-ring');
    var request = host.querySelector('.pdc-request');
    var steps = [].slice.call(host.querySelectorAll('.pdc-step'));
    var panels = [].slice.call(host.querySelectorAll('.pdc-panel'));
    var otp = [].slice.call(host.querySelectorAll('.pdc-otp-box'));
    var payScroll = host.querySelector('[data-scroll]');
    var fieldEls = {};
    Object.keys(FIELDS).forEach(function (k) { fieldEls[k] = host.querySelector('[data-field="' + k + '"]'); });
    function next(n) { return host.querySelector('[data-next="' + n + '"]'); }
    function check(name) { return host.querySelector('[data-check="' + name + '"]'); }
    function box(name) { return check(name).querySelector('.pdc-box'); }
    function fieldEl(name) { return fieldEls[name]; }
    function setValue(name, text) { fieldEls[name].querySelector('.pdc-val').textContent = text; }

    // Scale the 1600×1200 stage to the container width
    var scale = 1;
    function fit() { scale = host.clientWidth / STAGE_W; stage.style.transform = 'scale(' + scale + ')'; }
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host);
    else window.addEventListener('resize', fit);

    // Point inside an element, in stage px
    function stagePoint(el, fx, fy) {
      var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return [(r.left - s.left + r.width * fx) / scale, (r.top - s.top + r.height * fy) / scale];
    }

    // ── Timed values: each fade runs from its value at `start` to `to` over `dur` ms ──
    var t = 0;
    var fades = [];
    function fade(el, prop, to, dur) {
      var cur = el.__pdc && el.__pdc[prop] != null ? el.__pdc[prop] : 0;
      fades = fades.filter(function (f) { return !(f.el === el && f.prop === prop); });
      fades.push({ el: el, prop: prop, from: cur, to: to, start: t, dur: dur });
    }
    function setVal(el, prop, v) {
      el.__pdc = el.__pdc || {};
      el.__pdc[prop] = v;
      if (prop === 'opacity') el.style.opacity = v;
      else el.style.setProperty(prop, v);
    }
    function runFades() {
      fades.forEach(function (f) {
        var p = f.dur ? clamp01((t - f.start) / f.dur) : 1;
        setVal(f.el, f.prop, f.from + (f.to - f.from) * easeInOut(p));
      });
    }

    // ── Checkout state ──
    var step = 1, stepAt = -1e9, prevStep = 0;
    var otpFocus = 0, otpTyped = 0, keyAt = 0;
    var focused = null; // the text field with the focus ring
    var scrolls = [];
    var clickAt = -1e9;
    var hovered = null;

    function setStep(n, instant) {
      prevStep = instant ? 0 : step;
      step = n;
      stepAt = instant ? -1e9 : t;
      steps.forEach(function (s, i) {
        s.classList.toggle('is-done', i < n - 1);
        s.classList.toggle('is-current', i === n - 1);
      });
    }
    function setHover(el) {
      if (hovered && hovered !== el) fade(hovered, '--h', 0, 150);
      if (el && el !== hovered) fade(el, '--h', 1, 150);
      hovered = el;
    }
    function focusField(name) {
      if (focused) focused.classList.remove('is-focus');
      focused = name ? fieldEl(name) : null;
      if (focused) focused.classList.add('is-focus');
      keyAt = t;
    }
    function setState(final) {
      fades = [];
      hovered = null;
      [].forEach.call(host.querySelectorAll('.pdc-btn, .pdc-check'), function (el) { setVal(el, '--h', 0); setVal(el, '--p', 0); });
      setVal(request, 'opacity', 0);
      setVal(cursor, 'opacity', 0);
      otp.forEach(function (b) { b.firstChild.textContent = ''; });
      otpTyped = 0;
      otpFocus = 0;
      keyAt = 0;
      focusField(null);
      Object.keys(FIELDS).forEach(function (k) {
        setValue(k, final && PAYMENT_FIELDS.indexOf(k) > -1 ? FIELDS[k] : '');
      });
      TICKED.forEach(function (n) { check(n).classList.toggle('is-on', !!final); });
      scrolls = [];
      clickAt = -1e9;
      setStep(final ? 4 : 1, true);
    }

    // ── Timeline, written as a script: T moves forward with every action ──
    var START = [1180, 880];
    var events = [];
    var moves = [];
    var T = 0;
    var marks = {}; // named moments, used by the recorder for stills
    function mark(name) { marks[name] = T; }
    function at(ms, fn) { events.push({ at: ms, run: fn }); }
    function wait(ms) { T += ms; }
    // Move the cursor (slight arc, eased). `hover` is the element that gets the hover state, null for none.
    function moveTo(target, dur, hover, fx) {
      var hov = hover === undefined ? target : hover;
      moves.push({ at: T, dur: dur, target: target, fx: fx == null ? 0.5 : fx });
      at(T, function () { if ((hov ? hov() : null) !== hovered) setHover(null); }); // stays hovered if it doesn't leave
      T += dur;
      at(T, function () { setHover(hov ? hov() : null); });
    }
    function clickOn(target, effect) {
      at(T, function () {
        clickAt = t;
        var el = target();
        if (el.classList.contains('pdc-btn')) fade(el, '--p', 1, 90);
      });
      T += 90;
      if (effect) at(T, effect);
    }
    function typeText(name) {
      var text = FIELDS[name];
      for (var i = 0; i < text.length; i++) {
        T += keyDelay(text[i - 1]);
        at(T, (function (s) { return function () { setValue(name, s); keyAt = t; }; })(text.slice(0, i + 1)));
      }
    }
    // Click into a field, then type its value
    function fill(name, moveMs, fx) {
      moveTo(function () { return fieldEl(name); }, moveMs, null, fx);
      wait(220);
      clickOn(function () { return fieldEl(name); }, function () { focusField(name); });
      wait(260);
      typeText(name);
      wait(330);
    }
    function press(n, moveMs, effect) {
      moveTo(function () { return next(n); }, moveMs);
      wait(480);
      clickOn(function () { return next(n); }, effect);
    }
    function goTo(n) { return function () { setHover(null); focusField(null); setStep(n); }; }
    function scrollTo(target, dur) {
      at(T, function () {
        var main = payScroll.parentNode;
        var max = Math.max(0, payScroll.offsetHeight - main.clientHeight);
        var from = scrolls.length ? scrolls[scrolls.length - 1].to : 0;
        scrolls.push({ at: t, dur: dur, from: from, to: target === 'end' ? max : Math.min(max, target) });
      });
      T += dur;
    }

    at(250, function () { fade(cursor, 'opacity', 1, 300); });
    // 1. Verify email: caret in the first box, the six digits are typed one by one
    T = 700;
    CODE.split('').forEach(function (digit, i) {
      T += i ? keyDelay(CODE[i - 1]) : 0;
      at(T, function () {
        otp[i].firstChild.textContent = digit;
        otpTyped = i + 1;
        otpFocus = Math.min(i + 1, 5);
        keyAt = t;
      });
    });
    mark('code-typed');
    wait(450);
    press(1, 800, goTo(2));
    // 2. Your details: full name, then the phone number
    wait(450);
    fill('fullname', 650, 0.5);
    fill('phone', 550, 0.6);
    mark('details-filled');
    press(2, 650, goTo(3));
    // 3. Property details: tick three boxes, then Continue
    wait(450);
    TICKED.forEach(function (name, i) {
      moveTo(function () { return box(name); }, [700, 650, 550][i], function () { return check(name); });
      wait(380);
      clickOn(function () { return box(name); }, function () { check(name).classList.add('is-on'); });
      wait(260);
    });
    mark('boxes-ticked');
    press(3, 650, goTo(4));
    // 4. Payment: card fields one by one, scroll to the billing address, then scroll to Pay
    wait(450);
    fill('card', 600, 0.5);
    fill('expiry', 550, 0.72);
    fill('cvc', 500, 0.72);
    fill('cardname', 550, 0.6);
    mark('card-filled');
    scrollTo(50, 650);
    wait(200);
    fill('address', 600, 0.6);
    mark('address-filled');
    scrollTo('end', 550);
    wait(200);
    moveTo(function () { return next(4); }, 650);
    wait(480);
    clickOn(function () { return next(4); }, function () { focusField(null); });
    mark('pay-pressed');
    wait(350);
    at(T, goTo(5));
    // 5. Order placed: hold about 1 s, then Open app
    wait(1250);
    mark('order-placed');
    press(5, 650, function () {});
    // 6. Request page: crossfade the whole card, hold about 2 s, then fade back to step 1
    wait(150);
    at(T, function () { fade(request, 'opacity', 1, 600); fade(cursor, 'opacity', 0, 400); });
    mark('request');
    wait(600 + 2000);
    at(T, function () {
      var shown = request.__pdc.opacity;
      setState(false);
      setVal(request, 'opacity', shown);
      fade(request, 'opacity', 0, 600);
    });
    wait(600 + 400); // fade back, then a short pause on step 1
    var LOOP = Math.ceil(T / 100) * 100; // whole 100 ms, so 30 fps frames fit the loop exactly

    events.sort(function (a, b) { return a.at - b.at; });

    function loopStart() {
      setState(false);
      moves.forEach(function (m) { m.from = m.to = null; });
      t = 0;
    }
    function fire(a, b) {
      for (var i = 0; i < events.length; i++) if (events[i].at > a && events[i].at <= b) events[i].run();
    }
    function blink(since) { return ((t - since) % 1060) < 530; }

    // ── Render everything that depends on time ──
    function render() {
      runFades();

      // Panels: the old one fades out (100 ms), the new one fades in with a slight upward slide (240 ms)
      var dt = t - stepAt;
      panels.forEach(function (p, i) {
        var n = i + 1, o = 0, y = 0;
        if (n === step) {
          var q = easeOut(clamp01((dt - 100) / 240));
          o = q; y = 12 * (1 - q);
        } else if (n === prevStep && dt < 100) {
          o = 1 - dt / 100;
        }
        p.style.opacity = o;
        p.style.visibility = o > 0 ? 'visible' : 'hidden';
        p.style.transform = y ? 'translateY(' + y.toFixed(2) + 'px)' : '';
      });

      // Code boxes: focus ring and a blinking caret in the empty focused box (only while on step 1)
      otp.forEach(function (b, i) {
        b.classList.toggle('is-focus', step === 1 && i === otpFocus);
        b.lastChild.style.opacity = step === 1 && i === otpFocus && i >= otpTyped && blink(keyAt) ? 1 : 0;
      });
      // Text fields: the caret blinks after the typed text, steady while keys are pressed
      Object.keys(fieldEls).forEach(function (k) {
        var el = fieldEls[k];
        el.querySelector('.pdc-tcaret').style.opacity = el === focused && blink(keyAt) ? 1 : 0;
      });

      // Payment column scroll
      var s = 0;
      scrolls.forEach(function (sc) { if (t >= sc.at) s = sc.from + (sc.to - sc.from) * easeInOut(clamp01((t - sc.at) / sc.dur)); });
      payScroll.style.transform = s ? 'translateY(' + (-s).toFixed(2) + 'px)' : '';

      // Cursor path
      var cur = START;
      for (var i = 0; i < moves.length; i++) {
        var m = moves[i];
        if (t < m.at) break;
        if (!m.to) { m.from = cur; m.to = stagePoint(m.target(), m.fx, 0.5); }
        cur = arc(m.from, m.to, easeInOut(clamp01((t - m.at) / m.dur)));
      }
      cursor.style.transform = 'translate3d(' + cur[0].toFixed(2) + 'px,' + cur[1].toFixed(2) + 'px,0)';

      // Click: the cursor shrinks to 0.85 and back, a faint ring expands and fades
      var c = t - clickAt;
      var pressS = c < 0 || c > 260 ? 1 : c < 117 ? 1 - 0.15 * easeInOut(c / 117) : 0.85 + 0.15 * easeInOut((c - 117) / 143);
      cursorDot.style.transform = pressS === 1 ? '' : 'scale(' + pressS.toFixed(3) + ')';
      if (c >= 0 && c <= 520) {
        var r = c / 520;
        ring.style.opacity = (0.9 * (1 - r)).toFixed(3);
        ring.style.transform = 'translate(' + cur[0].toFixed(2) + 'px,' + cur[1].toFixed(2) + 'px) scale(' + (1 + 1.2 * easeOut(r)).toFixed(3) + ')';
      } else {
        ring.style.opacity = 0;
      }
    }

    function advance(dt) {
      var nt = t + dt;
      if (nt >= LOOP) { fire(t, LOOP); loopStart(); nt -= LOOP; }
      fire(t, nt);
      t = nt;
      render();
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
    function showStatic() {
      host.classList.add('pdc-static');
      setState(true);
      t = 0;
      render();
    }
    function applyMotionPref() {
      host.classList.toggle('pdc-static', reduce.matches);
      if (reduce.matches) showStatic(); else { loopStart(); render(); }
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
    host.__pdcRender = { advance: advance, showStatic: showStatic, loop: LOOP, marks: marks };
  }

  [].forEach.call(document.querySelectorAll('[data-pd-checkout]'), init);
})();
