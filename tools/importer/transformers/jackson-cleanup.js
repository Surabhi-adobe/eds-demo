/* eslint-disable */
/* global WebImporter */

/**
 * Jackson (www.jackson.com) cleanup transformer.
 *
 * beforeTransform: removes site chrome and third-party widgets that would
 * otherwise interfere with block matching. Nothing inside
 * section > .content-wrapper (the mapped sections) is touched here, and no
 * sibling of the mapped sections is removed, so nth-of-type section selectors
 * (div.disclosure:nth-of-type(5|9|10)) stay valid.
 *
 * afterTransform: final cleanup (leftover empty wrappers, tracking attributes)
 * and absolutizes links to other Jackson pages.
 */

const ORIGIN = 'https://www.jackson.com';

// Source links that redirect: point them straight at the final page.
const REDIRECTS = {
  '/the-jackson-difference/environmental-social-governance.html': '/the-jackson-difference/corporate-responsibility.html',
};

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((n) => n.remove());
  });
}

function isEmptyWrapper(el) {
  if (el.querySelector('img, picture, video, iframe, table, hr, a, sup, svg')) return false;
  return el.textContent.replace(/ /g, ' ').trim() === '';
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || (payload && payload.document) || document;

  if (hookName === 'beforeTransform') {
    // The source's og:image / twitter:image omit the DAM prefix and 404; fix them before
    // the metadata block is created from the head.
    doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
      const value = meta.getAttribute('content') || '';
      const fixed = value.replace(/^(https:\/\/www\.jackson\.com)?\/graphics\//, `${ORIGIN}/content/dam/jacksoncom/graphics/`);
      if (fixed !== value) meta.setAttribute('content', fixed);
    });

    // Masthead / header (experience fragment that holds it) and mobile nav.
    element.querySelectorAll('.masthead, .masthead__wrapper').forEach((mh) => {
      const xf = mh.closest('.experiencefragment');
      (xf || mh).remove();
    });

    // Global footer (and its experience-fragment / personalization wrapper).
    element.querySelectorAll('.global-footer-wrapper, .global-footer, footer').forEach((ft) => {
      if (!ft.isConnected) return;
      const xf = ft.closest('.experiencefragment');
      (xf || ft).remove();
    });

    removeAll(element, [
      // Profile toggle bar
      '.toggle-container',
      // Navigation leftovers (desktop + mobile) outside the masthead
      '.fragment-navigation',
      '.contact-us-secondary-nav-area',
      // Consent manager (OneTrust)
      '#onetrust-consent-sdk',
      '[id^="onetrust-"]',
      '[class*="onetrust"]',
      '[id^="ot-sdk"]',
      // Qualtrics feedback
      '.QSIFeedbackButton',
      '[id^="QSIFeedbackButton"]',
      '[class*="QSI"]',
      '[id^="ZN_"]',
      // Session timeout modal + overlay mask
      '.session-timeout-panel',
      '#background-mask',
      // Tracking beacons / sync frames
      '[id^="batBeacon"]',
      '[id^="destination_publishing_iframe"]',
      // Non-content elements
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Hidden duplicates outside the mapped blocks. Hidden slides inside the
    // hero carousel (.hero-space .tab-content.hidden) are real content and are
    // left for the carousel parser.
    element.querySelectorAll('.hidden, .ot-hide').forEach((el) => {
      if (el.closest('.hero-space')) return;
      el.remove();
    });

    // Empty leading experience fragment in the first full-width container.
    element.querySelectorAll('.experiencefragment').forEach((xf) => {
      if (isEmptyWrapper(xf)) xf.remove();
    });
  }

  if (hookName === 'afterTransform') {
    // Leftovers that may survive parsing.
    removeAll(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'form',
      'select',
      'button',
      '.promo-area',
      '#onetrust-consent-sdk',
      '[class*="QSI"]',
    ]);

    // Absolutize links to other Jackson pages; keep homepage "/" as-is.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href').trim();
      if (!href || href === '/') return;
      if (href.startsWith('//')) {
        a.setAttribute('href', `https:${href}`);
        return;
      }
      if (href.startsWith('/')) {
        a.setAttribute('href', `${ORIGIN}${href}`);
        return;
      }
      const m = href.match(/^https?:\/\/(www\.)?jackson\.com(\/.*)?$/i);
      if (m) {
        const path = m[2] || '/';
        a.setAttribute('href', path === '/' ? '/' : `${ORIGIN}${path}`);
      }
    });

    // Follow known redirects so links go straight to the final page.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const path = href.startsWith(ORIGIN) ? href.slice(ORIGIN.length) : null;
      if (path && REDIRECTS[path]) a.setAttribute('href', `${ORIGIN}${REDIRECTS[path]}`);
    });

    // Strip tracking / behaviour attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name.toLowerCase();
        if (
          n.startsWith('data-') && n !== 'data-excat-section-id'
          || n.startsWith('on')
          || n === 'onetrust'
          || n === 'slave'
          || n === 'tabindex'
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Remove empty wrappers (deepest first). Never touch block tables, hr,
    // media, links or <sup> footnote markers.
    const candidates = [...element.querySelectorAll('div, span, section')].reverse();
    candidates.forEach((el) => {
      if (!el.isConnected) return;
      if (el.closest('table')) return;
      if (isEmptyWrapper(el)) el.remove();
    });

    // doc is referenced to keep the signature parity with other transformers.
    void doc;
  }
}
