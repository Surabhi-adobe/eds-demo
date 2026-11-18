/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature (Jackson .promo-card-wrapper).
 *
 * Authored table "Cards (feature)": one row per card
 *   [image] | [h3 title, p text, <p><strong><a>CTA</a></strong></p>]
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

function makeImage(document, srcImg) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('src') || '';
  const img = document.createElement('img');
  img.src = absUrl(src && !src.startsWith('data:') ? src : (srcImg.getAttribute('data-src') || src));
  img.alt = cleanText(srcImg.getAttribute('alt') || '');
  return img;
}

export default function parse(element, { document }) {
  // Stable inner wrapper per card; cards are nested siblings in document order.
  const cards = [...element.querySelectorAll('.promo-card-block')];

  const cells = [];
  cards.forEach((card) => {
    const image = makeImage(document, card.querySelector('.promo-image img'));

    const body = [];
    const titleEl = card.querySelector('.card-content .title');
    const title = cleanText(titleEl ? titleEl.textContent : '');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }

    card.querySelectorAll('.card-content .description p').forEach((p) => {
      if (!cleanText(p.textContent)) return;
      const para = document.createElement('p');
      para.innerHTML = p.innerHTML;
      para.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
      body.push(para);
    });

    const cta = card.querySelector('.card-content .action a[href]');
    if (cta && cleanText(cta.textContent)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = absUrl(cta.getAttribute('href'));
      a.textContent = cleanText(cta.textContent);
      strong.append(a);
      p.append(strong);
      body.push(p);
    }

    if (!image && !body.length) return;
    cells.push([image ? [image] : '', body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (feature)', cells });
  element.replaceWith(block);
}
