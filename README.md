# Iphone-Keyboard
A highly customizable and useful keyboard for your iPhone.

## iOS App + Keyboard Extension

This repository now includes a native iOS implementation scaffold under `ios/` with:

- `IphoneKeyboardApp` (SwiftUI host demo app)
- `IphoneKeyboardExtension` (advanced keyboard extension target)
- `SharedKeyboardCore` (shared layouts, reducer, and suggestion/autocorrect engine)

### Requirements (macOS)

- Xcode 15+
- XcodeGen (`brew install xcodegen`)
- iOS Simulator runtime (iPhone 16 or adjust destination)

### Generate the Xcode Project

From repo root:

1. `cd ios`
2. `xcodegen generate --spec project.yml`

This generates/updates `ios/IphoneKeyboard.xcodeproj`.

### Build and Test

From repo root (on macOS):

1. Shared core tests  
   `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme SharedKeyboardCoreTests -destination 'platform=iOS Simulator,name=iPhone 16' test`

2. Host app build  
   `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardApp -destination 'platform=iOS Simulator,name=iPhone 16' build`

3. Keyboard extension build  
   `xcodebuild -project ios/IphoneKeyboard.xcodeproj -scheme IphoneKeyboardExtension -destination 'platform=iOS Simulator,name=iPhone 16' build`

### Run Host Demo App

1. Open `ios/IphoneKeyboard.xcodeproj` in Xcode.
2. Select `IphoneKeyboardApp` scheme.
3. Run on simulator.
4. Verify:
   - `teh` + space autocorrects to `the`
   - single shift one-shot uppercase
   - double-tap shift enables caps lock and shift tap disables it
   - mode switching between letters, numbers, and symbols
   - suggestion chip replacement (`helo` -> tap `hello`)

### Run Keyboard Extension in Simulator

1. Build and run `IphoneKeyboardApp` once.
2. Open **Settings** in simulator:
   - General -> Keyboard -> Keyboards -> Add New Keyboard...
   - choose `IphoneKeyboardExtension`
   - allow full access if prompted (for richer behavior testing)
3. Open Notes (or any text input field).
4. Switch to your custom keyboard (globe key).
5. Verify:
   - shift/caps behavior
   - number/symbol switching (`123`, `#+=`, `ABC`)
   - suggestion chip replacement for current token
   - aggressive autocorrect on space/return commit

### Known Prototype Limits

- Suggestion dictionary is intentionally small and local.
- Autocorrect is deterministic demo logic, not production NLP.
- Extension text replacement relies on proxy delete/insert flow for token correction.
