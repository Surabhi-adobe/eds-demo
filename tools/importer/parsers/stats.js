/* eslint-disable */
/* global WebImporter */

/**
 * Parser for stats (Jackson .stat-spotlight).
 *
 * Authored table "Stats":
 *   row 1 (single cell): h2, p (keeps <sup>), <p><strong><a>primary</a></strong></p>,
 *                        <p><em><a>secondary</a></em></p>
 *   rows 2..n (two cells): value text | label text with <sup>
 *
 * Stat values (.stat-header) and labels (.stat-description) are flat siblings
 * in .stats-container; they are paired in document order.
 */

const ORIGIN = 'https://www.jackson.com';

function absUrl(value) {
  if (!value) return '';
  const raw = value.trim();
  if (!raw || raw.startsWith('data:') || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  try {
    const url = new URL(raw, `${ORIGIN}/`);
    if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
      url.searchParams.delete('host');
      return `${ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN}${url.pathname}${url.search}${url.hash}`;
    return url.href;
  } catch (e) {
    return raw;
  }
}

function cleanText(text) {
  return (text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Inline content of an element with spans unwrapped, empty <sup>s dropped, whitespace trimmed. */
function inlineContent(document, el) {
  const holder = document.createElement('div');
  holder.innerHTML = el.innerHTML;
  holder.querySelectorAll('sup').forEach((s) => { if (!cleanText(s.textContent)) s.remove(); });
  holder.querySelectorAll('span, b, font').forEach((s) => s.replaceWith(...s.childNodes));
  // Collapse whitespace in text nodes; trim the ends.
  const walker = document.createTreeWalker(holder, 4);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { t.textContent = t.textContent.replace(/[ \t\r\n]+/g, ' '); });
  holder.innerHTML = holder.innerHTML.trim();
  return [...holder.childNodes];
}

function linkPara(document, src, wrappers) {
  const p = document.createElement('p');
  let parent = p;
  wrappers.forEach((tag) => {
    const w = document.createElement(tag);
    parent.append(w);
    parent = w;
  });
  const a = document.createElement('a');
  a.href = absUrl(src.getAttribute('href'));
  a.textContent = cleanText(src.textContent);
  parent.append(a);
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  // Intro row.
  const intro = [];
  const content = element.querySelector('.stat-spotlight-content') || element;

  const headingEl = content.querySelector('h2, h1, h3');
  if (headingEl && cleanText(headingEl.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(headingEl.textContent);
    intro.push(h2);
  }

  content.querySelectorAll('.description p').forEach((p) => {
    if (!cleanText(p.textContent)) return;
    const para = document.createElement('p');
    para.append(...inlineContent(document, p));
    intro.push(para);
  });

  content.querySelectorAll('.action a[href]').forEach((a) => {
    if (!cleanText(a.textContent)) return;
    const secondary = a.classList.contains('secondary-cta-button');
    intro.push(linkPara(document, a, secondary ? ['em'] : ['strong']));
  });

  if (intro.length) cells.push([intro]);

  // Stat rows: pair each .stat-header with the following .stat-description.
  const statsContainer = element.querySelector('.stats-container');
  if (statsContainer) {
    const parts = [...statsContainer.querySelectorAll('.stat-header, .stat-description')];
    let current = null;
    const pairs = [];
    parts.forEach((part) => {
      if (part.classList.contains('stat-header')) {
        current = { value: part, label: null };
        pairs.push(current);
      } else if (current && !current.label) {
        current.label = part;
      }
    });

    pairs.forEach(({ value, label }) => {
      const valueText = cleanText(value.textContent);
      if (!valueText) return;
      const labelSrc = label ? (label.querySelector('p') || label) : null;
      const labelNodes = labelSrc ? inlineContent(document, labelSrc) : [];
      cells.push([valueText, labelNodes.length ? labelNodes : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Stats', cells });
  element.replaceWith(block);
}
