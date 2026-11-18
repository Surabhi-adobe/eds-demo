// desktop layout (full horizontal nav) starts at 1200px; below that the compact header is used
const isDesktop = window.matchMedia('(width >= 1200px)');

const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools', 'contact'];

/**
 * Fetches the nav fragment. Local preview serves it under /content, Edge Delivery at the root.
 * Relative media paths are resolved against the fragment URL so they work on every page.
 * @returns {Promise<HTMLElement|null>} wrapper element holding the nav sections
 */
async function fetchNav() {
  // metadata-independent: /content first (local preview), then root (Edge Delivery)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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
 * Closes all open dropdowns and the search panel.
 * @param {Element} nav the nav element
 * @param {Element} [except] a toggle button to leave untouched
 */
function closePanels(nav, except = null) {
  nav.querySelectorAll('.nav-drop-toggle[aria-expanded="true"], .nav-search-toggle[aria-expanded="true"]')
    .forEach((button) => {
      if (button !== except) button.setAttribute('aria-expanded', 'false');
    });
  if (!except || !except.classList.contains('nav-search-toggle')) {
    nav.classList.remove('nav-search-open');
  }
}

/**
 * Opens or closes the compact (mobile/tablet) menu.
 * @param {Element} nav the nav element
 * @param {boolean} [force] explicit state; toggles when omitted
 */
function toggleMenu(nav, force) {
  const button = nav.querySelector('.nav-hamburger button');
  const wasOpen = nav.getAttribute('aria-expanded') === 'true';
  const open = force ?? !wasOpen;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open) closePanels(nav);
  if (open && !wasOpen) nav.querySelector('.nav-menu-close')?.focus();
  if (!open && wasOpen && !isDesktop.matches) button?.focus();
}

/**
 * Builds the head of the compact menu panel (logo, call to action, close button)
 * by reusing the authored brand link and call to action.
 * @param {Element} nav the nav element
 * @param {Element} sections the sections nav section
 */
function buildMenuHead(nav, sections) {
  const head = document.createElement('div');
  head.className = 'nav-sections-head';

  const brand = nav.querySelector('.nav-brand a');
  if (brand) {
    const brandClone = brand.cloneNode(true);
    brandClone.classList.add('nav-sections-brand');
    head.append(brandClone);
  }
  const cta = nav.querySelector('.nav-cta');
  if (cta) head.append(cta.cloneNode(true));

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-menu-close';
  close.setAttribute('aria-label', 'Close navigation');
  close.innerHTML = '<span class="nav-icon nav-icon-close" aria-hidden="true"></span>';
  close.addEventListener('click', () => toggleMenu(nav, false));
  head.append(close);

  sections.prepend(head);
}

/**
 * Builds a dropdown toggle for every top-level item that has a sub-list.
 * An italic label renders as an icon-only "more" menu, using the label as accessible name.
 * @param {Element} section the sections nav section
 * @param {Element} nav the nav element
 */
function decorateSections(section, nav) {
  const list = section.querySelector('ul');
  if (!list) return;
  list.classList.add('nav-drop-list');

  [...list.children].forEach((item, index) => {
    const panel = item.querySelector(':scope > ul');
    if (!panel) return;
    item.classList.add('nav-drop');

    const labelEl = item.querySelector(':scope > p') || item;
    const label = labelEl.textContent.trim();
    const iconOnly = !!labelEl.querySelector('em');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-drop-toggle';
    button.setAttribute('aria-expanded', 'false');
    panel.id = `nav-drop-panel-${index}`;
    panel.classList.add('nav-drop-panel');
    button.setAttribute('aria-controls', panel.id);

    if (iconOnly) {
      item.classList.add('nav-drop-icon');
      button.setAttribute('aria-label', label);
      const icon = document.createElement('span');
      icon.className = 'nav-icon nav-icon-menu';
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.className = 'nav-drop-label';
      text.textContent = label;
      button.append(icon, text);
    } else {
      button.textContent = label;
    }

    if (labelEl !== item) labelEl.replaceWith(button);
    else item.prepend(button);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      closePanels(nav, button);
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });
}

/**
 * Builds the search toggle and panel from the authored search link.
 * The query is appended to the end of the authored link URL.
 * @param {HTMLAnchorElement} link authored search link
 * @param {Element} nav the nav element
 */
function decorateSearch(link, nav) {
  const label = link.textContent.trim() || 'Search';
  const action = link.href;
  const item = link.closest('li') || link.parentElement;
  item.classList.add('nav-search');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', `site ${label.toLowerCase()}`);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-search-panel');
  toggle.innerHTML = '<span class="nav-icon nav-icon-search" aria-hidden="true"></span>';
  link.replaceWith(toggle);

  const panel = document.createElement('div');
  panel.className = 'nav-search-panel';
  panel.id = 'nav-search-panel';

  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.className = 'nav-search-form';

  const field = document.createElement('div');
  field.className = 'nav-search-field';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'nav-search-input';
  input.name = 'navSearch';
  input.autocomplete = 'off';
  input.placeholder = ' ';
  const inputLabel = document.createElement('label');
  inputLabel.htmlFor = input.id;
  inputLabel.textContent = label;
  field.append(input, inputLabel);
  form.append(field);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', `Close ${label.toLowerCase()}`);
  close.innerHTML = '<span class="nav-icon nav-icon-close" aria-hidden="true"></span>';

  panel.append(form, close);
  nav.append(panel);

  const setOpen = (open) => {
    closePanels(nav, toggle);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('nav-search-open', open);
    if (open) input.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  close.addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    window.location.href = `${action}${encodeURIComponent(query)}`;
  });
}

/**
 * Decorates the tools section: search link becomes a search toggle, bold link becomes the CTA.
 * @param {Element} section the tools nav section
 * @param {Element} nav the nav element
 */
function decorateTools(section, nav) {
  section.querySelectorAll('strong > a, b > a').forEach((cta) => {
    cta.classList.add('nav-cta');
    cta.parentElement.replaceWith(cta);
  });
  const searchLink = [...section.querySelectorAll('a')]
    .find((a) => /search/i.test(a.pathname) || /^search$/i.test(a.textContent.trim()));
  if (searchLink) decorateSearch(searchLink, nav);
}

/**
 * Decorates the utility bar: the bold item marks the current audience.
 * @param {Element} section the utility nav section
 */
function decorateUtility(section) {
  section.querySelectorAll('li').forEach((li) => {
    const strong = li.querySelector('strong, b');
    if (!strong) return;
    li.classList.add('active');
    const link = strong.querySelector('a');
    if (link) {
      link.setAttribute('aria-current', 'true');
      strong.replaceWith(link);
    }
  });
}

/**
 * Decorates the contact/share row. Share links get the current page URL appended.
 * @param {Element} section the contact nav section
 */
function decorateContact(section) {
  section.querySelectorAll('p').forEach((p) => {
    if (p.querySelector('img')) p.classList.add('nav-contact-item');
    else p.classList.add('nav-contact-text');
  });
  const shareList = section.querySelector('ul');
  if (!shareList) return;
  shareList.classList.add('nav-share-links');
  const pageUrl = encodeURIComponent(window.location.href);
  shareList.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('mailto:')) {
      a.href = `${href}${href.endsWith('?') ? '' : '&'}body=${pageUrl}`;
    } else {
      if (href.endsWith('=')) a.href = `${href}${pageUrl}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    const img = a.querySelector('img');
    if (img && img.alt) a.setAttribute('aria-label', img.alt);
    if (img) img.alt = '';
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  [...fragment.children].forEach((section, i) => {
    if (SECTION_NAMES[i]) section.classList.add(`nav-${SECTION_NAMES[i]}`);
    nav.append(section);
  });

  const utility = nav.querySelector('.nav-utility');
  if (utility) decorateUtility(utility);

  const sections = nav.querySelector('.nav-sections');
  if (sections) decorateSections(sections, nav);

  const tools = nav.querySelector('.nav-tools');
  if (tools) decorateTools(tools, nav);

  const contact = nav.querySelector('.nav-contact');
  if (contact) decorateContact(contact);

  // compact-header menu toggle
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false">
      <span class="nav-icon nav-icon-menu" aria-hidden="true"></span><span class="nav-hamburger-label">Menu</span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  if (sections) buildMenuHead(nav, sections);

  // close panels on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closePanels(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-drop-toggle[aria-expanded="true"], .nav-search-toggle[aria-expanded="true"]');
    if (open) {
      closePanels(nav);
      open.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closePanels(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
