import XCTest
@testable import SharedKeyboardCore

final class SuggestionEngineTests: XCTestCase {
    private let engine = SuggestionEngine()

    func testHeloRanksHelloFirst() {
        let suggestions = engine.suggestions(for: "helo")
        XCTAssertEqual(suggestions.first, "hello")
    }

    func testAggressiveAutocorrectTehToThe() {
        XCTAssertEqual(
            engine.autocorrectCommit(token: "teh"),
            "the"
        )
    }

    func testShortTokenDoesNotAutocorrect() {
        XCTAssertEqual(
            engine.autocorrectCommit(token: "th"),
            "th"
        )
    }

    func testUnknownTokenUnchanged() {
        XCTAssertEqual(
            engine.autocorrectCommit(token: "zzqx"),
            "zzqx"
        )
    }
}
