import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Optimizes same-origin raster images only. External (not yet uploaded) and
 * SVG images keep the authored <picture>.
 * @param {Element} root
 */
function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/**
 * True when the element only holds a picture (optionally wrapped in a <p>/<a>).
 * @param {Element} el
 */
function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

/**
 * Marks the card title: the first heading, or a paragraph that is only bold text
 * (not a button).
 * @param {Element} body
 */
function markTitle(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('cards-card-title');
    return;
  }
  const strongP = [...body.querySelectorAll(':scope > p')].find((p) => {
    const strong = p.querySelector(':scope > strong');
    return strong && !p.classList.contains('button-wrapper') && !strong.querySelector('a')
      && p.textContent.trim() === strong.textContent.trim();
  });
  if (strongP) strongP.classList.add('cards-card-title');
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    const cells = [...li.children];
    cells.forEach((div) => {
      if (isPictureOnly(div)) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    cells.filter((div) => !div.textContent.trim() && !div.querySelector('picture'))
      .forEach((div) => div.remove());

    // image authored inside the body cell: lift it into its own image cell
    const body = li.querySelector('.cards-card-body');
    if (body && !li.querySelector('.cards-card-image')) {
      const first = body.firstElementChild;
      const pic = first && (first.matches('picture') || isPictureOnly(first)) ? first : null;
      if (pic) {
        const imageCell = document.createElement('div');
        imageCell.className = 'cards-card-image';
        imageCell.append(pic);
        li.prepend(imageCell);
      }
    }
    if (body) markTitle(body);
    if (li.children.length) ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
