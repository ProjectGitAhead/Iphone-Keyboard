import { getLayoutForMode } from './layouts.js';

const SHIFT_DOUBLE_TAP_THRESHOLD_MS = 350;
let lastShiftTapTimestamp = null;

function isAlphabeticCharacter(value) {
  return typeof value === 'string' && /^[a-z]$/i.test(value);
}

function getShiftDisplayLabel(key, state) {
  const source = key.value ?? key.label;
  if (!isAlphabeticCharacter(source) || state.mode !== 'letters') {
    return key.label;
  }

  const shouldUppercase = state.shiftMode === 'single' || state.shiftMode === 'caps';
  return shouldUppercase ? source.toUpperCase() : source.toLowerCase();
}

function resolveSymbolsTargetMode(currentMode) {
  return currentMode === 'symbols' ? 'numbers' : 'symbols';
}

function clearPendingShiftDoubleTapWindow() {
  lastShiftTapTimestamp = null;
}

function handleToggleSymbols(state, actions) {
  if (typeof actions.toggleSymbols === 'function') {
    actions.toggleSymbols();
    return;
  }

  if (typeof actions.switchMode === 'function') {
    actions.switchMode(resolveSymbolsTargetMode(state.mode));
  }
}

function handleShiftKey(state, actions, nowMs) {
  if (state.shiftMode === 'caps') {
    if (typeof actions.setCapsLock === 'function') {
      actions.setCapsLock(false);
      clearPendingShiftDoubleTapWindow();
      return;
    }

    if (typeof actions.toggleShift === 'function') {
      actions.toggleShift();
      clearPendingShiftDoubleTapWindow();
      return;
    }

    clearPendingShiftDoubleTapWindow();
    return;
  }

  const withinDoubleTapWindow =
    typeof lastShiftTapTimestamp === 'number' &&
    nowMs - lastShiftTapTimestamp <= SHIFT_DOUBLE_TAP_THRESHOLD_MS;

  if (state.shiftMode === 'single' && withinDoubleTapWindow && typeof actions.setCapsLock === 'function') {
    actions.setCapsLock(true);
    clearPendingShiftDoubleTapWindow();
    return;
  }

  if (typeof actions.toggleShift === 'function') {
    actions.toggleShift();
    lastShiftTapTimestamp = nowMs;
    return;
  }

  clearPendingShiftDoubleTapWindow();
}

function getKeyBehaviorType(key) {
  if (key.type === 'char' || key.type === 'action' || key.type === 'mode') {
    return key.type;
  }

  // Backward compatibility for older layout shape where type held the action.
  if (
    key.type === 'deleteBackward' ||
    key.type === 'space' ||
    key.type === 'return' ||
    key.type === 'switchMode' ||
    key.type === 'shift' ||
    key.type === 'toggleSymbols'
  ) {
    return key.type === 'switchMode' ? 'mode' : 'action';
  }

  return key.type;
}

function resolveKeyAction(key) {
  if (key.type === 'action') {
    return key.action;
  }
  if (key.type === 'mode') {
    return 'switchMode';
  }
  // Backward compatibility for older layout shape.
  return key.type;
}

function resolveModeTarget(key) {
  if (key.type === 'mode') {
    return key.mode;
  }
  return key.value;
}

export function dispatchKeyPress(key, state, actions, nowMs = Date.now()) {
  if (!key || !actions) {
    return;
  }

  const behaviorType = getKeyBehaviorType(key);
  if (behaviorType !== 'action' || resolveKeyAction(key) !== 'shift') {
    clearPendingShiftDoubleTapWindow();
  }

  switch (behaviorType) {
    case 'char':
      actions.insertChar?.(key.value ?? key.label);
      break;
    case 'mode':
      actions.switchMode?.(resolveModeTarget(key));
      break;
    case 'action': {
      const action = resolveKeyAction(key);
      switch (action) {
        case 'deleteBackward':
          actions.deleteBackward?.();
          break;
        case 'space':
          actions.insertSpace?.();
          break;
        case 'return':
          actions.insertReturn?.();
          break;
        case 'shift':
          handleShiftKey(state, actions, nowMs);
          break;
        case 'toggleSymbols':
          handleToggleSymbols(state, actions);
          break;
        default:
          break;
      }
      break;
    }
    default:
      break;
  }
}

function createKeyButton(key, state, actions) {
  const behaviorType = getKeyBehaviorType(key);
  const action = resolveKeyAction(key);
  const keyClassType = behaviorType === 'mode' ? 'switchMode' : action;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `keyboard-key keyboard-key--${key.width} keyboard-key--${keyClassType}`;
  button.dataset.keyId = key.id;
  button.dataset.keyType = behaviorType;
  if (behaviorType === 'action') {
    button.dataset.keyAction = action;
  } else if (behaviorType === 'mode') {
    button.dataset.keyMode = resolveModeTarget(key);
  }
  button.textContent = getShiftDisplayLabel(key, state);

  if (behaviorType === 'action' && action === 'shift' && state.shiftMode !== 'off') {
    button.classList.add('keyboard-key--active-shift');
    if (state.shiftMode === 'caps') {
      button.classList.add('keyboard-key--caps-lock');
    }
  }

  button.addEventListener('click', () => {
    dispatchKeyPress(key, state, actions);
  });

  return button;
}

export function renderKeyboard(container, state, actions) {
  if (!container) {
    throw new Error('renderKeyboard requires a container element');
  }

  const rows = getLayoutForMode(state.mode);
  container.innerHTML = '';
  container.classList.add('keyboard');

  for (const row of rows) {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard-row';

    for (const key of row) {
      const button = createKeyButton(key, state, actions);
      rowElement.appendChild(button);
    }

    container.appendChild(rowElement);
  }
}

export function __resetShiftTapStateForTests() {
  clearPendingShiftDoubleTapWindow();
}

export { SHIFT_DOUBLE_TAP_THRESHOLD_MS };
