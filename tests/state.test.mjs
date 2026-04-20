import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../js/state.js';

function typeText(store, text) {
  for (const char of text) {
    store.insertChar(char);
  }
}

test('createStateStore exposes canonical initial state', () => {
  const store = createStateStore();

  assert.deepEqual(store.getState(), {
    text: '',
    cursor: 0,
    mode: 'letters',
    shiftMode: 'off',
    currentWordRange: { start: 0, end: 0 },
    suggestions: [],
  });
});

test('single shift uppercases one character then resets to off', () => {
  const store = createStateStore();

  store.toggleShift();
  store.insertChar('a');
  store.insertChar('b');

  assert.equal(store.getState().text, 'Ab');
  assert.equal(store.getState().cursor, 2);
  assert.equal(store.getState().shiftMode, 'off');
});

test('second toggleShift does not enter caps and returns off', () => {
  const store = createStateStore();

  store.toggleShift();
  assert.equal(store.getState().shiftMode, 'single');

  store.toggleShift();
  assert.equal(store.getState().shiftMode, 'off');
});

test('deleteBackward removes previous character and moves cursor', () => {
  const store = createStateStore();

  typeText(store, 'abc');
  store.deleteBackward();
  assert.equal(store.getState().text, 'ab');
  assert.equal(store.getState().cursor, 2);
  assert.deepEqual(store.getState().currentWordRange, { start: 0, end: 2 });

  store.deleteBackward();
  store.deleteBackward();
  assert.equal(store.getState().text, '');
  assert.equal(store.getState().cursor, 0);
  assert.deepEqual(store.getState().currentWordRange, { start: 0, end: 0 });
});

test('switchMode ignores unknown mode and preserves existing mode', () => {
  const store = createStateStore();

  store.switchMode('numbers');
  store.switchMode('emoji');

  assert.equal(store.getState().mode, 'numbers');
});

test('applySuggestion replaces current word and keeps cursor at word end', () => {
  const store = createStateStore();

  typeText(store, 'say');
  store.insertSpace();
  typeText(store, 'helo');
  assert.deepEqual(store.getState().currentWordRange, { start: 4, end: 8 });

  store.applySuggestion('hello');

  assert.equal(store.getState().text, 'say hello');
  assert.equal(store.getState().cursor, 9);
  assert.deepEqual(store.getState().currentWordRange, { start: 4, end: 9 });
});

test('each mutation notifies subscribers exactly once', () => {
  const cases = [
    { name: 'insertChar', mutate: (store) => store.insertChar('a') },
    { name: 'deleteBackward', mutate: (store) => store.deleteBackward() },
    { name: 'insertSpace', mutate: (store) => store.insertSpace() },
    { name: 'insertReturn', mutate: (store) => store.insertReturn() },
    { name: 'toggleShift', mutate: (store) => store.toggleShift() },
    { name: 'setCapsLock', mutate: (store) => store.setCapsLock(true) },
    { name: 'switchMode', mutate: (store) => store.switchMode('numbers') },
    {
      name: 'applySuggestion',
      prepare: (store) => typeText(store, 'helo'),
      mutate: (store) => store.applySuggestion('hello'),
    },
  ];

  for (const entry of cases) {
    const store = createStateStore();
    if (entry.prepare) {
      entry.prepare(store);
    }

    let updateCount = 0;
    const unsubscribe = store.subscribe(() => {
      updateCount += 1;
    });

    entry.mutate(store);
    unsubscribe();

    assert.equal(updateCount, 1, `${entry.name} should notify once`);
  }
});

test('subscriber updates are snapshots and cannot mutate internal state', () => {
  const store = createStateStore();

  const unsubscribe = store.subscribe((update) => {
    update.text = 'mutated';
    update.cursor = 99;
    update.mode = 'numbers';
    update.shiftMode = 'caps';
    update.currentWordRange.start = 42;
    update.suggestions.push('evil');
  });

  store.insertChar('a');
  unsubscribe();

  assert.deepEqual(store.getState(), {
    text: 'a',
    cursor: 1,
    mode: 'letters',
    shiftMode: 'off',
    currentWordRange: { start: 0, end: 1 },
    suggestions: [],
  });
});
