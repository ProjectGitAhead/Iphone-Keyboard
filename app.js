"use strict";

/* ---------- Layouts ---------- */
const LAYOUTS = {
  qwerty: {
    lower: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ],
    upper: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"],
    ],
  },
  azerty: {
    lower: [
      ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
      ["w", "x", "c", "v", "b", "n"],
    ],
    upper: [
      ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
      ["W", "X", "C", "V", "B", "N"],
    ],
  },
  dvorak: {
    lower: [
      ["p", "y", "f", "g", "c", "r", "l"],
      ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s"],
      ["q", "j", "k", "x", "b", "m", "w", "v", "z"],
    ],
    upper: [
      ["P", "Y", "F", "G", "C", "R", "L"],
      ["A", "O", "E", "U", "I", "D", "H", "T", "N", "S"],
      ["Q", "J", "K", "X", "B", "M", "W", "V", "Z"],
    ],
  },
};

const NUMBERS_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
  [".", ",", "?", "!", "'"],
];
const SYMBOLS_ROWS = [
  ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
  ["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"],
  [".", ",", "?", "!", "'"],
];

/* Long-press alternates */
const ACCENTS = {
  a: ["à", "á", "â", "ä", "æ", "ã", "å", "ā"],
  c: ["ç", "ć", "č"],
  e: ["è", "é", "ê", "ë", "ē", "ė", "ę"],
  i: ["î", "ï", "í", "ī", "į", "ì"],
  l: ["ł"],
  n: ["ñ", "ń"],
  o: ["ô", "ö", "ò", "ó", "œ", "ø", "ō", "õ"],
  s: ["ß", "ś", "š"],
  u: ["û", "ü", "ù", "ú", "ū"],
  y: ["ÿ"],
  z: ["ž", "ź", "ż"],
  "$": ["€", "£", "¥", "₩", "¢", "₽", "₹"],
  ".": ["…", "·"],
  "?": ["¿"],
  "!": ["¡"],
  "'": ["’", "‘", "“", "”", "«", "»"],
  "-": ["–", "—", "•"],
  "/": ["\\"],
};

const EMOJI = (
  "😀 😃 😄 😁 😆 🥹 😂 🤣 😊 😇 🙂 🙃 😉 😍 🥰 😘 😗 😙 😚 😋 " +
  "😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 😐 😑 😶 😏 😒 🙄 😬 🤥 😌 😔 " +
  "😪 🤤 😴 😷 🤒 🤕 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 🙁 ☹️ " +
  "😢 😭 😤 😠 😡 🤬 😈 👿 💀 ☠️ 💩 🤡 👻 👽 🤖 🎃 ❤️ 🧡 💛 💚 " +
  "💙 💜 🤎 🖤 🤍 💔 💕 💞 💓 💗 💖 💘 💝 💟 ✨ ⭐️ 🌟 💫 🔥 🎉 " +
  "🎊 🎈 🎁 🏆 🥇 🥈 🥉 ⚽️ 🏀 🏈 ⚾️ 🎾 🏐 🍕 🍔 🍟 🌭 🍿 🍩 🍪 " +
  "☕️ 🍵 🍺 🥤 🍷 🍻 🥂 🌮 🌯 🥗 🍣 🍜 🍱 🍙 🍰 🎂 🍦 🍫 🍓 🍎 " +
  "👍 👎 👏 🙌 🤝 🙏 🫶 🤘 ✌️ 👌 🤌 🤏 ✋ 🖐️ 🖖 👋 🫡 💪 🦾 🤳"
).split(/\s+/);

/* ---------- State ---------- */
const STORAGE_KEY = "iphone-keyboard-settings-v1";
const defaultSettings = {
  theme: "dark",
  layout: "qwerty",
  keyShape: "rounded",
  fontSize: 20,
  sound: true,
  haptics: true,
  autocap: true,
  suggestions: true,
  autospace: true,
  doublePeriod: true,
};

const state = {
  settings: loadSettings(),
  mode: "letters", // 'letters' | 'numbers' | 'symbols' | 'emoji'
  shift: "auto", // 'off' | 'on' | 'lock' | 'auto'
  audio: null,
  longPressTimer: null,
  accentPicker: null,
  spaceDrag: null,
  doubleSpaceTimer: 0,
  shiftTapTime: 0,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...defaultSettings };
}
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
  } catch (_) {}
}

/* ---------- DOM helpers ---------- */
const $ = (id) => document.getElementById(id);
const editor = $("editor");
const keyboard = $("keyboard");
const suggestionBar = $("suggestion-bar");

/* ---------- Sound ---------- */
function tick() {
  if (!state.settings.sound) return;
  try {
    if (!state.audio) state.audio = new (window.AudioContext ||
      window.webkitAudioContext)();
    const ctx = state.audio;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 880 + Math.random() * 80;
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.start(t);
    o.stop(t + 0.07);
  } catch (_) {}
}
function buzz(ms = 8) {
  if (!state.settings.haptics) return;
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ---------- Editor (custom contenteditable + caret) ---------- */
function getText() {
  return editor.innerText.replace(/\u00A0/g, " ");
}
function setText(value, caret) {
  editor.innerText = value;
  placeCaret(caret == null ? value.length : caret);
}
function getCaret() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return getText().length;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.endContainer)) return getText().length;
  const pre = range.cloneRange();
  pre.selectNodeContents(editor);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
}
function placeCaret(pos) {
  editor.focus();
  const sel = window.getSelection();
  const range = document.createRange();
  let remaining = pos;
  let target = null,
    targetOffset = 0;
  function walk(node) {
    if (target) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.nodeValue.length;
      if (remaining <= len) {
        target = node;
        targetOffset = remaining;
      } else {
        remaining -= len;
      }
    } else {
      for (const c of node.childNodes) walk(c);
    }
  }
  walk(editor);
  if (!target) {
    range.selectNodeContents(editor);
    range.collapse(false);
  } else {
    range.setStart(target, targetOffset);
    range.setEnd(target, targetOffset);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

function insert(str) {
  const text = getText();
  let caret = getCaret();
  let before = text.slice(0, caret);
  let after = text.slice(caret);
  let toInsert = str;

  // Auto-space after punctuation when typing a letter
  if (
    state.settings.autospace &&
    /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(toInsert) &&
    /[.!?,;:][”"’')\]]?$/.test(before) &&
    !before.endsWith(" ")
  ) {
    before += " ";
  }

  const next = before + toInsert + after;
  const newCaret = before.length + toInsert.length;
  setText(next, newCaret);
  postType();
  refreshSuggestions();
}

function backspace() {
  const text = getText();
  const caret = getCaret();
  if (caret <= 0) return;
  const before = text.slice(0, caret - 1);
  const after = text.slice(caret);
  setText(before + after, before.length);
  postType();
  refreshSuggestions();
}

function postType() {
  if (state.shift === "on") setShift("off");
  if (state.shift === "auto") setShift(autoShiftState());
}

function autoShiftState() {
  if (!state.settings.autocap) return "off";
  const text = getText();
  const caret = getCaret();
  const before = text.slice(0, caret).trimEnd();
  if (before.length === 0) return "on";
  if (/[.!?]$/.test(before)) return "on";
  return "off";
}

/* ---------- Suggestions ---------- */
const COMMON_WORDS = (
  "the be to of and a in that have I it for not on with he as you do at " +
  "this but his by from they we say her she or an will my one all would there " +
  "their what so up out if about who get which go me when make can like time " +
  "no just him know take people into year your good some could them see other " +
  "than then now look only come its over think also back after use two how " +
  "our work first well way even new want because any these give day most us"
).split(" ");
const SUGGESTION_FALLBACKS = ["I", "The", "I'm"];

function currentWord() {
  const text = getText();
  const caret = getCaret();
  let i = caret;
  while (i > 0 && /[A-Za-z'’-]/.test(text[i - 1])) i--;
  return { start: i, value: text.slice(i, caret) };
}

function refreshSuggestions() {
  const slots = suggestionBar.querySelectorAll(".suggestion");
  if (!state.settings.suggestions) {
    slots.forEach((b) => {
      b.textContent = "";
      b.classList.add("placeholder");
      b.dataset.word = "";
    });
    return;
  }
  const { value } = currentWord();
  let suggestions;
  if (!value) {
    suggestions = SUGGESTION_FALLBACKS.slice();
  } else {
    const lower = value.toLowerCase();
    const matches = COMMON_WORDS.filter((w) => w.startsWith(lower)).slice(0, 3);
    suggestions = [
      `“${value}”`,
      ...matches,
      ...COMMON_WORDS.filter((w) => !matches.includes(w)).slice(0, 3),
    ].slice(0, 3);
  }
  slots.forEach((btn, idx) => {
    const word = suggestions[idx] || "";
    btn.textContent = word || " ";
    btn.dataset.word = word;
    btn.classList.toggle("placeholder", !word);
  });
}

function applySuggestion(word) {
  if (!word) return;
  const isQuoted = word.startsWith("“") && word.endsWith("”");
  const stripped = isQuoted ? word.slice(1, -1) : word;
  const text = getText();
  const caret = getCaret();
  const { start } = currentWord();
  const before = text.slice(0, start);
  const after = text.slice(caret);
  const insertion = stripped + " ";
  setText(before + insertion + after, before.length + insertion.length);
  postType();
  refreshSuggestions();
}

/* ---------- Keyboard rendering ---------- */
function actionLabel(action) {
  switch (action) {
    case "shift":
      return "⇧";
    case "backspace":
      return "⌫";
    case "mode-numbers":
      return "123";
    case "mode-letters":
      return "ABC";
    case "mode-symbols":
      return "#+=";
    case "globe":
      return "🌐";
    case "emoji":
      return "😊";
    case "space":
      return "space";
    case "return":
      return "return";
  }
  return "";
}

function renderKeyboard() {
  keyboard.innerHTML = "";
  keyboard.style.setProperty("--kb-font-size", state.settings.fontSize + "px");
  keyboard.classList.remove("shape-rounded", "shape-pill", "shape-square");
  keyboard.classList.add("shape-" + state.settings.keyShape);

  if (state.mode === "emoji") return renderEmojiPanel();

  const upper =
    state.shift !== "off" || state.mode === "numbers" || state.mode === "symbols";

  let rows;
  if (state.mode === "letters") {
    const layout = LAYOUTS[state.settings.layout];
    rows = upper ? layout.upper : layout.lower;
  } else if (state.mode === "numbers") {
    rows = NUMBERS_ROWS;
  } else {
    rows = SYMBOLS_ROWS;
  }

  // letter rows
  rows.forEach((row, i) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";

    if (state.mode === "letters" && i === rows.length - 1) {
      rowEl.appendChild(actionKey("shift", "shift"));
    }
    if (state.mode !== "letters" && i === rows.length - 1) {
      const m = state.mode === "numbers" ? "mode-symbols" : "mode-numbers";
      rowEl.appendChild(actionKey(m, "mode"));
    }

    row.forEach((ch) => rowEl.appendChild(letterKey(ch)));

    if (i === rows.length - 1) {
      rowEl.appendChild(actionKey("backspace", "backspace"));
    }
    keyboard.appendChild(rowEl);
  });

  // bottom row
  const bottom = document.createElement("div");
  bottom.className = "kb-row";
  bottom.appendChild(
    actionKey(
      state.mode === "letters" ? "mode-numbers" : "mode-letters",
      "mode",
    ),
  );
  bottom.appendChild(actionKey("emoji", "emoji"));
  bottom.appendChild(actionKey("globe", "globe"));
  bottom.appendChild(actionKey("space", "space"));
  bottom.appendChild(actionKey("return", "return"));
  keyboard.appendChild(bottom);

  // Reflect shift visual state
  const shiftEl = keyboard.querySelector('[data-key="SHIFT"]');
  if (shiftEl) {
    shiftEl.classList.toggle("caps-lock", state.shift === "lock");
    if (state.shift === "on") shiftEl.classList.add("pressed");
  }
}

function letterKey(ch) {
  const btn = document.createElement("button");
  btn.className = "key";
  btn.dataset.key = ch;
  btn.dataset.kind = "char";
  btn.type = "button";
  btn.textContent = ch;

  const popup = document.createElement("span");
  popup.className = "popup";
  popup.textContent = ch;
  btn.appendChild(popup);

  attachKeyHandlers(btn, () => {
    insert(ch);
  });
  return btn;
}

function actionKey(action, wide) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "key accent";
  if (action === "return") btn.classList.add("action");
  btn.dataset.key = action.toUpperCase();
  btn.dataset.action = action;
  btn.dataset.kind = "action";
  btn.dataset.wide = wide;
  btn.textContent = actionLabel(action);
  attachKeyHandlers(btn, () => handleAction(action, btn));
  return btn;
}

function handleAction(action, el) {
  switch (action) {
    case "shift": {
      const now = performance.now();
      if (now - state.shiftTapTime < 350) {
        setShift("lock");
      } else if (state.shift === "off" || state.shift === "auto") {
        setShift("on");
      } else if (state.shift === "on") {
        setShift("off");
      } else if (state.shift === "lock") {
        setShift("off");
      }
      state.shiftTapTime = now;
      return;
    }
    case "backspace":
      backspace();
      return;
    case "mode-numbers":
      state.mode = "numbers";
      renderKeyboard();
      return;
    case "mode-letters":
      state.mode = "letters";
      renderKeyboard();
      return;
    case "mode-symbols":
      state.mode = "symbols";
      renderKeyboard();
      return;
    case "emoji":
      state.mode = state.mode === "emoji" ? "letters" : "emoji";
      renderKeyboard();
      return;
    case "globe":
      cycleTheme();
      return;
    case "space": {
      const now = performance.now();
      if (state.settings.doublePeriod && now - state.doubleSpaceTimer < 350) {
        // Replace previous space with ". "
        const text = getText();
        const caret = getCaret();
        if (caret > 0 && text[caret - 1] === " ") {
          const before = text.slice(0, caret - 1) + ". ";
          const after = text.slice(caret);
          setText(before + after, before.length);
          postType();
          refreshSuggestions();
          state.doubleSpaceTimer = 0;
          return;
        }
      }
      state.doubleSpaceTimer = now;
      insert(" ");
      return;
    }
    case "return":
      insert("\n");
      return;
  }
}

function setShift(s) {
  state.shift = s;
  renderKeyboard();
}

function cycleTheme() {
  const order = ["dark", "light", "midnight", "sunset", "forest", "candy"];
  const idx = order.indexOf(state.settings.theme);
  const next = order[(idx + 1) % order.length];
  state.settings.theme = next;
  $("theme").value = next;
  applyTheme();
  saveSettings();
}

/* ---------- Emoji panel ---------- */
function renderEmojiPanel() {
  const grid = document.createElement("div");
  grid.className = "emoji-panel";
  EMOJI.forEach((e) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = e;
    b.addEventListener("pointerdown", () => {
      tick();
      buzz();
      insert(e);
    });
    grid.appendChild(b);
  });
  keyboard.appendChild(grid);

  const footer = document.createElement("div");
  footer.className = "emoji-footer";
  const back = document.createElement("button");
  back.textContent = "ABC";
  back.addEventListener("pointerdown", () => {
    state.mode = "letters";
    renderKeyboard();
  });
  const del = document.createElement("button");
  del.textContent = "⌫";
  del.addEventListener("pointerdown", () => {
    tick();
    buzz();
    backspace();
  });
  footer.appendChild(back);
  footer.appendChild(del);
  keyboard.appendChild(footer);
}

/* ---------- Key gestures (press/long-press/space drag) ---------- */
function attachKeyHandlers(btn, onTap) {
  btn.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    btn.classList.add("pressed");
    tick();
    buzz();
    btn.setPointerCapture?.(ev.pointerId);

    const action = btn.dataset.action;
    const ch = btn.dataset.key;

    // Long-press accents for letter/number keys
    if (btn.dataset.kind === "char") {
      const lower = (ch || "").toLowerCase();
      const list = ACCENTS[lower];
      if (list && list.length) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = setTimeout(() => {
          openAccentPicker(btn, ch, list);
        }, 380);
      }
    }

    // Hold-to-lock for shift / mode
    if (action === "shift") {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = setTimeout(() => setShift("lock"), 450);
    }
    if (action === "backspace") {
      // hold to repeat
      let speed = 110;
      const tickRepeat = () => {
        backspace();
        speed = Math.max(30, speed - 6);
        state.longPressTimer = setTimeout(tickRepeat, speed);
      };
      state.longPressTimer = setTimeout(tickRepeat, 380);
    }
    if (action === "space") {
      state.spaceDrag = {
        startX: ev.clientX,
        startCaret: getCaret(),
        moved: false,
      };
    }
  });

  btn.addEventListener("pointermove", (ev) => {
    if (state.spaceDrag && btn.dataset.action === "space") {
      const dx = ev.clientX - state.spaceDrag.startX;
      if (Math.abs(dx) > 6) {
        state.spaceDrag.moved = true;
        clearTimeout(state.longPressTimer);
        const text = getText();
        const target = Math.max(
          0,
          Math.min(text.length, state.spaceDrag.startCaret + Math.round(dx / 8)),
        );
        placeCaret(target);
      }
    }
    if (state.accentPicker && state.accentPicker.btn === btn) {
      highlightAccentOption(ev.clientX);
    }
  });

  btn.addEventListener("pointerup", (ev) => {
    btn.classList.remove("pressed");
    clearTimeout(state.longPressTimer);

    if (state.accentPicker && state.accentPicker.btn === btn) {
      const choice = state.accentPicker.activeChar;
      closeAccentPicker();
      if (choice) {
        insert(choice);
      } else {
        onTap();
      }
      return;
    }

    if (state.spaceDrag && btn.dataset.action === "space") {
      const drag = state.spaceDrag;
      state.spaceDrag = null;
      if (drag.moved) return; // dragged, don't insert space
    }

    onTap();
  });

  btn.addEventListener("pointercancel", () => {
    btn.classList.remove("pressed");
    clearTimeout(state.longPressTimer);
    if (state.accentPicker && state.accentPicker.btn === btn) closeAccentPicker();
    state.spaceDrag = null;
  });

  // Prevent contextmenu on long-press (mobile)
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
}

function openAccentPicker(btn, baseChar, options) {
  closeAccentPicker();
  const picker = document.createElement("div");
  picker.className = "accent-picker";
  const all = [baseChar, ...options];
  all.forEach((opt) => {
    const o = document.createElement("span");
    o.className = "accent-option";
    o.textContent = opt;
    o.dataset.char = opt;
    picker.appendChild(o);
  });
  btn.appendChild(picker);
  state.accentPicker = { btn, picker, activeChar: baseChar, options: all };
  // Activate first
  picker.firstChild?.classList.add("active");
}

function highlightAccentOption(clientX) {
  if (!state.accentPicker) return;
  const opts = [...state.accentPicker.picker.children];
  let best = null;
  let bestDist = Infinity;
  for (const o of opts) {
    const r = o.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const d = Math.abs(cx - clientX);
    if (d < bestDist) {
      bestDist = d;
      best = o;
    }
  }
  if (!best) return;
  opts.forEach((o) => o.classList.remove("active"));
  best.classList.add("active");
  state.accentPicker.activeChar = best.dataset.char;
}

function closeAccentPicker() {
  if (!state.accentPicker) return;
  state.accentPicker.picker.remove();
  state.accentPicker = null;
}

/* ---------- Settings UI wiring ---------- */
function applyTheme() {
  document.body.classList.remove(
    "theme-light",
    "theme-dark",
    "theme-midnight",
    "theme-sunset",
    "theme-forest",
    "theme-candy",
  );
  document.body.classList.add("theme-" + state.settings.theme);
}

function bindSettings() {
  $("theme").value = state.settings.theme;
  $("layout").value = state.settings.layout;
  $("key-shape").value = state.settings.keyShape;
  $("font-size").value = state.settings.fontSize;
  $("font-size-value").textContent = state.settings.fontSize + "px";
  $("sound").checked = state.settings.sound;
  $("haptics").checked = state.settings.haptics;
  $("autocap").checked = state.settings.autocap;
  $("suggestions").checked = state.settings.suggestions;
  $("autospace").checked = state.settings.autospace;
  $("double-period").checked = state.settings.doublePeriod;

  $("theme").addEventListener("change", (e) => {
    state.settings.theme = e.target.value;
    applyTheme();
    saveSettings();
  });
  $("layout").addEventListener("change", (e) => {
    state.settings.layout = e.target.value;
    renderKeyboard();
    saveSettings();
  });
  $("key-shape").addEventListener("change", (e) => {
    state.settings.keyShape = e.target.value;
    renderKeyboard();
    saveSettings();
  });
  $("font-size").addEventListener("input", (e) => {
    state.settings.fontSize = parseInt(e.target.value, 10);
    $("font-size-value").textContent = state.settings.fontSize + "px";
    keyboard.style.setProperty("--kb-font-size", state.settings.fontSize + "px");
    saveSettings();
  });
  for (const id of [
    "sound",
    "haptics",
    "autocap",
    "suggestions",
    "autospace",
    "double-period",
  ]) {
    $(id).addEventListener("change", (e) => {
      const key =
        id === "double-period"
          ? "doublePeriod"
          : id === "key-shape"
            ? "keyShape"
            : id;
      state.settings[key] = e.target.checked;
      saveSettings();
      if (id === "autocap") setShift(autoShiftState());
      if (id === "suggestions") refreshSuggestions();
    });
  }

  $("reset-settings").addEventListener("click", () => {
    state.settings = { ...defaultSettings };
    saveSettings();
    bindSettings();
    applyTheme();
    renderKeyboard();
    setShift(autoShiftState());
    refreshSuggestions();
  });

  $("clear-text").addEventListener("click", () => {
    setText("", 0);
    setShift(autoShiftState());
    refreshSuggestions();
  });

  $("done-btn").addEventListener("click", () => {
    editor.blur();
  });
}

/* ---------- Suggestion bar wiring ---------- */
suggestionBar.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".suggestion");
  if (!btn) return;
  const word = btn.dataset.word;
  applySuggestion(word);
});

/* ---------- Keep editor focused & caret valid ---------- */
editor.addEventListener("blur", () => {
  setTimeout(() => editor.focus(), 0);
});
editor.addEventListener("keydown", (e) => {
  // Allow native arrow / selection navigation; block typing (use on-screen kb)
  if (e.key.length === 1) e.preventDefault();
  if (e.key === "Enter") {
    e.preventDefault();
    insert("\n");
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    backspace();
  }
});

/* ---------- Status bar clock ---------- */
function tickClock() {
  const t = new Date();
  const h = t.getHours();
  const m = t.getMinutes().toString().padStart(2, "0");
  $("status-time").textContent = `${((h + 11) % 12) + 1}:${m}`;
}
setInterval(tickClock, 30 * 1000);
tickClock();

/* ---------- Boot ---------- */
applyTheme();
bindSettings();
renderKeyboard();
setShift(autoShiftState());
refreshSuggestions();
editor.focus();
