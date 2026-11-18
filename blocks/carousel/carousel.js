import { createOptimizedPicture } from '../../scripts/aem.js';

let carouselId = 0;

/**
 * Re-renders authored images: the first slide's image is the LCP candidate and stays eager,
 * the rest load lazily. Only same-origin, non-SVG images go through createOptimizedPicture.
 * @param {Element} container element holding the slide image
 * @param {boolean} eager load the image eagerly
 */
function decorateImage(container, eager) {
  container.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) {
      img.loading = eager ? 'eager' : 'lazy';
      if (eager) img.fetchPriority = 'high';
      return;
    }
    const picture = createOptimizedPicture(img.src, img.alt, eager, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    if (eager) picture.querySelector('img').fetchPriority = 'high';
    img.closest('picture').replaceWith(picture);
  });
}

/**
 * Splits an authored row into its image, content and tab-label cells.
 * Authors may omit the image or the label cell, so cells are identified by content.
 * @param {Element} row authored block row
 */
function readRow(row) {
  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const textCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());
  const contentCell = textCells[0] || null;
  const labelCell = textCells.length > 1 ? textCells[textCells.length - 1] : null;
  return { imageCell, contentCell, labelCell };
}

export default function decorate(block) {
  carouselId += 1;
  const idPrefix = `carousel-${carouselId}`;

  const rows = [...block.children]
    .map(readRow)
    .filter(({ imageCell, contentCell }) => imageCell || contentCell);

  const slides = document.createElement('div');
  slides.className = 'carousel-slides';
  const tablist = document.createElement('div');
  tablist.className = 'carousel-tabs';
  tablist.setAttribute('role', 'tablist');

  const panels = [];
  const tabs = [];

  rows.forEach(({ imageCell, contentCell, labelCell }, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.id = `${idPrefix}-slide-${index + 1}`;

    if (imageCell) {
      const image = document.createElement('div');
      image.className = 'carousel-slide-image';
      image.append(...imageCell.childNodes);
      decorateImage(image, index === 0);
      slide.append(image);
    }

    const heading = contentCell?.querySelector('h1, h2, h3, h4, h5, h6');
    if (contentCell) {
      const content = document.createElement('div');
      content.className = 'carousel-slide-content';
      content.append(...contentCell.childNodes);
      slide.append(content);
    }

    const label = labelCell?.textContent.trim()
      || heading?.textContent.trim()
      || `Slide ${index + 1}`;
    slide.dataset.label = label;
    panels.push(slide);
    slides.append(slide);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'carousel-tab';
    tab.id = `${idPrefix}-tab-${index + 1}`;
    tab.textContent = label;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', slide.id);
    tabs.push(tab);
    tablist.append(tab);
  });

  if (panels.length < 2) {
    // a single slide renders as a plain hero: no tabs, no tab semantics
    block.classList.add('carousel-single');
    block.replaceChildren(slides);
    return;
  }

  const activate = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      panels[i].classList.toggle('active', selected);
    });
    if (focus) {
      tabs[index].focus();
      tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  panels.forEach((panel, i) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[i].id);
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
  });

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    activate(next, true);
  });

  activate(0);
  block.replaceChildren(slides, tablist);
}
