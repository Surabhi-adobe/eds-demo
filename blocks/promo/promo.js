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
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1400' }, { media: '(width >= 600px)', width: '2000' }]));
  });
}

/**
 * Promo: a background image panel with a white overlay card.
 * Row 1: image. Row 2: heading, text, CTA. The image may also sit in its own
 * cell next to the text, or at the top of the text cell.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const picture = block.querySelector('picture');

  const image = document.createElement('div');
  image.className = 'promo-image';
  const card = document.createElement('div');
  card.className = 'promo-card';

  if (picture) {
    // drop the wrapper (<p>, <a>) if it only held the picture
    const wrapper = picture.parentElement.closest('p');
    image.append(picture);
    if (wrapper && !wrapper.textContent.trim() && !wrapper.querySelector('picture, img')) wrapper.remove();
  }

  cells.forEach((cell) => {
    if (!cell.textContent.trim() && !cell.querySelector('img')) return;
    // loose text nodes in a cell are wrapped so they keep paragraph styling
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        card.append(p);
      } else {
        card.append(node);
      }
    });
  });

  const children = [];
  if (image.children.length) children.push(image);
  else block.classList.add('promo-no-image');
  if (card.children.length) children.push(card);
  optimizeImages(image);
  block.replaceChildren(...children);
}
