/* ── Case page text panel (desktop & tablet) ──
   If the text is taller than the screen, shrink the title just enough for everything to fit,
   instead of making the panel scroll. The fade + panel scroll below is only a last resort
   for windows so short that even the smallest title doesn't fit. */
(function () {
  const info = document.querySelector('.case-info');
  const title = info && info.querySelector('.case-title');
  if (!title) return;

  const MIN_TITLE = 24;                                  // px, never smaller than this
  const stacked = window.matchMedia('(max-width: 900px)'); // mobile: normal page, nothing to fit
  const fits = () => info.scrollHeight <= info.clientHeight;

  const updateFade = () => {
    const hidden = info.scrollHeight - info.clientHeight - info.scrollTop;
    info.classList.toggle('has-more', hidden > 1);
  };

  const fitTitle = () => {
    title.style.fontSize = '';                           // start from the size in the CSS
    if (!stacked.matches && !fits()) {
      let lo = MIN_TITLE;
      let hi = parseFloat(getComputedStyle(title).fontSize);
      title.style.fontSize = lo + 'px';
      if (fits()) {
        // Largest size that still fits (binary search, whole pixels)
        while (hi - lo > 1) {
          const mid = Math.floor((lo + hi) / 2);
          title.style.fontSize = mid + 'px';
          if (fits()) lo = mid; else hi = mid;
        }
        title.style.fontSize = lo + 'px';
      }
    }
    updateFade();
  };

  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fitTitle); };

  fitTitle();
  window.addEventListener('resize', schedule);
  if (document.fonts) document.fonts.ready.then(fitTitle);  // re-fit once the web fonts are in
  info.addEventListener('scroll', updateFade, { passive: true });
})();

/* ── Case page × button (desktop) and "Back" link (mobile): back to the work list, no scroll animation ── */
document.querySelectorAll('a.close-btn, a.back-link').forEach(closeLink => {
  closeLink.addEventListener('click', e => {
    // Came here from the home page: step back in history so the browser restores
    // the exact previous scroll position instantly. Otherwise follow the link (jumps to #work).
    let fromHome = false;
    try {
      const ref = new URL(document.referrer);
      fromHome = ref.origin === location.origin && /\/(index\.html)?$/.test(ref.pathname);
    } catch (_) { /* no referrer */ }
    if (fromHome && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
});

/* ── Lightbox (case images only) ──
   ← / → switch to the previous / next image on the page (wrapping round), Esc or a click closes. */
(function () {
  const box = document.querySelector('.lightbox');
  if (!box) return;
  const boxImg = box.querySelector('.lightbox-img');
  const triggers = [...document.querySelectorAll('.case-image')];
  let current = 0;
  let viaKeyboard = false;
  let token = 0;

  const srcOf = i => {
    const img = triggers[i].querySelector('img');
    return triggers[i].dataset.large || img.currentSrc || img.src;
  };

  const show = i => {
    current = (i + triggers.length) % triggers.length;
    const src = srcOf(current);
    const alt = triggers[current].querySelector('img').alt;
    const mine = ++token;
    // Swap only once the new image is decoded, so switching never flashes an empty frame.
    const pre = new Image();
    pre.src = src;
    const apply = () => { if (mine === token) { boxImg.src = src; boxImg.alt = alt; } };
    if (boxImg.getAttribute('src') && pre.decode) pre.decode().then(apply, apply);
    else apply();
    // Warm up the neighbours so the next arrow press is instant.
    [current - 1, current + 1].forEach(n => { new Image().src = srcOf((n + triggers.length) % triggers.length); });
  };

  const open = (index, keyboard) => {
    // Only keyboard users get focus handed back to the image afterwards; for mouse users that
    // would show the focus outline around the image once the lightbox closes.
    viaKeyboard = keyboard;
    boxImg.removeAttribute('src');
    show(index);
    box.classList.add('active');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    box.focus({ preventScroll: true });
  };
  const close = () => {
    if (!box.classList.contains('active')) return;
    box.classList.remove('active');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (viaKeyboard) triggers[current].focus({ preventScroll: true });
    else box.blur();
  };

  triggers.forEach((btn, i) => {
    // e.detail is 0 when the button was activated with Enter/Space rather than a mouse click
    btn.addEventListener('click', e => open(i, e.detail === 0));
  });
  box.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  });
})();

/* ── Underlined links: after a click, hide the hover underline until the mouse really moves ──
   Otherwise, e.g. after "Work" scrolls the page and you scroll back up, the link slides back under
   the still cursor and shows as hovered. Scrolling alone doesn't move the pointer, so it stays hidden. */
document.querySelectorAll('.animated-link').forEach(link => {
  link.addEventListener('click', e => {
    link.classList.add('hover-off');
    const x = e.clientX, y = e.clientY;
    const onMove = ev => {
      if (Math.abs(ev.clientX - x) + Math.abs(ev.clientY - y) < 4) return; // same spot: not a real move
      link.classList.remove('hover-off');
      window.removeEventListener('pointermove', onMove);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
  });
});

/* ── Header "Work" link: smooth scroll down to the case list ── */
document.querySelectorAll('a[href="#work"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.getElementById('work');
    if (!target) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

/* ── Back to top ── */
document.querySelectorAll('.back-to-top-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
