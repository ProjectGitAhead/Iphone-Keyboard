# iOS App + Advanced Keyboard Extension Design

## Overview

Build a native iOS solution that includes both:

1. A standalone SwiftUI host app demonstrating the custom keyboard UX.
2. A production-oriented keyboard extension target with advanced behavior parity.

The system will share a common keyboard engine so host app and extension stay behaviorally aligned.

## Goals

1. Deliver a native SwiftUI app with an in-app keyboard demo.
2. Deliver an advanced keyboard extension target (not just scaffold).
3. Maintain logic parity through shared core modules.
4. Support adaptive extension layout height with visible suggestions.

## Non-goals

1. Shipping to App Store in this pass.
2. Cloud sync, user accounts, or remote personalization.
3. Full NLP-grade autocorrect quality.

## Architecture

The implementation uses one Xcode project with two targets and a shared source group:

- `IphoneKeyboardApp` (SwiftUI iOS app target)
- `IphoneKeyboardExtension` (custom keyboard extension target)
- `SharedKeyboardCore` (shared Swift sources compiled into both targets)

### SharedKeyboardCore responsibilities

- Keyboard state model:
  - text/session buffer
  - cursor position
  - mode (`letters | numbers | symbols`)
  - shift mode (`off | single | caps`)
  - current token range
- Key layout definitions:
  - letters rows
  - numbers rows
  - symbols rows
  - width metadata and semantic action keys
- Suggestion and autocorrect engine:
  - dictionary + scoring
  - aggressive correction map (`teh -> the`)
  - top suggestion ranking for typo tokens like `helo -> hello`
- Reducer/action dispatcher:
  - key tap -> state transition
  - text insertion/deletion primitives

### Host app responsibilities

- Render keyboard preview surface and typed text display.
- Render suggestion chips and keyboard panel in SwiftUI.
- Use shared reducer and state directly.
- Provide debug-friendly behavior mirror for extension parity checks.

### Extension responsibilities

- `UIInputViewController` hosts SwiftUI keyboard UI.
- Adaptive height strategy for keyboard container and suggestions row.
- Uses shared core for state/actions while committing output via `textDocumentProxy`.
- Handles token replacement by deleting current token and reinserting corrected text.

## Interaction and Behavior Requirements

Both host app and extension must support:

1. **Single shift**: one uppercase character then reset to `off`.
2. **Double-tap shift**: enter caps lock; next shift tap exits caps lock.
3. **Mode switching**: letters <-> numbers <-> symbols.
4. **Core editing keys**: backspace, space, return.
5. **Suggestions**: top chips update from current token; tap replaces current token.
6. **Aggressive autocorrect**: on space/return commit, replace token when strong candidate exists.

## Extension Data Flow

Because extension cannot directly own host text field state:

1. Keep a local session buffer in extension state.
2. On key actions, update local state through shared reducer.
3. Mirror edits to `textDocumentProxy`:
   - char insert -> `insertText`
   - delete -> `deleteBackward`
   - suggestion/autocorrect replace:
     - delete token length
     - insert corrected token
     - insert delimiter (space/return) when action requires
4. Recompute suggestions after each mutation.

## UI Design

### Shared visual language

- iOS-like keycaps, control key styling, active shift/caps indicators.
- Suggestion rail above keys with tappable rounded chips.
- Distinct visual affordance for mode keys (`123`, `#+=`, `ABC`).

### Adaptive extension height (Option B)

- Keyboard view calculates compact vs expanded heights by available width class and dynamic type.
- Suggestions rail remains visible without clipping in both states.
- Safe-area aware bottom spacing.

## Error Handling

1. Invalid mode switch requests are ignored.
2. Suggestion replacement with invalid token range is safely skipped.
3. Proxy insertion/deletion failures degrade gracefully (no crash; state remains consistent).
4. Empty token yields no suggestion chips.

## Project Structure

- `ios/IphoneKeyboard.xcodeproj`
- `ios/IphoneKeyboardApp/*`
- `ios/IphoneKeyboardExtension/*`
- `ios/SharedKeyboardCore/*`
- `ios/SharedKeyboardCoreTests/*`
- `README.md` (append iOS setup and extension enable steps)

## Testing Plan

### Automated

- Shared core unit tests:
  - shift/caps transitions
  - mode transitions
  - suggestion ranking (`helo` -> `hello` top)
  - autocorrect commit behavior (`teh` -> `the`)
  - token replacement boundaries

### Manual

1. Host app simulator run:
   - verify advanced typing behavior end-to-end.
2. Keyboard extension simulator run:
   - enable custom keyboard in Settings
   - type in Notes or text field
   - verify shift/caps, mode switch, suggestions, autocorrect.
3. Capture walkthrough artifact(s) showing successful host + extension behavior.

## Risks and Mitigations

1. **Extension text context mismatch**
   - Mitigation: source-of-truth token tracking in shared state; deterministic replace routine.
2. **Behavior drift between app and extension**
   - Mitigation: one shared reducer and shared layout definitions.
3. **Layout clipping in extension**
   - Mitigation: adaptive height constraints + simulator checks across device sizes.
