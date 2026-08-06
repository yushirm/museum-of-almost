import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../dreaming-wing.js', import.meta.url), 'utf8');

class FakeClassList {
  constructor(element) {
    this.element = element;
  }

  values() {
    return new Set(this.element.className.split(/\s+/).filter(Boolean));
  }

  add(...names) {
    const values = this.values();
    names.forEach((name) => values.add(name));
    this.element.className = [...values].join(' ');
  }

  remove(...names) {
    const values = this.values();
    names.forEach((name) => values.delete(name));
    this.element.className = [...values].join(' ');
  }

  contains(name) {
    return this.values().has(name);
  }
}

function createContext() {
  const gradient = () => ({ addColorStop() {} });
  return {
    setTransform() {},
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    fillRect() {},
    save() {},
    restore() {},
    translate() {},
    beginPath() {},
    ellipse() {},
    stroke() {},
    moveTo() {},
    bezierCurveTo() {},
    arc() {},
    fill() {},
    drawImage() {},
    measureText(text) { return { width: text.length * 10 }; },
    fillText() {}
  };
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.id = '';
    this.className = '';
    this.classList = new FakeClassList(this);
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.descendantsById = new Map();
    this.dataset = {};
    this.style = { setProperty() {} };
    this.textContent = '';
    this.title = '';
    this.disabled = false;
    this.hidden = false;
    this.width = 0;
    this.height = 0;
    this._innerHTML = '';
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.descendantsById.clear();
    for (const match of value.matchAll(/id="([^"]+)"/g)) {
      const id = match[1];
      const element = new FakeElement(id.includes('canvas') ? 'canvas' : 'div');
      element.id = id;
      this.descendantsById.set(id, element);
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  insertBefore(node, reference) {
    const index = this.children.indexOf(reference);
    if (index < 0) this.children.push(node);
    else this.children.splice(index, 0, node);
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
  }

  querySelector(selector) {
    if (selector.startsWith('#')) return this.descendantsById.get(selector.slice(1)) || null;
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      const queue = [...this.children, ...this.descendantsById.values()];
      while (queue.length) {
        const element = queue.shift();
        if (element.classList.contains(className)) return element;
        queue.push(...element.children);
      }
    }
    return null;
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) listener(event);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  showModal() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
    this.dispatch('close');
  }

  getBoundingClientRect() {
    return { width: 800, height: 425, left: 0, top: 0 };
  }

  getContext() {
    return createContext();
  }

  toBlob(callback) {
    callback({ size: 1 });
  }
}

function runMuseum(fragments) {
  const fragmentCount = new FakeElement('span');
  fragmentCount.id = 'fragment-count';
  fragmentCount.textContent = String(fragments.length);

  const headerActions = new FakeElement('div');
  headerActions.className = 'header-actions';
  const catalogueButton = new FakeElement('button');
  catalogueButton.id = 'catalogue-button';
  headerActions.append(catalogueButton);

  const head = new FakeElement('head');
  const body = new FakeElement('body');
  const document = {
    head,
    body,
    querySelector(selector) {
      if (selector === '#fragment-count') return fragmentCount;
      if (selector === '.header-actions') return headerActions;
      if (selector === '#catalogue-button') return catalogueButton;
      return null;
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    }
  };

  const storedState = JSON.stringify({
    seed: 424242,
    cycle: 2,
    fragments
  });

  const sandbox = {
    console,
    document,
    localStorage: {
      getItem(key) {
        return key === 'museum-of-almost:v1' ? storedState : null;
      }
    },
    MutationObserver: class {
      observe() {}
    },
    performance: { now: () => 1000 },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    URL: {
      createObjectURL: () => 'blob:test',
      revokeObjectURL() {}
    },
    window: {
      matchMedia: () => ({ matches: false }),
      addEventListener() {},
      devicePixelRatio: 1
    },
    globalThis: null
  };
  sandbox.globalThis = sandbox;

  vm.runInNewContext(source, sandbox, { filename: 'dreaming-wing.js' });

  const dreamButton = headerActions.children.find((child) => child.id === 'dream-button');
  const dreamDialog = body.children.find((child) => child.id === 'dream-dialog');
  assert.ok(dreamButton, 'the Dreaming Wing button is added to the museum header');
  assert.ok(dreamDialog, 'the Dreaming Wing dialog is added locally');

  return { dreamButton, dreamDialog };
}

const fragments = [
  { text: 'a patient spark', source: 'The Lantern Lit by a Previous Evening' },
  { text: 'the hinge of an invisible door', source: 'The Key for a Door with No Hurry' },
  { text: 'weather from an indoor sky', source: 'The Umbrella for Indoor Rain' }
];

const locked = runMuseum(fragments.slice(0, 2));
assert.equal(locked.dreamButton.disabled, true, 'the Dreaming Wing remains locked before three fragments');
assert.match(locked.dreamButton.querySelector('.button-copy').textContent, /2\/3/, 'the lock explains progress');

function enterDream() {
  const museum = runMuseum(fragments);
  assert.equal(museum.dreamButton.disabled, false, 'three fragments unlock the Dreaming Wing');
  museum.dreamButton.dispatch('click');
  assert.equal(museum.dreamDialog.hasAttribute('open'), true, 'entering opens the Dreaming Wing');
  const title = museum.dreamDialog.querySelector('#dream-title').textContent;
  const prose = museum.dreamDialog.querySelector('#dream-prose').textContent;
  const lines = museum.dreamDialog.querySelector('#dream-lines').children.map((line) => line.textContent);
  const quote = museum.dreamDialog.querySelector('#dream-quote').textContent;
  const afterimage = museum.dreamDialog.querySelector('#dream-afterimage').textContent;
  return { museum, snapshot: { title, prose, lines, quote, afterimage } };
}

const first = enterDream();
const repeated = enterDream();
assert.deepEqual(first.snapshot, repeated.snapshot, 'the same local fragments and seed produce the same first dream');
assert.equal(first.snapshot.lines.length, 3, 'the dream is assembled from three fragment transformations');
for (const fragment of fragments) {
  const dreamText = JSON.stringify(first.snapshot).toLowerCase();
  assert.ok(dreamText.includes(fragment.text), `the dream remembers ${fragment.text}`);
}

const beforeDifferentDream = JSON.stringify(first.snapshot);
first.museum.dreamDialog.querySelector('#dream-again-button').dispatch('click');
const afterDifferentDream = JSON.stringify({
  title: first.museum.dreamDialog.querySelector('#dream-title').textContent,
  prose: first.museum.dreamDialog.querySelector('#dream-prose').textContent,
  lines: first.museum.dreamDialog.querySelector('#dream-lines').children.map((line) => line.textContent),
  quote: first.museum.dreamDialog.querySelector('#dream-quote').textContent,
  afterimage: first.museum.dreamDialog.querySelector('#dream-afterimage').textContent
});
assert.notEqual(afterDifferentDream, beforeDifferentDream, 'Dream differently produces a new deterministic variation');

console.log('Dreaming Wing unlock, local-fragment generation, determinism and variation tests passed.');
