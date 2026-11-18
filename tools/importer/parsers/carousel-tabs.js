/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-tabs (Jackson hero tabbed carousel, .hero-space).
 *
 * Authored table "Carousel (tabs)": one row per slide
 *   [shared background image] | [heading + paragraph(s) + CTA] | [tab label]
 *
 * Each .tab-content panel holds a .wide and a .narrow copy of the same
 * content; only one copy (wide, falling back to narrow) is used per slide.
 * Hidden panels (.tab-content.hidden) are real slides and are included.
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

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  if (src && !src.startsWith('data:')) return src;
  return img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || src;
}

function makeImage(document, srcImg) {
  if (!srcImg) return null;
  const img = document.createElement('img');
  img.src = absUrl(imgSrc(srcImg));
  img.alt = srcImg.getAttribute('alt') || '';
  return img;
}

function unwrapSpans(root) {
  root.querySelectorAll('span').forEach((span) => {
    span.replaceWith(...span.childNodes);
  });
  return root;
}

function buildSlideContent(document, panel, index) {
  const copy = panel.querySelector(':scope > .wide') || panel.querySelector(':scope > .narrow') || panel;
  const content = [];

  // Heading: slide 1 is the page h1, the others are h2 (source nests h2 inside h1).
  const headline = copy.querySelector('.headline, h1, h2');
  const headingText = cleanText(headline ? headline.textContent : '');
  if (headingText) {
    const heading = document.createElement(index === 0 ? 'h1' : 'h2');
    heading.textContent = headingText;
    content.push(heading);
  }

  // Paragraph(s), keeping <sup> footnote markers.
  copy.querySelectorAll('.description p').forEach((p) => {
    if (!cleanText(p.textContent)) return;
    const para = document.createElement('p');
    para.innerHTML = p.innerHTML;
    unwrapSpans(para);
    content.push(para);
  });

  // CTA: accent arrow text link -> <p><strong><em><a>
  const cta = copy.querySelector('.action a[href]');
  if (cta && cleanText(cta.textContent)) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const em = document.createElement('em');
    const a = document.createElement('a');
    a.href = absUrl(cta.getAttribute('href'));
    a.textContent = cleanText(cta.textContent);
    em.append(a);
    strong.append(em);
    p.append(strong);
    content.push(p);
  }

  return content;
}

export default function parse(element, { document }) {
  const bgImg = element.querySelector('.background img');
  const panels = [...element.querySelectorAll('.tab-content')];
  const tabItems = [...element.querySelectorAll('.tab-container li')];

  const cells = [];
  panels.forEach((panel, index) => {
    const content = buildSlideContent(document, panel, index);
    if (!content.length) return;

    // Pair tab label by id, falling back to document order.
    const id = panel.getAttribute('id');
    const tab = (id && tabItems.find((li) => li.getAttribute('id') === id)) || tabItems[index];
    const label = cleanText(tab ? tab.textContent : '');

    const image = makeImage(document, bgImg);
    cells.push([image || '', content, label]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel (tabs)', cells });
  element.replaceWith(block);
}
