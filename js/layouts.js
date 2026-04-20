function createCharKey(id, label, value = label) {
  return {
    id,
    label,
    type: 'char',
    width: 'normal',
    value,
  };
}

function createActionKey(id, label, action, width = 'wide') {
  return {
    id,
    label,
    type: 'action',
    width,
    action,
  };
}

function createModeKey(id, label, mode, width = 'wide') {
  return {
    id,
    label,
    type: 'mode',
    width,
    mode,
  };
}

const LETTERS_LAYOUT = [
  'qwertyuiop'.split('').map((char) => createCharKey(`letters-${char}`, char)),
  'asdfghjkl'.split('').map((char) => createCharKey(`letters-${char}`, char)),
  [
    createActionKey('letters-shift', 'shift', 'shift'),
    ...'zxcvbnm'.split('').map((char) => createCharKey(`letters-${char}`, char)),
    createActionKey('letters-delete', 'delete', 'deleteBackward'),
  ],
  [
    createModeKey('letters-mode-numbers', '123', 'numbers'),
    createActionKey('letters-space', 'space', 'space', 'extraWide'),
    createActionKey('letters-return', 'return', 'return'),
  ],
];

const NUMBERS_LAYOUT = [
  '1234567890'.split('').map((char) => createCharKey(`numbers-${char}`, char)),
  '-/:;()$&@"'.split('').map((char) => createCharKey(`numbers-${char}`, char)),
  [
    createActionKey('numbers-toggle-symbols', '#+=', 'toggleSymbols'),
    ...".,?!'".split('').map((char) => createCharKey(`numbers-${char}`, char)),
    createActionKey('numbers-delete', 'delete', 'deleteBackward'),
  ],
  [
    createModeKey('numbers-mode-letters', 'ABC', 'letters'),
    createActionKey('numbers-space', 'space', 'space', 'extraWide'),
    createActionKey('numbers-return', 'return', 'return'),
  ],
];

const SYMBOLS_LAYOUT = [
  '[]{}#%^*+='.split('').map((char) => createCharKey(`symbols-${char}`, char)),
  '_\\|~<>$`@'.split('').map((char) => createCharKey(`symbols-${char}`, char)),
  [
    createActionKey('symbols-toggle-numbers', '123', 'toggleSymbols'),
    ...".,?!'".split('').map((char) => createCharKey(`symbols-${char}`, char)),
    createActionKey('symbols-delete', 'delete', 'deleteBackward'),
  ],
  [
    createModeKey('symbols-mode-letters', 'ABC', 'letters'),
    createActionKey('symbols-space', 'space', 'space', 'extraWide'),
    createActionKey('symbols-return', 'return', 'return'),
  ],
];

export const KEYBOARD_LAYOUTS = {
  letters: LETTERS_LAYOUT,
  numbers: NUMBERS_LAYOUT,
  symbols: SYMBOLS_LAYOUT,
};

export function getLayoutForMode(mode) {
  return KEYBOARD_LAYOUTS[mode] || KEYBOARD_LAYOUTS.letters;
}
