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

/* Static figures use the existing loan-platform lightbox. */
var FIGURES = Array.from(document.querySelectorAll('main figure[data-slot]')).map(function (figure) {
  var img = figure.querySelector('.media img');
  var btn = figure.querySelector('.zoom');
  var caption = figure.querySelector('figcaption');
  var f = { figure: figure, media: figure.querySelector('.media'), file: img.getAttribute('src'), alt: img.alt, caption: caption ? caption.textContent : '', width: img.width, height: img.height, hero: figure.classList.contains('hero'), btn: btn };
  if (btn) btn.addEventListener('click', function () { openLightbox(f); });
  return f;
});
document.querySelectorAll('.pair').forEach(function (pair) {
  var group = FIGURES.filter(function (f) { return f.btn && pair.contains(f.figure); });
  group.forEach(function (f) { f.group = group; });
});
var pageStills = FIGURES.filter(function (f) { return f.btn && !f.group; });
pageStills.forEach(function (f) { f.group = pageStills; });
var crossfadePaused = false;

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
var lbCaption = el('p', 'lb-caption');
lbCaption.id = 'lb-caption';
var lbPrev = lbButton('lb-prev', 'Previous image', 'chevron-left');
var lbNext = lbButton('lb-next', 'Next image', 'chevron-right');
var lbClose = lbButton('lb-close', 'Close', 'x');

[lbBackdrop, lbImg, lbImgNext, lbCaption, lbPrev, lbNext, lbClose].forEach(function (n) { lb.appendChild(n); });
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
  var w = Math.min(availW, IMG_W), capH = 0;
  for (var i = 0; i < 3; i++) { // caption height depends on width, so settle it
    lbCaption.style.width = Math.floor(w) + 'px';
    capH = lbCaption.textContent ? lbCaption.offsetHeight + CAPTION_GAP : 0;
    w = Math.min(availW, IMG_W, (availH - capH) * IMG_W / IMG_H);
  }
  w = Math.floor(w);
  var h = Math.round(w * IMG_H / IMG_W);
  var left = Math.round((vw - w) / 2);
  var top = Math.round((vh - h - capH) / 2);
  lbRect = { left: left, top: top, width: w, height: h };
  [lbImg, lbImgNext].forEach(function (img) {
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
  lbImg.style.transform = 'translate(' + (rect.left - lbRect.left) + 'px, ' + (rect.top - lbRect.top) + 'px) scale(' + s + ')';
  lbImg.style.borderRadius = (mediaRadius() / s) + 'px'; // looks like the page radius while scaled down
}
function clearPlacement() {
  lbImg.style.transform = '';
  lbImg.style.borderRadius = '';
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
  crossfadePaused = true;
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

  if (REDUCED_MOTION) {
    lb.classList.add('is-open', 'is-zoomed');
    lbState = 'open';
    return;
  }
  lbState = 'opening';
  placeOver(from);
  lbImg.getBoundingClientRect(); // commit the starting position
  lbImg.classList.add('is-animating');
  lb.classList.add('is-open');
  clearPlacement();
  clearTimeout(lbTimer);
  lbTimer = setTimeout(function () {
    lbImg.classList.remove('is-animating');
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
    lbImg.classList.remove('is-animating');
    clearPlacement();
    f.media.style.visibility = '';
    unlockScroll();
    crossfadePaused = false;
    lbState = 'closed';
    lbCurrent = null;
    f.btn.focus({ preventScroll: true });
  }

  if (REDUCED_MOTION) { finish(); return; }
  lbState = 'closing';
  lbImg.classList.add('is-animating');
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
