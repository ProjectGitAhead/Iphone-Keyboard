const MODES = new Set(['letters', 'numbers', 'symbols']);
const SHIFT_MODES = {
  OFF: 'off',
  SINGLE: 'single',
  CAPS: 'caps',
};

function createInitialState() {
  return {
    text: '',
    cursor: 0,
    mode: 'letters',
    shiftMode: SHIFT_MODES.OFF,
    currentWordRange: { start: 0, end: 0 },
    suggestions: [],
  };
}

function findCurrentWordRange(text, cursor) {
  const boundedCursor = Math.max(0, Math.min(cursor, text.length));
  let start = boundedCursor;
  let end = boundedCursor;

  while (start > 0 && !/\s/.test(text[start - 1])) {
    start -= 1;
  }

  while (end < text.length && !/\s/.test(text[end])) {
    end += 1;
  }

  return { start, end };
}

function replaceRange(text, start, end, replacement) {
  return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}

function isAlphaChar(char) {
  return typeof char === 'string' && char.length > 0 && /[a-z]/i.test(char);
}

export function createStateStore() {
  const state = createInitialState();
  const listeners = new Set();

  function getStateSnapshot() {
    return {
      ...state,
      currentWordRange: { ...state.currentWordRange },
      suggestions: [...state.suggestions],
    };
  }

  function emitUpdate() {
    state.currentWordRange = findCurrentWordRange(state.text, state.cursor);
    const snapshot = getStateSnapshot();
    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  function insertText(content) {
    if (!content) {
      return;
    }

    state.text = replaceRange(state.text, state.cursor, state.cursor, content);
    state.cursor += content.length;
  }

  function resolveShiftedChar(char) {
    if (!isAlphaChar(char)) {
      return char;
    }

    if (state.shiftMode === SHIFT_MODES.SINGLE || state.shiftMode === SHIFT_MODES.CAPS) {
      return char.toUpperCase();
    }

    return char.toLowerCase();
  }

  return {
    getState() {
      return getStateSnapshot();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    insertChar(char) {
      insertText(resolveShiftedChar(char));
      if (state.shiftMode === SHIFT_MODES.SINGLE && isAlphaChar(char)) {
        state.shiftMode = SHIFT_MODES.OFF;
      }
      emitUpdate();
    },

    deleteBackward() {
      if (state.cursor > 0) {
        state.text = replaceRange(state.text, state.cursor - 1, state.cursor, '');
        state.cursor -= 1;
      }
      emitUpdate();
    },

    insertSpace() {
      insertText(' ');
      emitUpdate();
    },

    insertReturn() {
      insertText('\n');
      emitUpdate();
    },

    toggleShift() {
      state.shiftMode =
        state.shiftMode === SHIFT_MODES.OFF ? SHIFT_MODES.SINGLE : SHIFT_MODES.OFF;
      emitUpdate();
    },

    setCapsLock(enabled) {
      state.shiftMode = enabled ? SHIFT_MODES.CAPS : SHIFT_MODES.OFF;
      emitUpdate();
    },

    switchMode(mode) {
      if (MODES.has(mode)) {
        state.mode = mode;
      }
      emitUpdate();
    },

    applySuggestion(word) {
      const { start, end } = state.currentWordRange;
      state.text = replaceRange(state.text, start, end, word);
      state.cursor = start + word.length;
      emitUpdate();
    },
  };
}
