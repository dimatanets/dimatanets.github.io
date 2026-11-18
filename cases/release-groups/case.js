/* All case media is defined here. Stills use the loan-platform image viewer;
   the wizard video has its own renderer but opens the same lightbox. */
var FIGURES = [
  { slot: 'hero', file: 'images/hero.webp', hero: true,
    alt: 'Smart Checkout Pilot group: device list with update statuses, and the Update in progress panel at 24% with Pause and Abort.' },
  { slot: 'after-groups', file: 'images/after-groups.webp',
    alt: 'Release groups by app. Mobile waiter is expanded to show Pilot, Test, Wave and Enterprise, device counts, current and target versions and update status.',
    caption: 'Groups under each app, with current and target versions and update status.' },
  { slot: 'after-group-rollout', file: 'images/after-group-rollout.webp', hero: false,
    alt: 'Inside the Pilot group: each device\'s update status and company, with the rollout progress and group details beside the list.',
    caption: 'Inside a group: every device\'s update status, with the rollout panel beside it.' },
  { slot: 'after-company', file: 'images/after-company.webp',
    alt: 'Backhaus Krämer\'s page: devices grouped by city and branch, Hamburg and Pinneberg expanded, each device with its app and group.',
    caption: 'A company\'s page: its devices by city and branch.' },
  { slot: 'after-all-devices', file: 'images/after-all-devices.webp',
    alt: 'All devices: a searchable list with serial number, app, group, company, location and branch for every device.',
    caption: 'All devices, searchable by name or serial number.' },
  { slot: 'update-trigger', file: 'images/update-trigger.webp',
    alt: 'Group settings with the Update trigger menu open: New stable version, installed after a delay, or Fixed version, staying on one version.',
    caption: 'A group either installs every new stable version after a delay, or stays on a fixed one.' },
  { slot: 'update-panel-states', file: 'images/update-panel-states.webp',
    alt: 'Four update panels: waiting for a stable version, a scheduled update countdown, a fixed version and an update in progress at 24% with Pause and Abort.',
    caption: 'The update panel: waiting for a version, a scheduled update, a fixed version, and a rollout in progress with pause and abort.' },
  { slot: 'wizard', type: 'video', file: 'wizard/video/release-groups-wizard.mp4',
    poster: 'wizard/video/release-groups-wizard-poster.png', width: 1600, height: 1200,
    alt: 'The Move multiple devices wizard: select Backhaus Krämer, choose Hauptkasse, Wagen 1 and Wagen 2, select the Wave group, then confirm that its version will be installed on all three devices.',
    caption: 'Pick the company, the devices and the new group, then confirm.' },
  { slot: 'after-overview', file: 'images/after-overview.webp',
    alt: 'Device overview with stat cards and recommendations for unassigned devices, problematic versions and outdated versions in a group, above Android and app version charts.',
    caption: 'Recommendations first, charts below.' }
];

var IMG_W = 2400, IMG_H = 1800;
var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  media.appendChild(makeImg(f.file, alt, f.hero));
  if (f.next) {
    // Second frame of a crossfade: decorative duplicate, the first image carries the alt text.
    media.classList.add('crossfade');
    media.appendChild(makeImg(f.next, '', false));
  }
  f.figure = figure;
  f.media = media;
  if (f.hero) {
    figure.appendChild(media);
  } else {
    // Every figure except the hero opens in the lightbox; the caption is its accessible label.
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zoom';
    btn.setAttribute('aria-label', f.caption || alt);
    btn.appendChild(media);
    btn.addEventListener('click', function () { openLightbox(f); });
    figure.appendChild(btn);
    f.btn = btn;
  }
  if (f.caption) {
    var cap = document.createElement('figcaption');
    cap.textContent = f.caption;
    figure.appendChild(cap);
  }
});

// Before/After pairs: the two figures inside one .pair element, Before first.
document.querySelectorAll('.pair').forEach(function (pairEl) {
  var group = FIGURES.filter(function (f) { return f.type !== 'video' && f.figure && pairEl.contains(f.figure); });
  group.forEach(function (f) { f.group = group; });
});

// Every other zoomable still joins one set in page order, so the lightbox steps through them.
// The hero never opens it; the wizard video opens it alone, with no arrows.
var pageStills = FIGURES.filter(function (f) { return f.btn && !f.group && f.type !== 'video'; })
  .sort(function (a, b) { return a.figure.compareDocumentPosition(b.figure) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
pageStills.forEach(function (f) { f.group = pageStills; });

// Crossfade: A for ~3s, 600ms fade to B, ~3s, back. Reduced motion shows B only (CSS).
// Paused while the lightbox is open.
var crossfadePaused = false;
if (!REDUCED_MOTION) {
  document.querySelectorAll('.crossfade').forEach(function (el) {
    setInterval(function () { if (!crossfadePaused) el.classList.toggle('show-b'); }, 3600);
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

// The frame that is visible on the page right now (animated figures can be on frame B).
function visibleFrame(f) {
  if (f.type === 'video') return { src: f.poster, img: f.media.querySelector('.video-poster') };
  var imgs = f.media.querySelectorAll('img');
  var showB = f.next && (REDUCED_MOTION || f.media.classList.contains('show-b'));
  return showB ? { src: f.next, img: imgs[1] } : { src: f.file, img: imgs[0] };
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

/* The movie is loaded and played only when it enters the viewport. Its existing
   confirmation poster also covers autoplay rejection and reduced motion. */
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
      play.catch(function () { /* The confirmation poster stays visible. */ });
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
