import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatchKeyPress, __resetShiftTapStateForTests } from '../js/keyboard.js';

function createActionSpies() {
  const calls = [];
  return {
    calls,
    actions: {
      insertChar: (value) => calls.push(['insertChar', value]),
      deleteBackward: () => calls.push(['deleteBackward']),
      insertSpace: () => calls.push(['insertSpace']),
      insertReturn: () => calls.push(['insertReturn']),
      switchMode: (value) => calls.push(['switchMode', value]),
      toggleShift: () => calls.push(['toggleShift']),
      setCapsLock: (value) => calls.push(['setCapsLock', value]),
    },
  };
}

test('dispatchKeyPress routes character and editing keys', () => {
  __resetShiftTapStateForTests();
  const { calls, actions } = createActionSpies();
  const state = { mode: 'letters', shiftMode: 'off' };

  dispatchKeyPress({ type: 'char', value: 'a' }, state, actions, 1000);
  dispatchKeyPress({ type: 'deleteBackward', value: 'deleteBackward' }, state, actions, 1100);
  dispatchKeyPress({ type: 'space', value: ' ' }, state, actions, 1200);
  dispatchKeyPress({ type: 'return', value: '\n' }, state, actions, 1300);
  dispatchKeyPress({ type: 'switchMode', value: 'numbers' }, state, actions, 1400);

  assert.deepEqual(calls, [
    ['insertChar', 'a'],
    ['deleteBackward'],
    ['insertSpace'],
    ['insertReturn'],
    ['switchMode', 'numbers'],
  ]);
});

test('double-tap shift toggles caps lock and taps in caps disable it', () => {
  __resetShiftTapStateForTests();
  const { calls, actions } = createActionSpies();
  const state = { mode: 'letters', shiftMode: 'off' };

  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1000);
  state.shiftMode = 'single';
  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1200);
  state.shiftMode = 'caps';
  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1600);

  assert.deepEqual(calls, [
    ['toggleShift'],
    ['setCapsLock', true],
    ['setCapsLock', false],
  ]);
});

test('second shift tap outside threshold does not enable caps lock', () => {
  __resetShiftTapStateForTests();
  const { calls, actions } = createActionSpies();
  const state = { mode: 'letters', shiftMode: 'off' };

  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1000);
  state.shiftMode = 'single';
  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1400);

  assert.deepEqual(calls, [['toggleShift'], ['toggleShift']]);
});

test('non-shift key clears pending shift double-tap window', () => {
  __resetShiftTapStateForTests();
  const { calls, actions } = createActionSpies();
  const state = { mode: 'letters', shiftMode: 'off' };

  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1000);
  state.shiftMode = 'single';
  dispatchKeyPress({ type: 'deleteBackward', value: 'deleteBackward' }, state, actions, 1100);
  dispatchKeyPress({ type: 'shift', value: 'shift' }, state, actions, 1200);

  assert.deepEqual(calls, [['toggleShift'], ['deleteBackward'], ['toggleShift']]);
});

test('toggleSymbols falls back to switchMode between numbers and symbols', () => {
  __resetShiftTapStateForTests();
  const { calls, actions } = createActionSpies();
  const numbersState = { mode: 'numbers', shiftMode: 'off' };
  const symbolsState = { mode: 'symbols', shiftMode: 'off' };

  dispatchKeyPress({ type: 'toggleSymbols', value: 'toggleSymbols' }, numbersState, actions, 1000);
  dispatchKeyPress({ type: 'toggleSymbols', value: 'toggleSymbols' }, symbolsState, actions, 1200);

  assert.deepEqual(calls, [
    ['switchMode', 'symbols'],
    ['switchMode', 'numbers'],
  ]);
});
