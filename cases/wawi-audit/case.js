/* WaWi figures. A ready: false slot reserves space without a request or zoom button. */
var FIGURES = [
  {
    "slot": "hero",
    "file": "images/thumbnail.webp?v=thumb-ea1454817962",
    "alt": "The WaWiAssist order creation screen with a customer list, order details and an item table.",
    "hero": true
  },
  {
    "slot": "analytics-pageviews",
    "file": "images/analytics-pageviews.webp",
    "alt": "PostHog page views shown as a pie chart with a page-path legend.",
    "width": 1280,
    "height": 960,
    "caption": "PostHog page views used to compare activity across pages."
  },
  {
    "slot": "analytics-page-duration",
    "file": "images/analytics-page-duration.webp",
    "alt": "PostHog bar chart comparing average previous pageview duration across pages in November 2025.",
    "width": 1280,
    "height": 960,
    "caption": "Time on page used as one input to the user priority score."
  },
  {
    "slot": "analytics-clicks",
    "file": "images/analytics-clicks.webp",
    "alt": "PostHog click activity shown as a pie chart with a page-path legend.",
    "width": 1280,
    "height": 960,
    "caption": "Click activity used as another input to the user priority score."
  },
  {
    "slot": "analytics-task-heatmap",
    "file": "images/analytics-task-heatmap.webp",
    "alt": "Four WaWi click heatmaps with identified tasks: creating or editing orders, viewing or printing production lists or delivery notes, allowing or denying orders, creating or editing customers, and checking or editing order presets.",
    "width": 2400,
    "height": 1800,
    "caption": "Click heatmaps and the tasks identified alongside session recordings."
  },
  {
    "slot": "recordings-review",
    "file": "images/recordings-review.webp",
    "alt": "A FigJam action log with notes and interface screenshots arranged in sequences from the session review.",
    "width": 1280,
    "height": 960,
    "caption": "FigJam action log from the session review."
  },
  {
    "slot": "order-creation-flow",
    "file": "images/order-creation-flow.webp",
    "alt": "Detailed order creation flow with checks for the selected day, customer visibility and order templates, followed by a simplified flow: select day, select customer, and add, edit or review order items.",
    "width": 1280,
    "height": 960,
    "caption": "Detailed and simplified views of the current order-creation flow."
  },
  {
    "slot": "navigation-before",
    "type": "video",
    "file": "sidebar/video/sidebar-before.mp4",
    "poster": "sidebar/video/sidebar-before-poster.webp",
    "width": 1800,
    "height": 1350,
    "alt": "The old sidebar expands over the order page on hover, revealing the nested Create order navigation item, then collapses again.",
    "caption": "Before. The Create order navigation item was hidden in a submenu until the sidebar expanded on hover."
  },
  {
    "slot": "navigation-proposed",
    "type": "video",
    "file": "sidebar/video/sidebar-after.mp4",
    "poster": "sidebar/video/sidebar-after-poster.webp",
    "width": 1800,
    "height": 1350,
    "alt": "The proposed sidebar starts open with Create order highlighted, collapses to an icon rail, and shows submenus on hover.",
    "caption": "Proposed. The sidebar is open by default, with Create order highlighted as the current page."
  },
  {
    "slot": "sidebar-flyout",
    "file": "images/sidebar-flyout.webp",
    "alt": "An order submenu opens beside the collapsed sidebar on the order creation screen.",
    "caption": "A flyout gives access to sub-items while the sidebar is collapsed."
  },
  {
    "slot": "sidebar-layout-1280",
    "file": "images/sidebar-layout-1280.webp",
    "alt": "Create invoice and invoice list screens with the expanded sidebar, arranged at different widths.",
    "caption": "Checking table layouts with the expanded sidebar at different screen widths."
  },
  {
    "slot": "filter-before",
    "file": "images/filter-before.webp",
    "alt": "The order toolbar has a search field, a generic Filter button and a three dot menu.",
    "caption": "Before. The customer filter's selected value is hidden behind Filter."
  },
  {
    "slot": "filter-proposed",
    "file": "images/filter-proposed.webp",
    "alt": "The customer filter dropdown is open above the search field, with the selected value visible.",
    "caption": "Proposed. The selected filter value stays visible directly in the toolbar."
  },
  {
    "slot": "search-hidden-matches",
    "file": "images/search-hidden-matches.webp",
    "alt": "Customer search results are split into visible matches and matches hidden by the current filter.",
    "caption": "Matching customers excluded by the current filter appear in a separate group."
  }
];

var IMG_W = 2400, IMG_H = 1800;
var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
var REDUCED_MOTION = motionQuery.matches;

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

function makeImg(src, alt, eager, width, height) {
  var img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.width = width || IMG_W;
  img.height = height || IMG_H;
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
  var media = document.createElement('div');
  media.className = 'media';
  f.figure = figure;
  f.media = media;
  if (f.ready === false) {
    media.classList.add('placeholder');
    media.setAttribute('aria-hidden', 'true');
    figure.appendChild(media);
  } else {
    media.appendChild(makeImg(f.file, f.alt || f.caption || '', f.hero, f.width, f.height));
    if (f.hero) {
      figure.appendChild(media);
    } else {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoom';
      btn.setAttribute('aria-label', f.caption || f.alt);
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

// Paired comparisons keep their own navigation, as in the existing cases.
document.querySelectorAll('.pair').forEach(function (pairEl) {
  var group = FIGURES.filter(function (f) { return f.btn && pairEl.contains(f.figure); });
  if (group.length > 1) group.forEach(function (f) { f.group = group; });
});
// Other stills form one set in page order, as in release-groups.
var pageStills = FIGURES.filter(function (f) { return f.btn && !f.group; });
pageStills.forEach(function (f) { f.group = pageStills; });

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
var lbVideo = createVideo('lb-img lb-video');
lbVideo.addEventListener('playing', function () {
  if (lbCurrent && lbCurrent.type === 'video' && lbState !== 'closed' && lbState !== 'closing' && !REDUCED_MOTION && !document.hidden) {
    lbVideo.classList.add('is-playing');
  } else {
    lbVideo.pause();
  }
});
lbVideo.addEventListener('error', function () { lbVideo.classList.remove('is-playing'); });
lbImgNext.alt = '';
lbImgNext.setAttribute('aria-hidden', 'true');
[lbImg, lbImgNext].forEach(function (img) { img.width = IMG_W; img.height = IMG_H; });
lbImg.decoding = 'sync'; // the zoom starts from the cached page image, so paint it on the first frame
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

function visibleFrame(f) {
  if (f.type === 'video') return { src: f.poster, img: f.media.querySelector('.video-poster') };
  return { src: f.file, img: f.media.querySelector("img") };
}

// Fit the image and caption with the usual margins, capped at this figure's export size.
function layoutLightbox() {
  var margin = mobileQuery.matches ? 16 : 32;
  var vw = window.innerWidth, vh = window.innerHeight;
  var availW = vw - 2 * margin, availH = vh - 2 * margin;
  var imageW = lbCurrent.width || IMG_W, imageH = lbCurrent.height || IMG_H;
  var w = Math.min(availW, imageW), capH = 0;
  for (var i = 0; i < 3; i++) { // caption height depends on width, so settle it
    lbCaption.style.width = Math.floor(w) + 'px';
    capH = lbCaption.textContent ? lbCaption.offsetHeight + CAPTION_GAP : 0;
    w = Math.min(availW, imageW, (availH - capH) * imageW / imageH);
  }
  w = Math.floor(w);
  var h = Math.round(w * imageH / imageW);
  var left = Math.round((vw - w) / 2);
  var top = Math.round((vh - h - capH) / 2);
  lbRect = { left: left, top: top, width: w, height: h };
  [lbImg, lbVideo, lbImgNext].forEach(function (img) {
    img.width = imageW;
    img.height = imageH;
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
  [lbImg, lbVideo].forEach(function (media) {
    media.style.transform = 'translate(' + (rect.left - lbRect.left) + 'px, ' + (rect.top - lbRect.top) + 'px) scale(' + s + ')';
    media.style.borderRadius = (mediaRadius() / s) + 'px';
  });
}
function clearPlacement() {
  [lbImg, lbVideo].forEach(function (media) {
    media.style.transform = '';
    media.style.borderRadius = '';
  });
}
function animating(on) {
  [lbImg, lbVideo].forEach(function (media) { media.classList.toggle('is-animating', on); });
}
function stopLightboxVideo() {
  lbVideo.pause();
  lbVideo.classList.remove('is-playing');
  if (lbVideo.hasAttribute('src')) {
    lbVideo.removeAttribute('src');
    lbVideo.load();
  }
}
function startLightboxVideo(f) {
  if (f.type !== 'video' || REDUCED_MOTION || document.hidden) return;
  lbVideo.poster = f.poster;
  lbVideo.src = f.file;
  var play = lbVideo.play();
  if (play && typeof play.catch === 'function') play.catch(function () { /* Keep the poster. */ });
}
function syncInlineVideos() {
  FIGURES.forEach(function (f) { if (f.syncPlayback) f.syncPlayback(); });
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

function openLightbox(f) {
  if (lbState !== 'closed') return;
  var frame = visibleFrame(f);
  var from = frame.img.getBoundingClientRect();

  lbCurrent = f;
  lbState = 'opening';
  syncInlineVideos();
  lbScrolled = 0;
  lbImg.src = frame.src;
  lbImg.alt = f.alt || f.caption || '';
  lbCaption.textContent = f.caption || '';
  updateNav();
  lockScroll();
  lb.hidden = false;
  layoutLightbox();
  f.media.style.visibility = 'hidden'; // the image "lifts" off the page
  lbClose.focus({ preventScroll: true });
  startLightboxVideo(f);

  if (REDUCED_MOTION) {
    lb.classList.add('is-open', 'is-zoomed');
    lbState = 'open';
    return;
  }
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
    lbState = 'closed';
    lbCurrent = null;
    stopLightboxVideo();
    syncInlineVideos();
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
  stopLightboxVideo();
  lbCurrent = target;
  prev.media.style.visibility = '';
  target.media.style.visibility = 'hidden'; // closing now zooms back to this figure
  lbImg.alt = target.alt || target.caption || '';
  lbCaption.textContent = target.caption || '';
  layoutLightbox();
  updateNav();
  if (document.activeElement && document.activeElement.disabled) lbClose.focus();

  if (prev.type === 'video' || target.type === 'video') {
    clearTimeout(lbSwapTimer);
    lbImgNext.classList.remove('is-visible');
    lbImg.src = frame.src;
    startLightboxVideo(target);
    return;
  }

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

/* Same poster-first playback as the release-groups wizard, shared by the two
   sidebar clips. No movie request until visible; the lightbox pauses both. */
function createVideo(className) {
  var video = el('video', className);
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  return video;
}

function renderVideo(figure, f) {
  var media = el('div', 'media video-media');
  media.setAttribute('role', 'img');
  media.setAttribute('aria-label', f.alt);
  var poster = makeImg(f.poster, '', false, f.width, f.height);
  poster.className = 'video-poster';
  var video = createVideo('');
  video.width = f.width;
  video.height = f.height;
  video.poster = f.poster;
  media.appendChild(poster);
  media.appendChild(video);
  var btn = el('button', 'zoom');
  btn.type = 'button';
  btn.setAttribute('aria-label', f.caption || f.alt);
  btn.appendChild(media);
  btn.addEventListener('click', function () { openLightbox(f); });
  figure.appendChild(btn);
  f.figure = figure;
  f.media = media;
  f.btn = btn;
  var caption = el('figcaption', '');
  caption.textContent = f.caption;
  figure.appendChild(caption);

  var inView = false;
  function shouldPlay() {
    return inView && !REDUCED_MOTION && !document.hidden && lbState === 'closed';
  }
  function syncPlayback() {
    if (!shouldPlay()) {
      video.pause();
      if (REDUCED_MOTION) media.classList.remove('is-playing');
      return;
    }
    if (!video.hasAttribute('src')) video.src = f.file;
    var play = video.play();
    if (play && typeof play.catch === 'function') play.catch(function () { /* Keep the poster. */ });
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
  f.syncPlayback = syncPlayback;
}

motionQuery.addEventListener('change', function () {
  REDUCED_MOTION = motionQuery.matches;
  syncInlineVideos();
  if (REDUCED_MOTION) stopLightboxVideo();
  else if (lbCurrent && lbState !== 'closed' && lbState !== 'closing') startLightboxVideo(lbCurrent);
});
document.addEventListener('visibilitychange', function () {
  syncInlineVideos();
  if (document.hidden) lbVideo.pause();
  else if (lbCurrent && lbState !== 'closed' && lbState !== 'closing' && !REDUCED_MOTION && lbVideo.hasAttribute('src')) {
    var play = lbVideo.play();
    if (play && typeof play.catch === 'function') play.catch(function () {});
  }
});
