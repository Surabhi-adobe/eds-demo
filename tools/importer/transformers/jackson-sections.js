/* eslint-disable */
/* global WebImporter */

/**
 * Jackson sections transformer.
 *
 * beforeTransform: while the original section elements still exist, insert an
 * <hr> before every non-first section. Styled sections get a temporary
 * data-excat-section-id marker on their <hr>; a styled first section gets a
 * temporary marked <hr> that is removed again in afterTransform.
 *
 * afterTransform: for each styled section, append a Section Metadata block at
 * the end of the section (before the next section break), then clean markers.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this environment; try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || (payload && payload.document) || document;

  if (hookName === 'beforeTransform') {
    // Resolve all section elements first so inserted <hr>s never affect matching.
    const resolved = sections.map((section) => findSectionElement(element, section));

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = resolved[i];
      if (!el) continue;
      const isFirst = i === 0;
      if (isFirst && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (isFirst) hr.setAttribute('data-excat-first-section', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;

      // Section ends right before the next <hr> sibling (or at the parent's end).
      let end = marker.nextElementSibling;
      while (end && end.tagName !== 'HR') end = end.nextElementSibling;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (end) {
        end.parentNode.insertBefore(metadata, end);
      } else {
        marker.parentNode.appendChild(metadata);
      }

      if (marker.hasAttribute('data-excat-first-section')) {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    }
  }
}
