/* Shared card renderer. Load after data/cases.js with defer. */
(() => {
  'use strict';

  // Resolve against this script, not location.pathname: file previews and nested
  // deployments use the same registry paths as the root homepage.
  const script = document.currentScript;
  const root = new URL('../../', script.src);
  const entries = (window.PORTFOLIO_CASES || []).filter(entry => entry.published);
  const resolve = path => new URL(path, root).href;

  function text(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    return element;
  }

  function image(entry, className) {
    const media = document.createElement('span');
    media.className = className;
    if (!entry.image) {
      media.classList.add('media', 'placeholder');
      media.setAttribute('aria-hidden', 'true');
      return media;
    }
    const img = document.createElement('img');
    img.src = resolve(entry.image);
    img.alt = ''; // The adjacent heading names the same linked case.
    img.width = 2400;
    img.height = 1800;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.append(img);
    return media;
  }

  function arrow() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon icon-20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', 'M5 12h14m-6-6 6 6-6 6');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.append(path);
    return svg;
  }

  function card(entry, size = entry.size) {
    const link = document.createElement('a');
    link.className = `work-card work-card--${size}`;
    link.dataset.slug = entry.slug;
    link.dataset.side = entry.side;
    link.href = resolve(entry.url);
    const body = document.createElement('div');
    body.className = 'work-card-body';
    const title = text('h3', 'work-card-title', '');
    title.append(text('span', 'work-card-title-text', entry.title));
    body.append(title);
    body.append(text('p', 'work-card-tags', entry.tags.join(' · ')));
    if (size === 'large') {
      body.append(text('p', 'work-card-summary', entry.summary));
      const more = text('span', 'work-card-more', 'Read case');
      more.append(arrow());
      body.append(more);
    }
    link.append(image(entry, 'work-card-media'), body);
    return link;
  }

  document.querySelectorAll('[data-case-list]').forEach(container => {
    const selected = entries.filter(entry => entry.size === container.dataset.caseList);
    container.replaceChildren(...selected.map(entry => card(entry)));
    container.hidden = selected.length === 0;
  });

  document.querySelectorAll('[data-read-next]').forEach(container => {
    const current = entries.findIndex(entry => entry.slug === container.dataset.readNext);
    // Hidden or unknown pages never link back into the published sequence.
    if (current < 0 || entries.length < 2) {
      container.hidden = true;
      return;
    }
    const following = Array.from(
      { length: Math.min(3, entries.length - 1) },
      (_, index) => entries[(current + index + 1) % entries.length]
    );
    const heading = text('h2', 'read-next-title', 'Read next');
    heading.id = 'read-next-title';
    const grid = document.createElement('div');
    grid.className = 'case-grid';
    grid.append(...following.map(entry => card(entry, 'small')));
    container.replaceChildren(heading, grid);
    container.hidden = false;
  });

  // Keep Work links as ordinary home URLs; remember the scroll destination
  // across pages without exposing an anchor in the address bar.
  const workReturnKey = 'portfolio-work-return';
  const work = document.getElementById('work');
  document.querySelectorAll('[data-work-link]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (work) {
        event.preventDefault();
        work.scrollIntoView({ block: 'start' });
      } else {
        try { sessionStorage.setItem(workReturnKey, root.href); } catch (_) { /* The home link still works without storage. */ }
      }
    });
  });

  function restoreWork() {
    let scrollToWork = location.hash === '#work';
    if (scrollToWork) history.replaceState(history.state, '', location.pathname + location.search);
    if (!work) return;
    try {
      if (sessionStorage.getItem(workReturnKey) === root.href) {
        sessionStorage.removeItem(workReturnKey);
        scrollToWork = true;
      }
    } catch (_) { /* Storage can be disabled in a file preview. */ }
    if (scrollToWork) document.fonts.ready.then(() => work.scrollIntoView({ block: 'start' }));
  }
  restoreWork();
  window.addEventListener('pageshow', restoreWork);
})();
