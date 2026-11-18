/* eslint-disable */
/* global WebImporter */

import carouselTabsParser from './parsers/carousel-tabs.js';
import promoParser from './parsers/promo.js';
import columnsParser from './parsers/columns.js';
import cardsIconsParser from './parsers/cards-icons.js';
import statsParser from './parsers/stats.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cleanupTransformer from './transformers/jackson-cleanup.js';
import sectionsTransformer from './transformers/jackson-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.jackson.com/"
  ],
  "representativeUrl": "https://www.jackson.com/",
  "description": "Jackson.com homepage: tabbed hero carousel, promo, columns, icon cards, stats, feature cards and disclosures",
  "blocks": [
    {
      "name": "carousel-tabs",
      "instances": [
        ".hero-space"
      ]
    },
    {
      "name": "promo",
      "instances": [
        ".background-container:has(.spotlight)",
        ".spotlight"
      ]
    },
    {
      "name": "columns",
      "instances": [
        ".comparison-highlight-layout"
      ]
    },
    {
      "name": "cards-icons",
      "instances": [
        ".cta-icon-card-wrapper"
      ]
    },
    {
      "name": "stats",
      "instances": [
        ".stat-spotlight"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".promo-card-wrapper"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero tabbed carousel",
      "selector": [
        ".hero-space"
      ],
      "style": null,
      "blocks": [
        "carousel-tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Financial professional spotlight",
      "selector": [
        ".background-container:has(.spotlight)"
      ],
      "style": null,
      "blocks": [
        "promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Can an annuity help you reach your goals?",
      "selector": [
        ".background-container:has(.comparison-highlight-layout)"
      ],
      "style": "light",
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Annuity disclosure",
      "selector": [
        "div.disclosure:nth-of-type(5)"
      ],
      "style": "disclosure",
      "blocks": [],
      "defaultContent": [
        "div.disclosure:nth-of-type(5)"
      ]
    },
    {
      "id": "section-5",
      "name": "Retirement planning resources",
      "selector": [
        ".layout-container:has(.cta-icon-card)"
      ],
      "style": "centered",
      "blocks": [
        "cards-icons"
      ],
      "defaultContent": [
        ".layout-container:has(.cta-icon-card) > .content-area > h3"
      ]
    },
    {
      "id": "section-6",
      "name": "The Jackson difference",
      "selector": [
        ".background-container:has(.stat-spotlight)"
      ],
      "style": "grey",
      "blocks": [
        "stats"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Additional resources",
      "selector": [
        ".layout-container:has(.promo-card)"
      ],
      "style": "centered",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": [
        ".layout-container:has(.promo-card) > .content-area > h3"
      ]
    },
    {
      "id": "section-8",
      "name": "Footnotes",
      "selector": [
        "div.disclosure:nth-of-type(9)"
      ],
      "style": "footnotes",
      "blocks": [],
      "defaultContent": [
        "div.disclosure:nth-of-type(9)"
      ]
    },
    {
      "id": "section-9",
      "name": "Investment disclosure",
      "selector": [
        "div.disclosure:nth-of-type(10)"
      ],
      "style": "disclosure, separator",
      "blocks": [],
      "defaultContent": [
        "div.disclosure:nth-of-type(10)"
      ]
    }
  ]
};

const parsers = {
  'carousel-tabs': carouselTabsParser,
  'promo': promoParser,
  'columns': columnsParser,
  'cards-icons': cardsIconsParser,
  'stats': statsParser,
  'cards-feature': cardsFeatureParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      // skip instances whose element was already replaced (e.g. a second selector of the same block)
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
