import XCTest
@testable import SharedKeyboardCore

final class KeyboardReducerTests: XCTestCase {
  func testSingleShiftResetsAfterCharacterInsert() {
    var state = KeyboardState()

    KeyboardReducer.reduce(state: &state, action: .toggleShift(timestampMs: 1_000))
    KeyboardReducer.reduce(state: &state, action: .insertCharacter("a"))
    KeyboardReducer.reduce(state: &state, action: .insertCharacter("b"))

    XCTAssertEqual(state.text, "Ab")
    XCTAssertEqual(state.shiftMode, .off)
  }

  func testDoubleTapShiftEnablesCapsAndThirdTapDisables() {
    var state = KeyboardState()

    KeyboardReducer.reduce(state: &state, action: .toggleShift(timestampMs: 1_000))
    KeyboardReducer.reduce(state: &state, action: .toggleShift(timestampMs: 1_150))
    XCTAssertEqual(state.shiftMode, .caps)

    KeyboardReducer.reduce(state: &state, action: .toggleShift(timestampMs: 1_650))
    XCTAssertEqual(state.shiftMode, .off)
  }

  func testModeSwitchingTransitions() {
    var state = KeyboardState()

    KeyboardReducer.reduce(state: &state, action: .switchMode(.numbers))
    XCTAssertEqual(state.mode, .numbers)

    KeyboardReducer.reduce(state: &state, action: .toggleSymbols)
    XCTAssertEqual(state.mode, .symbols)

    KeyboardReducer.reduce(state: &state, action: .toggleSymbols)
    XCTAssertEqual(state.mode, .numbers)
  }

  func testApplySuggestionReplacesCurrentToken() {
    var state = KeyboardState(text: "say helo", cursor: 8)
    state.currentTokenRange = KeyboardState.tokenRange(in: state.text, cursor: state.cursor)

    KeyboardReducer.reduce(state: &state, action: .applySuggestion("hello"))
    XCTAssertEqual(state.text, "say hello")
    XCTAssertEqual(state.cursor, 9)
    XCTAssertEqual(state.currentToken, "hello")
  }
}
