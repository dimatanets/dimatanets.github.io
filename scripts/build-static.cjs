/* Refresh the HTML available before JavaScript runs. No external dependencies.
 * Run after changing data/cases.js or the FIGURES arrays: node scripts/build-static.cjs
 * Existing browser scripts keep the interactive cards, lightboxes and videos.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const registry = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/cases.js'), 'utf8'), registry);
const entries = registry.window.PORTFOLIO_CASES.filter(entry => entry.published);
const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" class="icon icon-20" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
function card(entry, prefix, size = entry.size) {
  const media = entry.image ? `<span class="work-card-media"><img src="${esc(prefix + entry.image)}" alt="" width="2400" height="1800" loading="lazy" decoding="async"></span>` : '<span class="work-card-media media placeholder" aria-hidden="true"></span>';
  return `<a class="work-card work-card--${esc(size)}" data-slug="${esc(entry.slug)}" data-side="${esc(entry.side)}" href="${esc(prefix + entry.url)}">${media}<div class="work-card-body"><h3 class="work-card-title"><span class="work-card-title-text">${esc(entry.title)}</span></h3><p class="work-card-tags">${esc(entry.tags.join(' · '))}</p>${size === 'large' ? `<p class="work-card-summary">${esc(entry.summary)}</p><span class="work-card-more">Read case${arrow}</span>` : ''}</div></a>`;
}
const homePath = path.join(root, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
for (const size of ['large', 'small']) {
  const selected = entries.filter(entry => entry.size === size);
  const content = `<!-- static-cards:${size} -->\n            <div class="${size === 'large' ? 'case-list' : 'case-grid'}" data-case-list="${size}"${selected.length ? '' : ' hidden'}>\n                ${selected.map(entry => card(entry, '')).join('\n                ')}\n            </div>\n            <!-- /static-cards:${size} -->`;
  const pattern = home.includes(`<!-- static-cards:${size} -->`) ? new RegExp(`<!-- static-cards:${size} -->[\\s\\S]*?<!-- /static-cards:${size} -->`) : new RegExp(`<div[^>]*data-case-list="${size}"[^>]*><\\/div>`);
  if (!pattern.test(home)) throw new Error(`Missing homepage ${size} container`);
  home = home.replace(pattern, () => content);
}
fs.writeFileSync(homePath, home);
let figureCount = 0;
for (const [index, entry] of entries.entries()) {
  const file = path.join(root, entry.url, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const prefix = path.relative(path.dirname(file), root).replaceAll('\\', '/') + '/';
  const following = Array.from({length: Math.min(3, entries.length - 1)}, (_, offset) => entries[(index + offset + 1) % entries.length]);
  html = html.replace(/<nav\b[^>]*data-read-next="[^"]+"[^>]*>[\s\S]*?<\/nav>/, () => `<nav class="read-next" data-read-next="${esc(entry.slug)}" aria-labelledby="read-next-title"><h2 class="read-next-title" id="read-next-title">Read next</h2><div class="case-grid">${following.map(next => card(next, prefix, 'small')).join('')}</div></nav>`);
  const script = fs.readFileSync(path.join(root, entry.url, 'case.js'), 'utf8');
  if (/var FIGURES\s*=\s*\[/.test(script)) {
    const context = {};
    vm.runInNewContext(script.slice(0, script.indexOf('var IMG_W')), context);
    for (const f of context.FIGURES) {
      if (f.ready === false) throw new Error(`Unfinished figure ${entry.slug}/${f.slot}`);
      const src = f.type === 'video' ? f.poster : f.file || (f.frames && f.frames[0]);
      if (!src) throw new Error(`Missing static image ${entry.slug}/${f.slot}`);
      const content = `<div class="media"><img src="${esc(src)}" alt="${esc(f.alt || f.caption)}" width="${f.width || 2400}" height="${f.height || 1800}" decoding="async"${f.hero ? ' fetchpriority="high"' : ' loading="lazy"'}></div>${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}`;
      const pattern = new RegExp(`(<figure\\b[^>]*data-slot="${f.slot}"[^>]*>)[\\s\\S]*?<\\/figure>`);
      if (!pattern.test(html)) throw new Error(`Missing figure slot ${entry.slug}/${f.slot}`);
      html = html.replace(pattern, (_, open) => open + content + '</figure>');
      figureCount++;
    }
  }
  fs.writeFileSync(file, html);
}
console.log(`Static HTML updated: ${entries.length} homepage cards, ${entries.length} Read next sections, ${figureCount} figures.`);
