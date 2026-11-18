const INTRO_SELECTOR = 'h1, h2, h3, a.button, p.button-wrapper';

/**
 * Non-empty cells of a row.
 * @param {Element} row
 */
function cellsOf(row) {
  return [...row.children].filter((cell) => cell.textContent.trim() || cell.querySelector('img'));
}

/**
 * A row is intro content when it holds a section-level heading or a button,
 * or when it is the first row and is not a plain value | label pair.
 * @param {Element} row
 * @param {number} index
 */
function isIntroRow(row, index) {
  const cells = cellsOf(row);
  if (row.querySelector(INTRO_SELECTOR)) return true;
  return index === 0 && cells.length === 1 && cells[0].children.length > 2;
}

/**
 * Moves the children (or the text) of an element into a new element.
 * @param {string} className
 * @param {Node[]} nodes
 */
function wrap(className, nodes) {
  const el = document.createElement('p');
  el.className = className;
  nodes.forEach((node) => {
    // unwrap block-level elements (p, h4, ...) so the result stays one paragraph
    if (node.nodeType === Node.ELEMENT_NODE && /^(P|H[1-6]|DIV)$/.test(node.tagName)) {
      if (el.childNodes.length) el.append(document.createElement('br'));
      el.append(...node.childNodes);
    } else {
      el.append(node);
    }
  });
  return el;
}

/**
 * Splits one stat row into its value and label nodes.
 * @param {Element} row
 * @returns {{value: Node[], label: Node[]}|null}
 */
function readStat(row) {
  const cells = cellsOf(row);
  if (!cells.length) return null;
  if (cells.length >= 2) {
    return {
      value: [...cells[0].childNodes],
      label: cells.slice(1).flatMap((c) => [...c.childNodes]),
    };
  }
  // single cell: heading/strong (or first element) is the value, the rest the label
  const cell = cells[0];
  const elements = [...cell.children];
  if (!elements.length) return { value: [...cell.childNodes], label: [] };
  const valueEl = elements.find((el) => /^H[1-6]$/.test(el.tagName)) || elements[0];
  return {
    value: [valueEl],
    label: [...cell.childNodes].filter((n) => n !== valueEl
      && (n.nodeType !== Node.TEXT_NODE || n.textContent.trim())),
  };
}

/**
 * Groups consecutive button paragraphs so they can sit side by side.
 * @param {Element} intro
 */
function groupButtons(intro) {
  let group = null;
  [...intro.children].forEach((el) => {
    if (el.matches('p.button-wrapper')) {
      if (!group) {
        group = document.createElement('div');
        group.className = 'stats-actions';
        el.before(group);
      }
      group.append(el);
    } else {
      group = null;
    }
  });
}

export default function decorate(block) {
  const intro = document.createElement('div');
  intro.className = 'stats-intro';
  const list = document.createElement('ul');
  list.className = 'stats-list';

  [...block.children].forEach((row, index) => {
    if (isIntroRow(row, index)) {
      cellsOf(row).forEach((cell) => intro.append(...cell.childNodes));
      return;
    }
    const stat = readStat(row);
    if (!stat) return;
    const li = document.createElement('li');
    li.append(wrap('stats-value', stat.value));
    if (stat.label.length) li.append(wrap('stats-label', stat.label));
    list.append(li);
  });

  groupButtons(intro);
  const children = [];
  if (intro.children.length) children.push(intro);
  if (list.children.length) children.push(list);
  block.replaceChildren(...children);
}
