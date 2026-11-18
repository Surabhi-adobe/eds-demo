/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-tabs.js
  var ORIGIN = "https://www.jackson.com";
  function absUrl(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function imgSrc(img) {
    const src = img.getAttribute("src") || "";
    if (src && !src.startsWith("data:")) return src;
    return img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || src;
  }
  function makeImage(document2, srcImg) {
    if (!srcImg) return null;
    const img = document2.createElement("img");
    img.src = absUrl(imgSrc(srcImg));
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function unwrapSpans(root) {
    root.querySelectorAll("span").forEach((span) => {
      span.replaceWith(...span.childNodes);
    });
    return root;
  }
  function buildSlideContent(document2, panel, index) {
    const copy = panel.querySelector(":scope > .wide") || panel.querySelector(":scope > .narrow") || panel;
    const content = [];
    const headline = copy.querySelector(".headline, h1, h2");
    const headingText = cleanText(headline ? headline.textContent : "");
    if (headingText) {
      const heading = document2.createElement(index === 0 ? "h1" : "h2");
      heading.textContent = headingText;
      content.push(heading);
    }
    copy.querySelectorAll(".description p").forEach((p) => {
      if (!cleanText(p.textContent)) return;
      const para = document2.createElement("p");
      para.innerHTML = p.innerHTML;
      unwrapSpans(para);
      content.push(para);
    });
    const cta = copy.querySelector(".action a[href]");
    if (cta && cleanText(cta.textContent)) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const em = document2.createElement("em");
      const a = document2.createElement("a");
      a.href = absUrl(cta.getAttribute("href"));
      a.textContent = cleanText(cta.textContent);
      em.append(a);
      strong.append(em);
      p.append(strong);
      content.push(p);
    }
    return content;
  }
  function parse(element, { document: document2 }) {
    const bgImg = element.querySelector(".background img");
    const panels = [...element.querySelectorAll(".tab-content")];
    const tabItems = [...element.querySelectorAll(".tab-container li")];
    const cells = [];
    panels.forEach((panel, index) => {
      const content = buildSlideContent(document2, panel, index);
      if (!content.length) return;
      const id = panel.getAttribute("id");
      const tab = id && tabItems.find((li) => li.getAttribute("id") === id) || tabItems[index];
      const label = cleanText(tab ? tab.textContent : "");
      const image = makeImage(document2, bgImg);
      cells.push([image || "", content, label]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Carousel (tabs)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo.js
  var ORIGIN2 = "https://www.jackson.com";
  function absUrl2(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN2}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN2}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN2}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText2(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function urlFromCss(value) {
    if (!value || value === "none") return "";
    const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
    return m ? m[2] : "";
  }
  function bgFromStyle(el) {
    if (!el) return "";
    const inline = urlFromCss(el.getAttribute("style") || "");
    if (inline) return inline;
    try {
      const view = el.ownerDocument && el.ownerDocument.defaultView;
      if (view && view.getComputedStyle) {
        const computed = urlFromCss(view.getComputedStyle(el).backgroundImage);
        if (computed) return computed;
      }
    } catch (e) {
    }
    return "";
  }
  function bgFromStylesheets(document2, el) {
    if (!el) return "";
    const bgClass = [...el.classList].find((c) => c.startsWith("bg-image-"));
    if (!bgClass) return "";
    const texts = [...document2.querySelectorAll("style")].map((s) => s.textContent || "");
    for (let i = 0; i < texts.length; i += 1) {
      const re = new RegExp(`\\.${bgClass}[^{]*\\{[^}]*background(?:-image)?\\s*:[^;}]*url\\(\\s*(['"]?)(.*?)\\1\\s*\\)`, "i");
      const m = texts[i].match(re);
      if (m) return m[2];
    }
    try {
      const sheets = [...document2.styleSheets || []];
      for (let i = 0; i < sheets.length; i += 1) {
        let rules = [];
        try {
          rules = [...sheets[i].cssRules];
        } catch (e) {
          rules = [];
        }
        for (let j = 0; j < rules.length; j += 1) {
          const r = rules[j];
          if (r.selectorText && r.selectorText.includes(`.${bgClass}`) && r.style) {
            const u = urlFromCss(r.style.backgroundImage || r.style.background);
            if (u) return u;
          }
        }
      }
    } catch (e) {
    }
    return "";
  }
  function findBackgroundImage(document2, root) {
    const contents = root.querySelector(".contents") || root.closest(".contents");
    const spotlight = root.matches(".spotlight") ? root : root.querySelector(".spotlight");
    const candidates = [contents, spotlight, spotlight && spotlight.querySelector(".spotlight-wrapper")].filter(Boolean);
    for (let i = 0; i < candidates.length; i += 1) {
      const url = bgFromStyle(candidates[i]) || bgFromStylesheets(document2, candidates[i]);
      if (url) return { src: url, alt: "" };
    }
    const imgs = contents ? [...contents.querySelectorAll("img")] : [];
    const img = imgs.find((i) => !i.closest(".spotlight-wrapper .header, .spotlight-wrapper .action"));
    if (img) {
      const src = img.getAttribute("src") && !img.getAttribute("src").startsWith("data:") ? img.getAttribute("src") : img.getAttribute("data-src") || img.getAttribute("src");
      return { src, alt: img.getAttribute("alt") || "" };
    }
    return null;
  }
  function parse2(element, { document: document2 }) {
    const container = element.matches(".spotlight") ? element.closest(".background-container") || element : element;
    const cells = [];
    const bg = findBackgroundImage(document2, container);
    if (bg && bg.src) {
      const img = document2.createElement("img");
      img.src = absUrl2(bg.src);
      img.alt = bg.alt || "";
      cells.push([img]);
    }
    const content = [];
    const wrapper = container.querySelector(".spotlight-wrapper") || container;
    const headingEl = wrapper.querySelector(".title h2, .title h1, .title h3, h2");
    if (headingEl && cleanText2(headingEl.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = cleanText2(headingEl.textContent);
      content.push(h2);
    }
    wrapper.querySelectorAll(".header p").forEach((p) => {
      if (!cleanText2(p.textContent)) return;
      const para = document2.createElement("p");
      para.innerHTML = p.innerHTML;
      para.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
      content.push(para);
    });
    const cta = wrapper.querySelector(".action a[href]");
    if (cta && cleanText2(cta.textContent)) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = absUrl2(cta.getAttribute("href"));
      a.textContent = cleanText2(cta.textContent);
      strong.append(a);
      p.append(strong);
      content.push(p);
    }
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "Promo", cells });
    container.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  var ORIGIN3 = "https://www.jackson.com";
  function absUrl3(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN3}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN3}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN3}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText3(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function makeImage2(document2, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("src") || "";
    const img = document2.createElement("img");
    img.src = absUrl3(src && !src.startsWith("data:") ? src : srcImg.getAttribute("data-src") || src);
    img.alt = cleanText3(srcImg.getAttribute("alt") || "");
    return img;
  }
  function tidy(el) {
    el.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
    el.querySelectorAll("i, em, b, strong").forEach((n) => {
      if (!n.querySelector("img, a, sup") && !cleanText3(n.textContent)) {
        n.replaceWith(n.ownerDocument.createTextNode(n.textContent ? " " : ""));
      }
    });
    el.querySelectorAll("li, p").forEach((n) => {
      while (n.lastChild && (n.lastChild.nodeType === 1 && n.lastChild.tagName === "BR" || n.lastChild.nodeType === 3 && !n.lastChild.textContent.trim())) {
        n.lastChild.remove();
      }
    });
    return el;
  }
  function parse3(element, { document: document2 }) {
    const main = element.querySelector(".main-content") || element;
    const secondary = element.querySelector(".secondary-content");
    const textCell = [];
    const headingEl = main.querySelector(".title h2, .title h1, .title h3, h2");
    if (headingEl && cleanText3(headingEl.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = cleanText3(headingEl.textContent);
      textCell.push(h2);
    }
    const description = main.querySelector(".description");
    if (description) {
      [...description.children].forEach((child) => {
        const tag = child.tagName;
        if (!["P", "UL", "OL"].includes(tag)) return;
        if (!cleanText3(child.textContent)) return;
        textCell.push(tidy(child.cloneNode(true)));
      });
    }
    main.querySelectorAll(".small-links a[href]").forEach((cta) => {
      if (!cleanText3(cta.textContent)) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const em = document2.createElement("em");
      const a = document2.createElement("a");
      a.href = absUrl3(cta.getAttribute("href"));
      a.textContent = cleanText3(cta.textContent);
      em.append(a);
      strong.append(em);
      p.append(strong);
      textCell.push(p);
    });
    const imgEl = (secondary || element).querySelector("img");
    const image = makeImage2(document2, imgEl);
    const cells = [[textCell, image ? [image] : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icons.js
  var ORIGIN4 = "https://www.jackson.com";
  function absUrl4(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN4}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN4}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN4}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText4(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function makeImage3(document2, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("src") || "";
    const img = document2.createElement("img");
    img.src = absUrl4(src && !src.startsWith("data:") ? src : srcImg.getAttribute("data-src") || src);
    img.alt = cleanText4(srcImg.getAttribute("alt") || "");
    return img;
  }
  function parse4(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".cta-icon-card-block")];
    const cells = [];
    cards.forEach((card) => {
      const image = makeImage3(document2, card.querySelector(".icon-image img"));
      const body = [];
      const titleEl = card.querySelector(".card-content .title");
      const title = cleanText4(titleEl ? titleEl.textContent : "");
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      card.querySelectorAll(".card-content .description p").forEach((p) => {
        if (!cleanText4(p.textContent)) return;
        const para = document2.createElement("p");
        para.innerHTML = p.innerHTML;
        para.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
        body.push(para);
      });
      const cta = card.querySelector(".card-content .cta-arrow-button-wrapper a[href], .card-content a.cta-arrow-button[href]");
      if (cta && cleanText4(cta.textContent)) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const em = document2.createElement("em");
        const a = document2.createElement("a");
        a.href = absUrl4(cta.getAttribute("href"));
        a.textContent = cleanText4(cta.textContent);
        em.append(a);
        strong.append(em);
        p.append(strong);
        body.push(p);
      }
      if (!image && !body.length) return;
      cells.push([image ? [image] : "", body]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (icons)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/stats.js
  var ORIGIN5 = "https://www.jackson.com";
  function absUrl5(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN5}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN5}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN5}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText5(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function inlineContent(document2, el) {
    const holder = document2.createElement("div");
    holder.innerHTML = el.innerHTML;
    holder.querySelectorAll("sup").forEach((s) => {
      if (!cleanText5(s.textContent)) s.remove();
    });
    holder.querySelectorAll("span, b, font").forEach((s) => s.replaceWith(...s.childNodes));
    const walker = document2.createTreeWalker(holder, 4);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/[ \t\r\n]+/g, " ");
    });
    holder.innerHTML = holder.innerHTML.trim();
    return [...holder.childNodes];
  }
  function linkPara(document2, src, wrappers) {
    const p = document2.createElement("p");
    let parent = p;
    wrappers.forEach((tag) => {
      const w = document2.createElement(tag);
      parent.append(w);
      parent = w;
    });
    const a = document2.createElement("a");
    a.href = absUrl5(src.getAttribute("href"));
    a.textContent = cleanText5(src.textContent);
    parent.append(a);
    return p;
  }
  function parse5(element, { document: document2 }) {
    const cells = [];
    const intro = [];
    const content = element.querySelector(".stat-spotlight-content") || element;
    const headingEl = content.querySelector("h2, h1, h3");
    if (headingEl && cleanText5(headingEl.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = cleanText5(headingEl.textContent);
      intro.push(h2);
    }
    content.querySelectorAll(".description p").forEach((p) => {
      if (!cleanText5(p.textContent)) return;
      const para = document2.createElement("p");
      para.append(...inlineContent(document2, p));
      intro.push(para);
    });
    content.querySelectorAll(".action a[href]").forEach((a) => {
      if (!cleanText5(a.textContent)) return;
      const secondary = a.classList.contains("secondary-cta-button");
      intro.push(linkPara(document2, a, secondary ? ["em"] : ["strong"]));
    });
    if (intro.length) cells.push([intro]);
    const statsContainer = element.querySelector(".stats-container");
    if (statsContainer) {
      const parts = [...statsContainer.querySelectorAll(".stat-header, .stat-description")];
      let current = null;
      const pairs = [];
      parts.forEach((part) => {
        if (part.classList.contains("stat-header")) {
          current = { value: part, label: null };
          pairs.push(current);
        } else if (current && !current.label) {
          current.label = part;
        }
      });
      pairs.forEach(({ value, label }) => {
        const valueText = cleanText5(value.textContent);
        if (!valueText) return;
        const labelSrc = label ? label.querySelector("p") || label : null;
        const labelNodes = labelSrc ? inlineContent(document2, labelSrc) : [];
        cells.push([valueText, labelNodes.length ? labelNodes : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  var ORIGIN6 = "https://www.jackson.com";
  function absUrl6(value) {
    if (!value) return "";
    const raw = value.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      const url = new URL(raw, `${ORIGIN6}/`);
      if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
        url.searchParams.delete("host");
        return `${ORIGIN6}${url.pathname}${url.search}${url.hash}`;
      }
      if (/(^|\.)jackson\.com$/i.test(url.hostname)) return `${ORIGIN6}${url.pathname}${url.search}${url.hash}`;
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function cleanText6(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function makeImage4(document2, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("src") || "";
    const img = document2.createElement("img");
    img.src = absUrl6(src && !src.startsWith("data:") ? src : srcImg.getAttribute("data-src") || src);
    img.alt = cleanText6(srcImg.getAttribute("alt") || "");
    return img;
  }
  function parse6(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".promo-card-block")];
    const cells = [];
    cards.forEach((card) => {
      const image = makeImage4(document2, card.querySelector(".promo-image img"));
      const body = [];
      const titleEl = card.querySelector(".card-content .title");
      const title = cleanText6(titleEl ? titleEl.textContent : "");
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      card.querySelectorAll(".card-content .description p").forEach((p) => {
        if (!cleanText6(p.textContent)) return;
        const para = document2.createElement("p");
        para.innerHTML = p.innerHTML;
        para.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
        body.push(para);
      });
      const cta = card.querySelector(".card-content .action a[href]");
      if (cta && cleanText6(cta.textContent)) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.href = absUrl6(cta.getAttribute("href"));
        a.textContent = cleanText6(cta.textContent);
        strong.append(a);
        p.append(strong);
        body.push(p);
      }
      if (!image && !body.length) return;
      cells.push([image ? [image] : "", body]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (feature)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/jackson-cleanup.js
  var ORIGIN7 = "https://www.jackson.com";
  var REDIRECTS = {
    "/the-jackson-difference/environmental-social-governance.html": "/the-jackson-difference/corporate-responsibility.html"
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
    if (el.querySelector("img, picture, video, iframe, table, hr, a, sup, svg")) return false;
    return el.textContent.replace(/ /g, " ").trim() === "";
  }
  function transform(hookName, element, payload) {
    const doc = element.ownerDocument || payload && payload.document || document;
    if (hookName === "beforeTransform") {
      doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
        const value = meta.getAttribute("content") || "";
        const fixed = value.replace(/^(https:\/\/www\.jackson\.com)?\/graphics\//, `${ORIGIN7}/content/dam/jacksoncom/graphics/`);
        if (fixed !== value) meta.setAttribute("content", fixed);
      });
      element.querySelectorAll(".masthead, .masthead__wrapper").forEach((mh) => {
        const xf = mh.closest(".experiencefragment");
        (xf || mh).remove();
      });
      element.querySelectorAll(".global-footer-wrapper, .global-footer, footer").forEach((ft) => {
        if (!ft.isConnected) return;
        const xf = ft.closest(".experiencefragment");
        (xf || ft).remove();
      });
      removeAll(element, [
        // Profile toggle bar
        ".toggle-container",
        // Navigation leftovers (desktop + mobile) outside the masthead
        ".fragment-navigation",
        ".contact-us-secondary-nav-area",
        // Consent manager (OneTrust)
        "#onetrust-consent-sdk",
        '[id^="onetrust-"]',
        '[class*="onetrust"]',
        '[id^="ot-sdk"]',
        // Qualtrics feedback
        ".QSIFeedbackButton",
        '[id^="QSIFeedbackButton"]',
        '[class*="QSI"]',
        '[id^="ZN_"]',
        // Session timeout modal + overlay mask
        ".session-timeout-panel",
        "#background-mask",
        // Tracking beacons / sync frames
        '[id^="batBeacon"]',
        '[id^="destination_publishing_iframe"]',
        // Non-content elements
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll(".hidden, .ot-hide").forEach((el) => {
        if (el.closest(".hero-space")) return;
        el.remove();
      });
      element.querySelectorAll(".experiencefragment").forEach((xf) => {
        if (isEmptyWrapper(xf)) xf.remove();
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        "form",
        "select",
        "button",
        ".promo-area",
        "#onetrust-consent-sdk",
        '[class*="QSI"]'
      ]);
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href").trim();
        if (!href || href === "/") return;
        if (href.startsWith("//")) {
          a.setAttribute("href", `https:${href}`);
          return;
        }
        if (href.startsWith("/")) {
          a.setAttribute("href", `${ORIGIN7}${href}`);
          return;
        }
        const m = href.match(/^https?:\/\/(www\.)?jackson\.com(\/.*)?$/i);
        if (m) {
          const path = m[2] || "/";
          a.setAttribute("href", path === "/" ? "/" : `${ORIGIN7}${path}`);
        }
      });
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        const path = href.startsWith(ORIGIN7) ? href.slice(ORIGIN7.length) : null;
        if (path && REDIRECTS[path]) a.setAttribute("href", `${ORIGIN7}${REDIRECTS[path]}`);
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name.toLowerCase();
          if (n.startsWith("data-") && n !== "data-excat-section-id" || n.startsWith("on") || n === "onetrust" || n === "slave" || n === "tabindex") {
            el.removeAttribute(attr.name);
          }
        });
      });
      const candidates = [...element.querySelectorAll("div, span, section")].reverse();
      candidates.forEach((el) => {
        if (!el.isConnected) return;
        if (el.closest("table")) return;
        if (isEmptyWrapper(el)) el.remove();
      });
      void doc;
    }
  }

  // tools/importer/transformers/jackson-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload && payload.document || document;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => findSectionElement(element, section));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el) continue;
        const isFirst = i === 0;
        if (isFirst && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (isFirst) hr.setAttribute("data-excat-first-section", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!marker) continue;
        let end = marker.nextElementSibling;
        while (end && end.tagName !== "HR") end = end.nextElementSibling;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (end) {
          end.parentNode.insertBefore(metadata, end);
        } else {
          marker.parentNode.appendChild(metadata);
        }
        if (marker.hasAttribute("data-excat-first-section")) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-tabs": parse,
    "promo": parse2,
    "columns": parse3,
    "cards-icons": parse4,
    "stats": parse5,
    "cards-feature": parse6
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_home_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_home_exports);
})();
