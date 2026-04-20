# iPhone Keyboard

A highly customizable, pixel-faithful iPhone-style keyboard — right in your
browser. No dependencies, no build step, just open `index.html`.

## Features

- **Faithful iOS look**: phone frame with notch, status bar, Notes-style editor,
  suggestion bar, and a full keyboard with letter / numbers / symbols / emoji
  modes.
- **Highly customizable**:
  - Six themes: Light, Dark, Midnight Blue, Sunset, Forest, Candy.
  - Layouts: QWERTY, AZERTY, Dvorak.
  - Key shapes (rounded / pill / square) and adjustable key font size.
  - Toggles for key-click sound, haptic vibration (where supported),
    auto‑capitalize, predictive suggestions, auto‑space after punctuation, and
    `". "` on double‑space.
  - Settings persist in `localStorage`.
- **iOS‑style interactions**:
  - Long‑press letters to reveal accented variants (é, ñ, ü…). Drag to pick one.
  - Hold shift for caps lock (or double‑tap).
  - Hold the space bar and drag to move the cursor.
  - Hold backspace to repeat.
  - Tap the 🌐 globe key to cycle themes.
- **Works offline** — pure static HTML / CSS / JavaScript.

## Run locally

Just open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## File layout

- `index.html` — markup for the phone frame, editor, suggestion bar, settings.
- `styles.css` — theme tokens and component styles.
- `app.js` — layouts, rendering, gestures, typing logic, settings persistence.
