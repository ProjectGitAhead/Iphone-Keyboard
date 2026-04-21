# iOS App + Advanced Keyboard Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native SwiftUI iOS app plus an advanced keyboard extension with shared logic for state, layouts, suggestions, and autocorrect behavior.

**Architecture:** A single Xcode project contains app and extension targets sharing `SharedKeyboardCore` Swift sources. Shared reducer/state/layout/suggestion modules enforce behavior parity, while target-specific adapters render UI and commit text (`TextField` for app, `textDocumentProxy` for extension).

**Tech Stack:** Swift, SwiftUI, UIKit (`UIInputViewController`), XCTest, Xcode project targets.

---

## File Structure

- Create: `ios/IphoneKeyboard.xcodeproj` and target folders
- Create: `ios/SharedKeyboardCore/KeyboardModels.swift`
- Create: `ios/SharedKeyboardCore/KeyboardLayouts.swift`
- Create: `ios/SharedKeyboardCore/SuggestionEngine.swift`
- Create: `ios/SharedKeyboardCore/KeyboardReducer.swift`
- Create: `ios/SharedKeyboardCore/KeyboardStore.swift`
- Create: `ios/IphoneKeyboardApp/IphoneKeyboardApp.swift`
- Create: `ios/IphoneKeyboardApp/HostKeyboardDemoView.swift`
- Create: `ios/IphoneKeyboardApp/HostTextBufferAdapter.swift`
- Create: `ios/IphoneKeyboardExtension/KeyboardViewController.swift`
- Create: `ios/IphoneKeyboardExtension/ExtensionKeyboardRootView.swift`
- Create: `ios/IphoneKeyboardExtension/ProxyTextAdapter.swift`
- Create: `ios/SharedKeyboardCoreTests/SuggestionEngineTests.swift`
- Create: `ios/SharedKeyboardCoreTests/KeyboardReducerTests.swift`
- Modify: `README.md`

## Task 1: Scaffold Xcode project with app + extension targets

**Files:**
- Create: `ios/IphoneKeyboard.xcodeproj/*`
- Create: `ios/IphoneKeyboardApp/*`
- Create: `ios/IphoneKeyboardExtension/*`

- [ ] **Step 1: Create baseline project structure**

Create folders and placeholder files:
- `ios/IphoneKeyboardApp`
- `ios/IphoneKeyboardExtension`
- `ios/SharedKeyboardCore`
- `ios/SharedKeyboardCoreTests`

- [ ] **Step 2: Generate project and targets**

Use Xcode tooling (or equivalent project generation) to create:
- iOS App target: `IphoneKeyboardApp`
- Keyboard Extension target: `IphoneKeyboardExtension`

Ensure deployment target and signing placeholders are configured for simulator/dev testing.

- [ ] **Step 3: Verify project can build empty targets**

Run: `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardApp -destination 'platform=iOS Simulator,name=iPhone 16' build`  
Expected: BUILD SUCCEEDED.

Run: `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardExtension -destination 'platform=iOS Simulator,name=iPhone 16' build`  
Expected: BUILD SUCCEEDED.

- [ ] **Step 4: Commit**

```bash
git add ios/IphoneKeyboard.xcodeproj ios/IphoneKeyboardApp ios/IphoneKeyboardExtension
git commit -m "feat: scaffold ios app and keyboard extension targets"
```

## Task 2: Implement shared keyboard domain core (TDD)

**Files:**
- Create: `ios/SharedKeyboardCore/KeyboardModels.swift`
- Create: `ios/SharedKeyboardCore/KeyboardLayouts.swift`
- Create: `ios/SharedKeyboardCore/SuggestionEngine.swift`
- Create: `ios/SharedKeyboardCore/KeyboardReducer.swift`
- Test: `ios/SharedKeyboardCoreTests/SuggestionEngineTests.swift`
- Test: `ios/SharedKeyboardCoreTests/KeyboardReducerTests.swift`

- [ ] **Step 1: Write failing suggestion tests**

Add tests for:
- `suggestions(for: "helo").first == "hello"`
- `autocorrectCommit("teh") == "the"`
- short partial tokens do not over-correct.

- [ ] **Step 2: Run tests and verify red**

Run: `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme SharedKeyboardCoreTests -destination 'platform=iOS Simulator,name=iPhone 16' test`  
Expected: FAIL due to missing suggestion engine implementation.

- [ ] **Step 3: Implement suggestion engine minimally**

Implement dictionary/ranking/autocorrect map logic in `SuggestionEngine.swift`:
- weighted scoring for prefix + typo similarity
- aggressive map for known typo
- top 3 results.

- [ ] **Step 4: Write failing reducer tests**

Add tests for:
- single shift one-shot reset
- double-tap shift transitions to caps and exits caps
- mode switch letters/numbers/symbols
- suggestion replace range handling.

- [ ] **Step 5: Run tests and verify red**

Run same test command; expected failing reducer assertions.

- [ ] **Step 6: Implement reducer and models minimally**

Implement:
- `KeyboardState` model
- key/action enums
- reducer transition logic
- token-range helpers.

- [ ] **Step 7: Run tests and verify green**

Run: `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme SharedKeyboardCoreTests -destination 'platform=iOS Simulator,name=iPhone 16' test`  
Expected: PASS for all new shared core tests.

- [ ] **Step 8: Commit**

```bash
git add ios/SharedKeyboardCore ios/SharedKeyboardCoreTests
git commit -m "feat: add shared keyboard core state layouts and suggestion engine"
```

## Task 3: Build host app SwiftUI demo using shared core

**Files:**
- Create: `ios/IphoneKeyboardApp/IphoneKeyboardApp.swift`
- Create: `ios/IphoneKeyboardApp/HostKeyboardDemoView.swift`
- Create: `ios/IphoneKeyboardApp/HostTextBufferAdapter.swift`

- [ ] **Step 1: Implement host store + adapter**

Implement local buffer adapter that:
- applies reducer actions
- exposes rendered text + current token suggestions
- supports replace-current-token path.

- [ ] **Step 2: Build keyboard UI in SwiftUI**

Create reusable keyboard rows and keys with:
- shift active/caps visual state
- mode buttons (`123`, `#+=`, `ABC`)
- suggestion chip rail above keys.

- [ ] **Step 3: Wire key taps to shared reducer**

Map UI taps to shared actions:
- insert char, delete, space, return
- toggle shift/caps behavior
- mode switching
- suggestion chip replacement.

- [ ] **Step 4: Verify host app run**

Run:
`xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardApp -destination 'platform=iOS Simulator,name=iPhone 16' build`
Expected: BUILD SUCCEEDED.

Manual:
- launch app in simulator
- confirm `teh + space -> the`
- confirm `helo` suggests `hello`.

- [ ] **Step 5: Commit**

```bash
git add ios/IphoneKeyboardApp
git commit -m "feat: add swiftui host keyboard demo app"
```

## Task 4: Build advanced keyboard extension with adaptive height

**Files:**
- Create: `ios/IphoneKeyboardExtension/KeyboardViewController.swift`
- Create: `ios/IphoneKeyboardExtension/ExtensionKeyboardRootView.swift`
- Create: `ios/IphoneKeyboardExtension/ProxyTextAdapter.swift`

- [ ] **Step 1: Implement extension text adapter**

Wrap `textDocumentProxy` operations:
- insert text
- delete backward
- replace token by delete/insert sequence
- delimiter commit (space/return).

- [ ] **Step 2: Host SwiftUI keyboard inside `UIInputViewController`**

Create controller that embeds `UIHostingController` root view and shared store.

- [ ] **Step 3: Implement adaptive keyboard height**

Set constraints/size logic for compact vs expanded heights so suggestions remain visible.

- [ ] **Step 4: Wire shared actions to proxy adapter**

Ensure same behavior as host:
- shift/caps, modes, suggestions, autocorrect on commit.

- [ ] **Step 5: Verify extension build**

Run:
`xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardExtension -destination 'platform=iOS Simulator,name=iPhone 16' build`
Expected: BUILD SUCCEEDED.

- [ ] **Step 6: Manual simulator extension verification**

Manual flow:
- enable keyboard in Settings
- use in Notes/text input
- validate shift/caps, mode switching, suggestion tap replacement, autocorrect commit.

- [ ] **Step 7: Commit**

```bash
git add ios/IphoneKeyboardExtension
git commit -m "feat: implement advanced keyboard extension with adaptive layout"
```

## Task 5: Integration hardening, docs, and evidence

**Files:**
- Modify: `README.md`
- Verify: `ios/*`

- [ ] **Step 1: Add setup and usage docs**

Document:
- opening project
- running host app
- enabling and testing extension
- known limits (prototype dictionary/autocorrect quality).

- [ ] **Step 2: Run targeted full verification**

Run:
`xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme SharedKeyboardCoreTests -destination 'platform=iOS Simulator,name=iPhone 16' test`

Run:
`xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardApp -destination 'platform=iOS Simulator,name=iPhone 16' build`

Run:
`xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardExtension -destination 'platform=iOS Simulator,name=iPhone 16' build`

Expected: all pass.

- [ ] **Step 3: Capture walkthrough artifacts**

Capture at minimum:
- host app demo (video)
- extension typing demo (video or screenshots)

- [ ] **Step 4: Commit and push**

```bash
git add README.md ios
git commit -m "docs: add ios app and extension setup plus final validation"
git push -u origin cursor/iphone-keyboard-advanced-prototype-1866
```
