/*
 * All case figures live in this one list.
 * To swap an image: replace the file in images/ (keep the name) or change `file` here.
 * Slots marked `ready: false` show a plain grey 4:3 box until their file exists.
 * To use the real image: drop it into images/ under that name and delete `ready: false`.
 * Animated figures list their frames in `frames`; the last frame is the still for reduced motion.
 * `alt` defaults to the caption. The hero has no caption, so its alt is the case title.
 */
var FIGURES = [
  { slot: 'hero', file: 'images/hero.webp',
    alt: 'One request for every document a property sale needs', hero: true },

  { slot: 'ceo-notes', file: 'images/ceo-notes.webp',
    caption: 'My notes from the call with the CEO: the whole process on one page.' },
  { slot: 'first-ai-version', file: 'images/first-ai-version.webp',
    caption: 'The team’s first AI-built version copied the old portal section by section.' },

  { slot: 'early-wireframes', file: 'images/early-wireframes.webp',
    caption: 'Early wireframes of the requests queue and request page, made in Claude Design.' },

  { slot: 'before-sales-contract', file: 'images/before-sales-contract.webp',
    caption: 'Before. Status spread across checkboxes and action links.' },
  { slot: 'after-request-document', file: 'images/after-request-document.webp',
    caption: 'After. A request as a list of documents, each with its own source and status.' },

  { slot: 'three-apps', file: 'images/three-apps.webp',
    caption: 'One request as the seller, the agent and the manager see it.' },

  { slot: 'before-state-and-contract', file: 'images/before-state-and-contract.webp',
    caption: 'Before. Two screens of choices before the quote.' },
  { slot: 'after-address', file: 'images/after-address.webp',
    caption: 'After. One address field, with a map or manual entry as a fallback.' },

  { slot: 'before-online-form', file: 'images/before-online-form.webp',
    caption: 'Before. Everything on one long form, then payment, then an email.' },
  // Checkout: recorded from checkout/ (verify email, your details, property details, payment,
  // order placed, request page). The poster is the Payment step, also shown with reduced motion.
  { slot: 'checkout', type: 'video', file: 'checkout/video/property-documents-checkout.mp4',
    poster: 'checkout/video/property-documents-checkout-poster.png', width: 1600, height: 1200,
    alt: 'Checkout: confirm the email with a code, fill in your details and the property details, pay by card, then open the request page.',
    caption: 'After. Email first, short steps, payment last, then straight to the request.' },

  { slot: 'design-system-figma', file: 'images/design-system-figma.webp',
    caption: 'Primitives underneath, semantic tokens named by role on top.' },
  { slot: 'design-system-code', file: 'images/design-system-code.webp',
    caption: 'Button states, status labels, inputs, a table and tabs from the component page in code.' }
];

var IMG_W = 2400, IMG_H = 1800;
var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FRAME_MS = 1800, LAST_FRAME_MS = 3200; // crossfade timing: each frame, then a longer hold on the last

// Reusable inline SVG icon from the sprite in index.html. size: 16 (default) or 20.
function icon(name, size) {
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', size === 20 ? 'icon icon-20' : 'icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  var use = document.createElementNS(NS, 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function makeImg(src, alt, eager) {
  var img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.width = IMG_W;
  img.height = IMG_H;
  img.decoding = 'async';
  if (eager) img.fetchPriority = 'high'; else img.loading = 'lazy';
  return img;
}

FIGURES.forEach(function (f) {
  var figure = document.querySelector('[data-slot="' + f.slot + '"]');
  if (!figure) return;
  // Static HTML remains readable if JavaScript is unavailable. Enhance it once.
  figure.replaceChildren();
  if (f.type === 'video') { renderVideo(figure, f); return; }
  var alt = f.alt || f.caption || '';
  var media = document.createElement('div');
  media.className = 'media';
  f.figure = figure;
  f.media = media;

  if (f.ready === false) {
    // Waiting for its image: grey box with the caption under it, not zoomable.
    media.classList.add('placeholder');
    figure.appendChild(media);
  } else {
    if (f.frames) {
      // Crossfade: the first frame carries the alt text, the rest are decorative.
      media.classList.add('crossfade');
      f.frame = REDUCED_MOTION ? f.frames.length - 1 : 0;
      f.frames.forEach(function (src, i) {
        var img = makeImg(src, i === 0 ? alt : '', false);
        if (i === f.frame) img.classList.add('is-active');
        media.appendChild(img);
      });
    } else {
      media.appendChild(makeImg(f.file, alt, f.hero));
    }
    if (f.hero) {
      figure.appendChild(media);
    } else {
      // Every real figure except the hero opens in the lightbox; the caption is its accessible label.
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoom';
      btn.setAttribute('aria-label', f.caption || alt);
      btn.appendChild(media);
      btn.addEventListener('click', function () { openLightbox(f); });
      figure.appendChild(btn);
      f.btn = btn;
    }
  }
  if (f.caption) {
    var cap = document.createElement('figcaption');
    cap.textContent = f.caption;
    figure.appendChild(cap);
  }
});

// Before/After pairs: the figures inside one .pair element, Before first.
// Placeholders are skipped, so a pair with only one real image has no arrows in the lightbox.
document.querySelectorAll('.pair').forEach(function (pairEl) {
  var group = FIGURES.filter(function (f) { return f.btn && f.type !== 'video' && pairEl.contains(f.figure); });
  if (group.length < 2) return;
  group.forEach(function (f) { f.group = group; });
});

// Crossfade: frame 1 to the last, ~1.8s each with a 600ms fade, a longer hold on the last, then loop.
// Reduced motion shows the last frame only. Paused while the lightbox is open.
var crossfadePaused = false;
if (!REDUCED_MOTION) {
  FIGURES.forEach(function (f) {
    if (!f.frames || !f.media) return;
    var imgs = f.media.querySelectorAll('img');
    (function tick() {
      var last = f.frame === f.frames.length - 1;
      setTimeout(function () {
        if (!crossfadePaused) {
          imgs[f.frame].classList.remove('is-active');
          f.frame = (f.frame + 1) % f.frames.length;
          imgs[f.frame].classList.add('is-active');
        }
        tick();
      }, last ? LAST_FRAME_MS : FRAME_MS);
    })();
  });
}

/* ── Lightbox: zoom in place ──
   The image grows from its exact spot on the page to the fitted size (FLIP on transform),
   and shrinks back to the same spot on close. */
var ZOOM_MS = 250, SWAP_MS = 150, CAPTION_GAP = 12, SCROLL_CLOSE_PX = 40;
var mobileQuery = window.matchMedia('(max-width: 767px)');

function el(tag, className) {
  var node = document.createElement(tag);
  node.className = className;
  return node;
}
function lbButton(className, label, iconName) {
  var b = el('button', 'lb-btn ' + className);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.appendChild(icon(iconName, 20));
  return b;
}

var lb = el('div', 'lightbox');
lb.hidden = true;
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.setAttribute('aria-labelledby', 'lb-caption');

var lbBackdrop = el('div', 'lb-backdrop');
var lbImg = el('img', 'lb-img');
var lbImgNext = el('img', 'lb-img lb-img-next');
lbImgNext.alt = '';
lbImgNext.setAttribute('aria-hidden', 'true');
[lbImg, lbImgNext].forEach(function (img) { img.width = IMG_W; img.height = IMG_H; });
lbImg.decoding = 'sync'; // the zoom starts from the cached page image, so paint it on the first frame
// Video figures: the poster sits in lbImg for the zoom, the movie plays on top of it once it starts.
var lbVideo = el('video', 'lb-img lb-video');
lbVideo.muted = true;
lbVideo.defaultMuted = true;
lbVideo.loop = true;
lbVideo.playsInline = true;
lbVideo.controls = false;
lbVideo.preload = 'auto';
lbVideo.setAttribute('muted', '');
lbVideo.setAttribute('playsinline', '');
lbVideo.setAttribute('aria-hidden', 'true');
lbVideo.tabIndex = -1;
lbVideo.addEventListener('playing', function () { lbVideo.classList.add('is-playing'); });
var lbCaption = el('p', 'lb-caption');
lbCaption.id = 'lb-caption';
var lbPrev = lbButton('lb-prev', 'Previous image', 'chevron-left');
var lbNext = lbButton('lb-next', 'Next image', 'chevron-right');
var lbClose = lbButton('lb-close', 'Close', 'x');

[lbBackdrop, lbImg, lbVideo, lbImgNext, lbCaption, lbPrev, lbNext, lbClose].forEach(function (n) { lb.appendChild(n); });
document.body.appendChild(lb);

var lbCurrent = null;   // figure entry on show
var lbState = 'closed'; // closed | opening | open | closing
var lbRect = null;      // fitted image rect in the viewport
var lbTimer = 0, lbSwapTimer = 0, lbScrolled = 0, lbTouch = null;

function mediaRadius() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--media-radius')) || 0;
}

// The frame that is visible on the page right now (animated figures can be on any frame).
function visibleFrame(f) {
  if (f.type === 'video') return { src: f.poster, img: f.media.querySelector('.video-poster') };
  var imgs = f.media.querySelectorAll('img');
  if (f.frames) return { src: f.frames[f.frame], img: imgs[f.frame] };
  return { src: f.file, img: imgs[0] };
}

// Largest 4:3 size that fits with the margin (32px, 16px on mobile) and the caption under it,
// never above the natural 2400x1800.
function layoutLightbox() {
  var margin = mobileQuery.matches ? 16 : 32;
  var vw = window.innerWidth, vh = window.innerHeight;
  var availW = vw - 2 * margin, availH = vh - 2 * margin;
  var nat = lbCurrent && lbCurrent.type === 'video' ? { w: lbCurrent.width, h: lbCurrent.height } : { w: IMG_W, h: IMG_H };
  var w = Math.min(availW, nat.w), capH = 0;
  for (var i = 0; i < 3; i++) { // caption height depends on width, so settle it
    lbCaption.style.width = Math.floor(w) + 'px';
    capH = lbCaption.textContent ? lbCaption.offsetHeight + CAPTION_GAP : 0;
    w = Math.min(availW, nat.w, (availH - capH) * nat.w / nat.h);
  }
  w = Math.floor(w);
  var h = Math.round(w * nat.h / nat.w);
  var left = Math.round((vw - w) / 2);
  var top = Math.round((vh - h - capH) / 2);
  lbRect = { left: left, top: top, width: w, height: h };
  [lbImg, lbVideo, lbImgNext].forEach(function (img) {
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    img.style.width = w + 'px';
    img.style.height = h + 'px';
  });
  lbCaption.style.width = w + 'px';
  lbCaption.style.left = left + 'px';
  lbCaption.style.top = (top + h + CAPTION_GAP) + 'px';
}

// Put the lightbox image exactly over a rect on the page (the "First" of FLIP).
function placeOver(rect) {
  var s = rect.width / lbRect.width;
  [lbImg, lbVideo].forEach(function (m) {
    m.style.transform = 'translate(' + (rect.left - lbRect.left) + 'px, ' + (rect.top - lbRect.top) + 'px) scale(' + s + ')';
    m.style.borderRadius = (mediaRadius() / s) + 'px'; // looks like the page radius while scaled down
  });
}
function animating(on) {
  [lbImg, lbVideo].forEach(function (m) { m.classList.toggle('is-animating', on); });
}
function clearPlacement() {
  [lbImg, lbVideo].forEach(function (m) { m.style.transform = ''; m.style.borderRadius = ''; });
}

function updateNav() {
  var group = lbCurrent.group;
  lbPrev.hidden = lbNext.hidden = !group;
  if (group) {
    lbPrev.disabled = lbCurrent === group[0];
    lbNext.disabled = lbCurrent === group[group.length - 1];
  }
}

function lockScroll() {
  var scrollbar = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0) document.body.style.paddingRight = scrollbar + 'px';
  document.documentElement.classList.add('lightbox-open');
}
function unlockScroll() {
  document.documentElement.classList.remove('lightbox-open');
  document.body.style.paddingRight = '';
}

// The inline movie pauses while the lightbox is open; the lightbox copy plays from the start.
// Reduced motion keeps the poster only.
function startLightboxVideo(f) {
  f.pauseInline();
  if (REDUCED_MOTION) return;
  lbVideo.src = f.file;
  var p = lbVideo.play();
  if (p && typeof p.catch === 'function') p.catch(function () { /* the poster stays visible */ });
}
function stopLightboxVideo(f) {
  lbVideo.pause();
  lbVideo.classList.remove('is-playing');
  lbVideo.removeAttribute('src');
  lbVideo.load();
  f.resumeInline();
}

function openLightbox(f) {
  if (lbState !== 'closed') return;
  var frame = visibleFrame(f);
  var from = frame.img.getBoundingClientRect();

  lbCurrent = f;
  crossfadePaused = true;
  lbScrolled = 0;
  if (f.type === 'video') startLightboxVideo(f);
  lbImg.src = frame.src;
  lbImg.alt = f.alt || f.caption || '';
  lbCaption.textContent = f.caption || '';
  updateNav();
  lockScroll();
  lb.hidden = false;
  layoutLightbox();
  f.media.style.visibility = 'hidden'; // the image "lifts" off the page
  lbClose.focus({ preventScroll: true });

  if (REDUCED_MOTION) {
    lb.classList.add('is-open', 'is-zoomed');
    lbState = 'open';
    return;
  }
  lbState = 'opening';
  placeOver(from);
  lbImg.getBoundingClientRect(); // commit the starting position
  animating(true);
  lb.classList.add('is-open');
  clearPlacement();
  clearTimeout(lbTimer);
  lbTimer = setTimeout(function () {
    animating(false);
    lbState = 'open';
    lb.classList.add('is-zoomed');
  }, ZOOM_MS);
}

function closeLightbox() {
  if (lbState === 'closed' || lbState === 'closing') return;
  var f = lbCurrent;
  clearTimeout(lbTimer);
  clearTimeout(lbSwapTimer);
  lbImgNext.classList.remove('is-visible');
  lb.classList.remove('is-zoomed');

  function finish() {
    lb.hidden = true;
    lb.classList.remove('is-open');
    animating(false);
    clearPlacement();
    f.media.style.visibility = '';
    unlockScroll();
    if (f.type === 'video') stopLightboxVideo(f);
    crossfadePaused = false;
    lbState = 'closed';
    lbCurrent = null;
    f.btn.focus({ preventScroll: true });
  }

  if (REDUCED_MOTION) { finish(); return; }
  lbState = 'closing';
  animating(true);
  placeOver(visibleFrame(f).img.getBoundingClientRect());
  lb.classList.remove('is-open');
  lbTimer = setTimeout(finish, ZOOM_MS);
}

// Switch to the other figure of the same Before/After pair, with a short crossfade.
function showInPair(step) {
  if (lbState !== 'open' || !lbCurrent.group) return;
  var group = lbCurrent.group;
  var target = group[group.indexOf(lbCurrent) + step];
  if (!target) return;

  var prev = lbCurrent;
  var frame = visibleFrame(target);
  lbCurrent = target;
  prev.media.style.visibility = '';
  target.media.style.visibility = 'hidden'; // closing now zooms back to this figure
  lbImg.alt = target.alt || target.caption || '';
  lbCaption.textContent = target.caption || '';
  layoutLightbox();
  updateNav();
  if (document.activeElement && document.activeElement.disabled) lbClose.focus();

  if (REDUCED_MOTION) { lbImg.src = frame.src; return; }
  clearTimeout(lbSwapTimer);
  lbImgNext.classList.remove('is-visible');
  lbImgNext.src = frame.src;
  lbImgNext.decode().catch(function () {}).then(function () {
    if (lbCurrent !== target || lbState !== 'open') return;
    lbImgNext.classList.add('is-visible');
    lbSwapTimer = setTimeout(function () {
      lbImg.src = frame.src;
      lbImg.decode().catch(function () {}).then(function () {
        if (lbCurrent === target) lbImgNext.classList.remove('is-visible');
      });
    }, SWAP_MS);
  });
}

// Close on a click anywhere (the close button included); the pair arrows only switch.
lb.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showInPair(-1); });
lbNext.addEventListener('click', function (e) { e.stopPropagation(); showInPair(1); });

document.addEventListener('keydown', function (e) {
  if (lbState === 'closed') return;
  if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); showInPair(-1); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); showInPair(1); return; }
  if (e.key === 'Tab') {
    // Keep focus inside the dialog, on the controls that are available.
    var controls = [lbPrev, lbNext, lbClose].filter(function (b) { return !b.hidden && !b.disabled; });
    var i = controls.indexOf(document.activeElement);
    e.preventDefault();
    controls[(i + (e.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  }
});

// Close on scroll: wheel or a touch move of more than ~40px.
lb.addEventListener('wheel', function (e) {
  lbScrolled += Math.abs(e.deltaY) + Math.abs(e.deltaX);
  if (lbScrolled > SCROLL_CLOSE_PX) closeLightbox();
}, { passive: true });
lb.addEventListener('touchstart', function (e) {
  lbTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
lb.addEventListener('touchmove', function (e) {
  e.preventDefault(); // the page behind must not move
  if (!lbTouch) return;
  var dx = e.touches[0].clientX - lbTouch.x, dy = e.touches[0].clientY - lbTouch.y;
  if (Math.sqrt(dx * dx + dy * dy) > SCROLL_CLOSE_PX) { lbTouch = null; closeLightbox(); }
}, { passive: false });

window.addEventListener('resize', function () { if (lbState !== 'closed') layoutLightbox(); });

/* The checkout movie is loaded and played only when it enters the viewport (same as the
   release-groups wizard). Its Payment poster also covers autoplay rejection and reduced motion. */
function renderVideo(figure, f) {
  var media = document.createElement('div');
  media.className = 'media video-media';
  media.setAttribute('role', 'img');
  media.setAttribute('aria-label', f.alt);
  var poster = document.createElement('img');
  poster.className = 'video-poster';
  poster.src = f.poster;
  poster.alt = '';
  poster.width = f.width;
  poster.height = f.height;
  poster.loading = 'lazy';
  poster.decoding = 'async';
  var video = document.createElement('video');
  video.width = f.width;
  video.height = f.height;
  video.poster = f.poster;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  media.appendChild(poster);
  media.appendChild(video);
  // Same button treatment as the stills: the caption (or the alt text) is the label.
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'zoom';
  btn.setAttribute('aria-label', f.caption || f.alt);
  btn.appendChild(media);
  btn.addEventListener('click', function () { openLightbox(f); });
  figure.appendChild(btn);
  f.figure = figure;
  f.media = media;
  f.btn = btn;
  var caption = document.createElement('figcaption');
  caption.textContent = f.caption;
  figure.appendChild(caption);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var inView = false, held = false; // held: the lightbox is open
  function shouldPlay() {
    return inView && !held && !reduce.matches && !document.hidden;
  }
  function syncPlayback() {
    if (!shouldPlay()) {
      video.autoplay = false;
      video.pause();
      if (reduce.matches) media.classList.remove('is-playing');
      return;
    }
    if (!video.getAttribute('src')) video.src = f.file;
    video.autoplay = true;
    var play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(function () { /* The Payment poster stays visible. */ });
    }
  }
  video.addEventListener('playing', function () {
    if (shouldPlay()) media.classList.add('is-playing');
    else video.pause();
  });
  video.addEventListener('error', function () { media.classList.remove('is-playing'); });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(media);
  }
  reduce.addEventListener('change', syncPlayback);
  f.pauseInline = function () { held = true; syncPlayback(); };
  f.resumeInline = function () { held = false; syncPlayback(); };
  document.addEventListener('visibilitychange', syncPlayback);
}
