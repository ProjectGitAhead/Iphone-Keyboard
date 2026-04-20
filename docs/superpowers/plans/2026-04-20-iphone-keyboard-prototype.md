# iPhone Keyboard Advanced Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, iOS-style keyboard prototype with advanced shift/caps, mode switching, suggestions, and aggressive autocorrect behavior.

**Architecture:** The app is a static multi-module web app using ES modules. `state.js` owns state and mutation events, `layouts.js` defines keyboard keys, `suggestions.js` computes candidate replacements, `keyboard.js` renders/handles interactions, and `app.js` wires state to DOM rendering.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node.js built-in test runner (`node --test`).

---

## File Structure

- Create: `index.html`
- Create: `styles.css`
- Create: `js/layouts.js`
- Create: `js/state.js`
- Create: `js/suggestions.js`
- Create: `js/keyboard.js`
- Create: `js/app.js`
- Create: `tests/suggestions.test.mjs`
- Create: `tests/state.test.mjs`

### Task 1: Suggestions and aggressive autocorrect engine

**Files:**
- Create: `js/suggestions.js`
- Test: `tests/suggestions.test.mjs`

- [ ] **Step 1: Write the failing suggestion tests**

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { getSuggestions, chooseAutoCorrect } from "../js/suggestions.js";

test("getSuggestions prioritizes prefix matches", () => {
  const results = getSuggestions("hel");
  assert.equal(results[0], "hello");
});

test("chooseAutoCorrect aggressively replaces close typo", () => {
  const next = chooseAutoCorrect("teh");
  assert.equal(next, "the");
});
```

- [ ] **Step 2: Run tests to verify red**

Run: `node --test tests/suggestions.test.mjs`  
Expected: FAIL because `js/suggestions.js` does not exist yet.

- [ ] **Step 3: Implement minimal suggestion engine**

```javascript
const DICTIONARY = ["the", "hello", "help", "keyboard"];

export function getSuggestions(input) {
  if (!input) return [];
  return DICTIONARY.filter((word) => word.startsWith(input.toLowerCase())).slice(0, 3);
}

export function chooseAutoCorrect(token) {
  if (token.toLowerCase() === "teh") return "the";
  return token;
}
```

- [ ] **Step 4: Run tests to verify green**

Run: `node --test tests/suggestions.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/suggestions.js tests/suggestions.test.mjs
git commit -m "feat: add suggestion engine with aggressive autocorrect core"
```

### Task 2: State model and mutation rules

**Files:**
- Create: `js/state.js`
- Test: `tests/state.test.mjs`

- [ ] **Step 1: Write failing state tests**

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { createStateStore } from "../js/state.js";

test("single shift resets after inserting one letter", () => {
  const store = createStateStore();
  store.toggleShift();
  store.insertChar("a");
  assert.equal(store.getState().text, "A");
  assert.equal(store.getState().shiftMode, "off");
});
```

- [ ] **Step 2: Run tests to verify red**

Run: `node --test tests/state.test.mjs`  
Expected: FAIL because `js/state.js` does not exist yet.

- [ ] **Step 3: Implement minimal state store**

```javascript
export function createStateStore() {
  const state = { text: "", cursor: 0, shiftMode: "off" };
  return {
    getState: () => state,
    toggleShift() {
      state.shiftMode = state.shiftMode === "off" ? "single" : "off";
    },
    insertChar(char) {
      const out = state.shiftMode === "off" ? char : char.toUpperCase();
      state.text += out;
      state.cursor = state.text.length;
      if (state.shiftMode === "single") state.shiftMode = "off";
    },
  };
}
```

- [ ] **Step 4: Run tests to verify green**

Run: `node --test tests/state.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/state.js tests/state.test.mjs
git commit -m "feat: implement keyboard state store and shift behavior"
```

### Task 3: Keyboard layouts and renderer

**Files:**
- Create: `js/layouts.js`
- Create: `js/keyboard.js`

- [ ] **Step 1: Define keyboard layouts**

Add row-based layout maps for:
- letters (`qwerty` rows + shift/backspace row + mode row)
- numbers (`1234567890` and symbol keys)
- symbols (`[]{}#%^*+=` and punctuation keys)

- [ ] **Step 2: Implement keyboard renderer**

Implement `renderKeyboard(container, state, dispatch)` that:
- reads `state.mode`
- renders rows and keys with width classes
- maps taps to semantic actions (`insertChar`, `deleteBackward`, `insertSpace`, `insertReturn`, `switchMode`, `toggleShift`, `toggleSymbols`)

- [ ] **Step 3: Add double-tap shift handling**

In `keyboard.js`, track last shift-tap timestamp and:
- single tap -> `shiftMode=single`
- second tap within threshold -> `shiftMode=caps`
- next shift tap in caps -> `shiftMode=off`

- [ ] **Step 4: Commit**

```bash
git add js/layouts.js js/keyboard.js
git commit -m "feat: add keyboard layouts and interactive renderer"
```

### Task 4: App shell, styling, and integration

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `js/app.js`

- [ ] **Step 1: Build static app shell**

Create:
- phone-style container
- text display area
- suggestions rail
- keyboard root
- module script tag pointing to `js/app.js`

- [ ] **Step 2: Build iOS-style CSS**

Implement:
- gradient page background
- phone frame and keyboard panel styling
- keycaps with pressed/active/caps states
- suggestion chips with selected/hover styles
- responsive behavior for narrower widths

- [ ] **Step 3: Wire app integration**

In `app.js`:
- create store from `state.js`
- render suggestions with `getSuggestions`
- run aggressive autocorrect on space/return using `chooseAutoCorrect`
- re-render keyboard + display on every state update

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css js/app.js
git commit -m "feat: build ios-style keyboard prototype UI and app wiring"
```

### Task 5: End-to-end verification and demo artifacts

**Files:**
- Verify: `index.html`
- Verify: `tests/*.mjs`

- [ ] **Step 1: Run targeted automated tests**

Run: `node --test tests/suggestions.test.mjs tests/state.test.mjs`  
Expected: PASS.

- [ ] **Step 2: Start static server for manual testing**

Run: `python3 -m http.server 4173` and open `http://127.0.0.1:4173`.

- [ ] **Step 3: Manual test checklist**

Validate:
- letter typing updates display
- single shift applies once
- double-tap shift enables/disables caps lock
- numbers/symbol modes switch and input correctly
- aggressive autocorrect changes typo token on space/return
- tapping suggestion chip replaces current word

- [ ] **Step 4: Record walkthrough video and capture screenshot**

Create one concise demo recording showing:
- typing with mode changes
- autocorrect correction
- suggestion-tap replacement

- [ ] **Step 5: Commit final polish and push**

```bash
git add -A
git commit -m "test: verify advanced keyboard interactions and finalize prototype"
git push -u origin cursor/iphone-keyboard-advanced-prototype-1866
```
