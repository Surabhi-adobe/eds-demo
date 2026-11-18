/* eslint-disable */
/* global WebImporter */

/**
 * Parser for promo (Jackson financial professional spotlight).
 *
 * Authored table "Promo":
 *   row 1: background image
 *   row 2: h2 + paragraph + <p><strong><a>Get started</a></strong></p>
 *
 * On the source page the photo is a CSS background-image on .contents
 * (class bg-image-<uuid>) or .spotlight. The url is read from inline style,
 * computed style or a matching stylesheet rule, falling back to an <img>
 * already present in .contents (scraped/cached DOM).
 *
 * Matches either the outer .background-container:has(.spotlight) or the
 * inner .spotlight; in the latter case the enclosing container is replaced.
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

function urlFromCss(value) {
  if (!value || value === 'none') return '';
  const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
  return m ? m[2] : '';
}

function bgFromStyle(el) {
  if (!el) return '';
  const inline = urlFromCss(el.getAttribute('style') || '');
  if (inline) return inline;
  try {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (view && view.getComputedStyle) {
      const computed = urlFromCss(view.getComputedStyle(el).backgroundImage);
      if (computed) return computed;
    }
  } catch (e) {
    // computed style not available in this environment
  }
  return '';
}

function bgFromStylesheets(document, el) {
  if (!el) return '';
  const bgClass = [...el.classList].find((c) => c.startsWith('bg-image-'));
  if (!bgClass) return '';
  // <style> rules (if still present) and CSSOM sheets.
  const texts = [...document.querySelectorAll('style')].map((s) => s.textContent || '');
  for (let i = 0; i < texts.length; i += 1) {
    const re = new RegExp(`\\.${bgClass}[^{]*\\{[^}]*background(?:-image)?\\s*:[^;}]*url\\(\\s*(['"]?)(.*?)\\1\\s*\\)`, 'i');
    const m = texts[i].match(re);
    if (m) return m[2];
  }
  try {
    const sheets = [...(document.styleSheets || [])];
    for (let i = 0; i < sheets.length; i += 1) {
      let rules = [];
      try { rules = [...sheets[i].cssRules]; } catch (e) { rules = []; }
      for (let j = 0; j < rules.length; j += 1) {
        const r = rules[j];
        if (r.selectorText && r.selectorText.includes(`.${bgClass}`) && r.style) {
          const u = urlFromCss(r.style.backgroundImage || r.style.background);
          if (u) return u;
        }
      }
    }
  } catch (e) {
    // no CSSOM
  }
  return '';
}

function findBackgroundImage(document, root) {
  const contents = root.querySelector('.contents') || root.closest('.contents');
  const spotlight = root.matches('.spotlight') ? root : root.querySelector('.spotlight');
  const candidates = [contents, spotlight, spotlight && spotlight.querySelector('.spotlight-wrapper')].filter(Boolean);

  for (let i = 0; i < candidates.length; i += 1) {
    const url = bgFromStyle(candidates[i]) || bgFromStylesheets(document, candidates[i]);
    if (url) return { src: url, alt: '' };
  }

  // Fallback: an <img> sitting in .contents outside the text card.
  const imgs = contents ? [...contents.querySelectorAll('img')] : [];
  const img = imgs.find((i) => !i.closest('.spotlight-wrapper .header, .spotlight-wrapper .action'));
  if (img) {
    const src = (img.getAttribute('src') && !img.getAttribute('src').startsWith('data:'))
      ? img.getAttribute('src')
      : (img.getAttribute('data-src') || img.getAttribute('src'));
    return { src, alt: img.getAttribute('alt') || '' };
  }
  return null;
}

export default function parse(element, { document }) {
  const container = element.matches('.spotlight')
    ? (element.closest('.background-container') || element)
    : element;

  const cells = [];

  // Row 1: background image.
  const bg = findBackgroundImage(document, container);
  if (bg && bg.src) {
    const img = document.createElement('img');
    img.src = absUrl(bg.src);
    img.alt = bg.alt || '';
    cells.push([img]);
  }

  // Row 2: heading, paragraph(s), primary CTA.
  const content = [];
  const wrapper = container.querySelector('.spotlight-wrapper') || container;

  const headingEl = wrapper.querySelector('.title h2, .title h1, .title h3, h2');
  if (headingEl && cleanText(headingEl.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(headingEl.textContent);
    content.push(h2);
  }

  wrapper.querySelectorAll('.header p').forEach((p) => {
    if (!cleanText(p.textContent)) return;
    const para = document.createElement('p');
    para.innerHTML = p.innerHTML;
    para.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
    content.push(para);
  });

  const cta = wrapper.querySelector('.action a[href]');
  if (cta && cleanText(cta.textContent)) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = absUrl(cta.getAttribute('href'));
    a.textContent = cleanText(cta.textContent);
    strong.append(a);
    p.append(strong);
    content.push(p);
  }

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Promo', cells });
  container.replaceWith(block);
}
