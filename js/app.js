import { renderKeyboard } from './keyboard.js';
import suggestionsModule from './suggestions.js';
import { createStateStore } from './state.js';

const { getSuggestions, chooseAutoCorrect } = suggestionsModule;

function getCurrentToken(state) {
  const start = state.currentWordRange?.start ?? state.cursor ?? 0;
  const end = state.currentWordRange?.end ?? state.cursor ?? 0;
  return state.text.slice(start, end);
}

export function computeSuggestionsForState(state, getSuggestionsFn = getSuggestions) {
  return getSuggestionsFn(getCurrentToken(state));
}

export function applyAutoCorrectToCurrentWord(store, chooseAutoCorrectFn = chooseAutoCorrect) {
  const state = store.getState();
  const token = getCurrentToken(state);
  if (!token) {
    return null;
  }

  const correctedToken = chooseAutoCorrectFn(token);
  if (!correctedToken || correctedToken === token) {
    return null;
  }

  store.applySuggestion(correctedToken);
  return correctedToken;
}

export function handleSuggestionSelection(store, word) {
  if (!word) {
    return false;
  }
  store.applySuggestion(word);
  return true;
}

export function createKeyboardActions(store, chooseAutoCorrectFn = chooseAutoCorrect) {
  return {
    insertChar: (value) => store.insertChar(value),
    deleteBackward: () => store.deleteBackward(),
    toggleShift: () => store.toggleShift(),
    setCapsLock: (value) => store.setCapsLock(value),
    switchMode: (mode) => store.switchMode(mode),
    toggleSymbols() {
      const { mode } = store.getState();
      store.switchMode(mode === 'symbols' ? 'numbers' : 'symbols');
    },
    insertSpace() {
      applyAutoCorrectToCurrentWord(store, chooseAutoCorrectFn);
      store.insertSpace();
    },
    insertReturn() {
      applyAutoCorrectToCurrentWord(store, chooseAutoCorrectFn);
      store.insertReturn();
    },
  };
}

function renderSuggestions(railElement, store, suggestions) {
  if (!railElement) {
    return;
  }

  railElement.textContent = '';
  for (const [index, suggestion] of suggestions.entries()) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'suggestion-chip';
    if (index === 0) {
      chip.classList.add('suggestion-chip--recommended');
    }
    chip.textContent = suggestion;
    chip.addEventListener('click', () => {
      handleSuggestionSelection(store, suggestion);
    });
    railElement.appendChild(chip);
  }
}

export function renderApp(state, elements, store, keyboardActions) {
  const suggestions = computeSuggestionsForState(state);

  if (elements.display) {
    elements.display.textContent = state.text;
  }
  renderSuggestions(elements.suggestionsRail, store, suggestions);
  renderKeyboard(elements.keyboardRoot, state, keyboardActions);
}

export function bootstrapApp(doc = document) {
  const display = doc.getElementById('display-text');
  const suggestionsRail = doc.getElementById('suggestions-rail');
  const keyboardRoot = doc.getElementById('keyboard-root');

  if (!display || !suggestionsRail || !keyboardRoot) {
    return null;
  }

  const store = createStateStore();
  const keyboardActions = createKeyboardActions(store);
  const elements = { display, suggestionsRail, keyboardRoot };

  const renderFromState = (state) => {
    renderApp(state, elements, store, keyboardActions);
  };

  store.subscribe(renderFromState);
  renderFromState(store.getState());
  return { store, keyboardActions };
}

if (typeof document !== 'undefined') {
  bootstrapApp(document);
}
