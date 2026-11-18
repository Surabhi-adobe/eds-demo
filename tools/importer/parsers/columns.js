/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns (Jackson .comparison-highlight-layout).
 *
 * Authored table "Columns": one row, two cells
 *   [h2, intro p, ul, <p><strong><em><a>CTA</a></em></strong></p>] | [image]
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

/** Copies a node, dropping spans, empty inline wrappers and trailing <br>s. */
function tidy(el) {
  el.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
  el.querySelectorAll('i, em, b, strong').forEach((n) => {
    if (!n.querySelector('img, a, sup') && !cleanText(n.textContent)) {
      n.replaceWith(n.ownerDocument.createTextNode(n.textContent ? ' ' : ''));
    }
  });
  el.querySelectorAll('li, p').forEach((n) => {
    while (n.lastChild && ((n.lastChild.nodeType === 1 && n.lastChild.tagName === 'BR')
      || (n.lastChild.nodeType === 3 && !n.lastChild.textContent.trim()))) {
      n.lastChild.remove();
    }
  });
  return el;
}

export default function parse(element, { document }) {
  const main = element.querySelector('.main-content') || element;
  const secondary = element.querySelector('.secondary-content');

  const textCell = [];

  const headingEl = main.querySelector('.title h2, .title h1, .title h3, h2');
  if (headingEl && cleanText(headingEl.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(headingEl.textContent);
    textCell.push(h2);
  }

  const description = main.querySelector('.description');
  if (description) {
    [...description.children].forEach((child) => {
      const tag = child.tagName;
      if (!['P', 'UL', 'OL'].includes(tag)) return;
      if (!cleanText(child.textContent)) return;
      textCell.push(tidy(child.cloneNode(true)));
    });
  }

  main.querySelectorAll('.small-links a[href]').forEach((cta) => {
    if (!cleanText(cta.textContent)) return;
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const em = document.createElement('em');
    const a = document.createElement('a');
    a.href = absUrl(cta.getAttribute('href'));
    a.textContent = cleanText(cta.textContent);
    em.append(a);
    strong.append(em);
    p.append(strong);
    textCell.push(p);
  });

  const imgEl = (secondary || element).querySelector('img');
  const image = makeImage(document, imgEl);

  const cells = [[textCell, image ? [image] : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
  element.replaceWith(block);
}
