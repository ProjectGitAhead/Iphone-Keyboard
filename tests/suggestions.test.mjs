import test from 'node:test';
import assert from 'node:assert/strict';
import suggestionsModule from '../js/suggestions.js';

const { getSuggestions, chooseAutoCorrect } = suggestionsModule;

test('getSuggestions returns top three words for strong prefix match', () => {
  const suggestions = getSuggestions('the');

  assert.deepEqual(suggestions, ['the', 'there', 'their']);
});

test('getSuggestions tolerates common typo patterns', () => {
  const suggestions = getSuggestions('teh');

  assert.equal(suggestions[0], 'the');
  assert.equal(suggestions.length, 3);
});

test('getSuggestions ranks hello first for helo typo', () => {
  const suggestions = getSuggestions('helo');

  assert.equal(suggestions[0], 'hello');
});

test('chooseAutoCorrect aggressively corrects common typo "teh"', () => {
  assert.equal(chooseAutoCorrect('teh'), 'the');
});

test('chooseAutoCorrect keeps known correct words unchanged', () => {
  assert.equal(chooseAutoCorrect('hello'), 'hello');
});

test('chooseAutoCorrect does not autocorrect partial prefix or short token', () => {
  assert.equal(chooseAutoCorrect('th'), 'th');
});

test('chooseAutoCorrect preserves case when correcting', () => {
  assert.equal(chooseAutoCorrect('Teh'), 'The');
});

test('chooseAutoCorrect keeps unknown token unchanged', () => {
  assert.equal(chooseAutoCorrect('qzxv'), 'qzxv');
});
