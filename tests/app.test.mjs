import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAutoCorrectToCurrentWord,
  bootstrapApp,
  computeSuggestionsForState,
  createKeyboardActions,
  handleSuggestionSelection,
  renderApp,
} from '../js/app.js';
import { createStateStore } from '../js/state.js';

function createMockStore(overrides = {}) {
  const state = {
    text: 'teh',
    cursor: 3,
    mode: 'letters',
    currentWordRange: { start: 0, end: 3 },
    ...overrides,
  };
  const calls = [];

  return {
    calls,
    getState() {
      return state;
    },
    applySuggestion(value) {
      calls.push(['applySuggestion', value]);
      const { start, end } = state.currentWordRange;
      state.text = `${state.text.slice(0, start)}${value}${state.text.slice(end)}`;
      state.cursor = start + value.length;
      state.currentWordRange = { start, end: state.cursor };
    },
    insertSpace() {
      calls.push(['insertSpace']);
    },
    insertReturn() {
      calls.push(['insertReturn']);
    },
    insertChar(value) {
      calls.push(['insertChar', value]);
    },
    deleteBackward() {
      calls.push(['deleteBackward']);
    },
    toggleShift() {
      calls.push(['toggleShift']);
    },
    setCapsLock(value) {
      calls.push(['setCapsLock', value]);
    },
    switchMode(value) {
      calls.push(['switchMode', value]);
      state.mode = value;
    },
  };
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this._textContent = '';
    this._innerHTML = '';
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.id = '';
    this.type = '';
    this._listeners = new Map();
    this.classList = {
      add: (...classes) => {
        const tokens = new Set(this.className.split(/\s+/).filter(Boolean));
        for (const className of classes) {
          tokens.add(className);
        }
        this.className = [...tokens].join(' ');
      },
    };
  }

  set textContent(value) {
    this._textContent = value == null ? '' : String(value);
    this.children = [];
    this._innerHTML = '';
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map((child) => child.textContent).join('');
    }
    return this._textContent;
  }

  set innerHTML(value) {
    this._innerHTML = value == null ? '' : String(value);
    this.children = [];
    this._textContent = '';
  }

  get innerHTML() {
    return this._innerHTML;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this._textContent = '';
    return child;
  }

  addEventListener(type, handler) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type).push(handler);
  }

  click() {
    const handlers = this._listeners.get('click') || [];
    for (const handler of handlers) {
      handler({ currentTarget: this, target: this });
    }
  }
}

class FakeDocument {
  constructor() {
    this.elementsById = new Map();
  }

  registerElement(id, element) {
    element.id = id;
    this.elementsById.set(id, element);
    return element;
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }
}

function createAppDomFixture() {
  const doc = new FakeDocument();
  const display = doc.registerElement('display-text', new FakeElement('pre'));
  const suggestionsRail = doc.registerElement('suggestions-rail', new FakeElement('section'));
  const keyboardRoot = doc.registerElement('keyboard-root', new FakeElement('div'));
  return { doc, display, suggestionsRail, keyboardRoot };
}

function getChildText(element) {
  return element.children.map((child) => child.textContent);
}

function runWithGlobalDocument(doc, callback) {
  const hadDocument = Object.prototype.hasOwnProperty.call(globalThis, 'document');
  const previousDocument = globalThis.document;
  globalThis.document = doc;
  try {
    return callback();
  } finally {
    if (hadDocument) {
      globalThis.document = previousDocument;
    } else {
      delete globalThis.document;
    }
  }
}

test('computeSuggestionsForState uses the current token range', () => {
  const state = {
    text: 'say helo',
    currentWordRange: { start: 4, end: 8 },
  };

  const suggestions = computeSuggestionsForState(
    state,
    (token) => (token === 'helo' ? ['hello', 'help', 'helm'] : [])
  );

  assert.deepEqual(suggestions, ['hello', 'help', 'helm']);
});

test('applyAutoCorrectToCurrentWord applies aggressive replacement when changed', () => {
  const store = createMockStore();

  const corrected = applyAutoCorrectToCurrentWord(
    store,
    (token) => (token === 'teh' ? 'the' : token)
  );

  assert.equal(corrected, 'the');
  assert.deepEqual(store.calls, [['applySuggestion', 'the']]);
});

test('applyAutoCorrectToCurrentWord does nothing when suggestion is unchanged', () => {
  const store = createMockStore({ text: 'the', currentWordRange: { start: 0, end: 3 } });

  const corrected = applyAutoCorrectToCurrentWord(store, (token) => token);

  assert.equal(corrected, null);
  assert.deepEqual(store.calls, []);
});

test('createKeyboardActions runs autocorrect before inserting a space', () => {
  const store = createMockStore();
  const actions = createKeyboardActions(store, () => 'the');

  actions.insertSpace();

  assert.deepEqual(store.calls, [['applySuggestion', 'the'], ['insertSpace']]);
});

test('createKeyboardActions handles mode switching and return with autocorrect', () => {
  const store = createMockStore({ mode: 'numbers' });
  const actions = createKeyboardActions(store, () => 'the');

  actions.toggleSymbols();
  actions.toggleSymbols();
  actions.insertReturn();

  assert.deepEqual(store.calls, [
    ['switchMode', 'symbols'],
    ['switchMode', 'numbers'],
    ['applySuggestion', 'the'],
    ['insertReturn'],
  ]);
});

test('handleSuggestionSelection applies chosen suggestion word', () => {
  const store = createMockStore();

  const didApply = handleSuggestionSelection(store, 'there');

  assert.equal(didApply, true);
  assert.deepEqual(store.calls, [['applySuggestion', 'there']]);
});

test('renderApp does not mutate state snapshots while rendering', () => {
  const store = createStateStore();
  store.insertChar('t');
  store.insertChar('e');
  store.insertChar('h');
  const stateSnapshot = store.getState();
  const suggestionsBeforeRender = [...stateSnapshot.suggestions];
  const keyboardActions = createKeyboardActions(store);
  const { display, suggestionsRail, keyboardRoot } = createAppDomFixture();

  runWithGlobalDocument(
    new FakeDocument(),
    () => renderApp(stateSnapshot, { display, suggestionsRail, keyboardRoot }, store, keyboardActions)
  );

  assert.deepEqual(stateSnapshot.suggestions, suggestionsBeforeRender);
});

test('bootstrapApp wires store updates to display and suggestions rail rerenders', () => {
  const { doc, display, suggestionsRail, keyboardRoot } = createAppDomFixture();
  runWithGlobalDocument(doc, () => {
    const app = bootstrapApp(doc);
    assert.ok(app);

    app.store.insertChar('t');
    app.store.insertChar('e');
    app.store.insertChar('h');

    assert.equal(display.textContent, 'teh');
    assert.equal(keyboardRoot.children.length, 4);
    assert.equal(suggestionsRail.children.length, 3);
    assert.deepEqual(getChildText(suggestionsRail), ['the', 'there', 'their']);

    suggestionsRail.children[0].click();

    assert.equal(display.textContent, 'the');
    assert.deepEqual(getChildText(suggestionsRail), ['the', 'there', 'their']);
  });
});
