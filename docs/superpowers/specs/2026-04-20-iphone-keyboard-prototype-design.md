# iPhone Keyboard Advanced Prototype Design

## Overview

Build a static, browser-run iOS-style keyboard prototype with advanced behavior:

- iOS-style visual keyboard and phone frame
- Letter, number, and symbol layouts
- Shift, caps lock, and mode switching
- Suggestions bar with tap-to-accept replacements
- Aggressive mock autocorrect on space/return

This prototype runs with zero build step and supports direct browser opening.

## Goals

1. Deliver a realistic, interactive keyboard demo in a static web app.
2. Keep architecture modular with clear file boundaries.
3. Demonstrate advanced typing behavior (shift/caps/layout/suggestions/autocorrect).

## Non-goals

1. Native iOS app packaging.
2. Production-grade NLP autocorrect quality.
3. Backend persistence, accounts, or cloud sync.

## Architecture

The implementation uses static assets with ES module boundaries:

- `index.html`: app shell, phone frame, text display, suggestion rail, keyboard root.
- `styles.css`: iOS-style visuals, key sizing, states, layout responsiveness.
- `js/state.js`: canonical app state and mutation APIs.
- `js/layouts.js`: key layout definitions for letters/numbers/symbols.
- `js/suggestions.js`: candidate generation and scoring.
- `js/keyboard.js`: render keyboard rows, map key presses to semantic actions.
- `js/app.js`: bootstrap app, wire subscriptions, trigger rerenders.

## State Model

`state.js` owns a single state object:

- `text`: full typed content.
- `cursor`: insertion index.
- `mode`: `letters | numbers | symbols`.
- `shiftMode`: `off | single | caps`.
- `currentWordRange`: `{start, end}` for suggestion replacement.
- `suggestions`: current top candidates.

Mutation functions:

- `insertChar(char)`
- `deleteBackward()`
- `insertSpace()`
- `insertReturn()`
- `toggleShift()`
- `setCapsLock(enabled)`
- `switchMode(mode)`
- `applySuggestion(word)`

Each mutation emits an update event consumed by the renderer.

## Layout Definitions

`layouts.js` exports row-based key maps for:

- Letters layout with alpha keys and control row.
- Numbers layout toggled by `123`.
- Symbols layout toggled by `#+=`.

Key metadata fields:

- `id`
- `label`
- `type` (`char`, `action`, `mode`)
- `width` (`normal`, `wide`, `extraWide`)
- `value` for character keys

Labels are dynamically cased for letter keys based on `shiftMode`.

## Suggestions and Aggressive Autocorrect

`suggestions.js` computes candidates using:

1. Prefix matches from an in-memory dictionary.
2. Edit-distance scoring for typo tolerance.
3. Confidence sort to return top three suggestions.

Aggressive autocorrect strategy:

- On `space` or `return`, evaluate the current token.
- If a candidate score is above aggressive threshold, replace token automatically.
- Preserve punctuation and continue insertion flow.
- Always expose the top suggestions for explicit user override.

## Interaction Rules

1. **Single shift tap** sets `shiftMode=single`; after next character, reset to `off`.
2. **Double shift tap** toggles `shiftMode=caps` until turned off.
3. **Mode keys** switch between letters/numbers/symbols while preserving text/cursor.
4. **Suggestion chip tap** replaces the current word and keeps cursor at word end.
5. **Backspace** deletes previous character and refreshes suggestions from new prefix.

## Rendering Strategy

`keyboard.js` renders keys from layout data each state change:

- Applies active classes for shift/caps and pressed key feedback.
- Binds pointer events to semantic handlers.
- Uses width classes for space/return/control keys.

`app.js` orchestrates:

- Initial render.
- State subscription for rerender.
- Suggestion rail updates and text display synchronization.

## Error Handling

1. If no suggestion candidates exist, show empty-state (no chips).
2. If current word range is invalid, skip replacement safely.
3. If mode switch target is unknown, ignore mutation and keep prior mode.

## Testing Plan

1. Open the static app in browser and validate rendering.
2. Type sentence and confirm letter entry + display updates.
3. Verify shift one-shot and double-tap caps behavior.
4. Toggle into numbers/symbols and back; verify key maps and input.
5. Trigger aggressive autocorrect using typo tokens and space/return.
6. Tap suggestion chips to replace current word.
7. Capture a demo video proving end-to-end behavior.

## File Deliverables

- `index.html`
- `styles.css`
- `js/app.js`
- `js/state.js`
- `js/layouts.js`
- `js/keyboard.js`
- `js/suggestions.js`
