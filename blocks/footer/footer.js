// hosts treated as "this site": links anywhere else open in a new tab
const SAME_SITE_HOSTS = [window.location.hostname, 'www.jackson.com'];

/**
 * Fetches the footer fragment. Local preview serves it under /content, Edge Delivery at the root.
 * Relative media paths are resolved against the fragment URL so they work on every page.
 * @returns {Promise<HTMLElement|null>} wrapper element holding the footer sections
 */
async function fetchFooter() {
  // metadata-independent: /content first (local preview), then root (Edge Delivery)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();

  const base = new URL(resp.url, window.location.href);
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  wrapper.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
  return wrapper;
}

/**
 * Opens links to other sites in a new tab.
 * @param {Element} root container to scan
 */
function decorateExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    let url;
    try {
      url = new URL(a.href);
    } catch {
      return;
    }
    if (!url.protocol.startsWith('http') || SAME_SITE_HOSTS.includes(url.hostname)) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
}

/**
 * Groups each heading with the lists that follow it into a link column.
 * @param {Element} section the link section
 */
function decorateLinkColumns(section) {
  section.classList.add('footer-links');
  const columns = [];
  [...section.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName) || !columns.length) {
      const column = document.createElement('div');
      column.className = 'footer-column';
      columns.push(column);
    }
    columns[columns.length - 1].append(el);
  });
  section.replaceChildren(...columns);
}

/**
 * Decorates the bottom row: copyright, legal links and icon-only social links.
 * Social icons are rendered as masks so they can change colour on hover.
 * @param {Element} section the bottom-row section
 */
function decorateBottomRow(section) {
  section.classList.add('footer-bottom');
  const legal = document.createElement('div');
  legal.className = 'footer-legal';

  [...section.children].forEach((el) => {
    if (el.tagName === 'UL' && el.querySelector('img')) {
      el.classList.add('footer-social');
      el.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        if (!img) return;
        if (img.alt) a.setAttribute('aria-label', img.alt);
        const icon = document.createElement('span');
        icon.className = 'footer-social-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.setProperty('--icon', `url("${img.src}")`);
        img.replaceWith(icon);
      });
    } else {
      if (el.tagName === 'P') el.classList.add('footer-copyright');
      if (el.tagName === 'UL') el.classList.add('footer-legal-links');
      legal.append(el);
    }
  });
  section.prepend(legal);
}

/**
 * Decorates the disclosure text: a bold-only first paragraph becomes the notice box.
 * @param {Element} section the disclosure section
 */
function decorateDisclosures(section) {
  section.classList.add('footer-disclosure-text');
  const first = section.querySelector('p');
  if (first && first.children.length === 1 && first.querySelector('strong, b')
    && first.textContent.trim() === first.querySelector('strong, b').textContent.trim()) {
    first.classList.add('footer-notice');
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  const sections = [...fragment.children];
  const [links, bottom, disclosures, badge] = sections;

  const main = document.createElement('div');
  main.className = 'footer-main';
  const legalBand = document.createElement('div');
  legalBand.className = 'footer-disclosures';

  if (links) {
    decorateLinkColumns(links);
    main.append(links, document.createElement('hr'));
  }
  if (bottom) {
    decorateBottomRow(bottom);
    main.append(bottom);
  }
  if (disclosures) {
    decorateDisclosures(disclosures);
    legalBand.append(disclosures);
  }
  if (badge) {
    badge.classList.add('footer-badge');
    legalBand.append(badge);
  }
  // any additional authored sections are kept in the disclosure band
  sections.slice(4).forEach((section) => legalBand.append(section));

  const mainBand = document.createElement('div');
  mainBand.className = 'footer-band footer-band-main';
  mainBand.append(main);
  const lowerBand = document.createElement('div');
  lowerBand.className = 'footer-band footer-band-disclosures';
  lowerBand.append(legalBand);

  decorateExternalLinks(mainBand);
  decorateExternalLinks(lowerBand);
  block.replaceChildren(mainBand, lowerBand);
}
