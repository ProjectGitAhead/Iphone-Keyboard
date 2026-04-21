import Foundation
import SharedKeyboardCore
import SwiftUI

@MainActor
final class HostTextBufferAdapter: ObservableObject {
    @Published private(set) var state: KeyboardState
    private let store: KeyboardStore

    init(store: KeyboardStore = KeyboardStore()) {
        self.store = store
        state = store.state
    }

    var displayText: String {
        state.text
    }

    var suggestions: [String] {
        state.suggestions
    }

    func tapKey(_ key: KeyboardKey) {
        switch key.kind {
        case .character(let value):
            store.send(.insertCharacter(value))
        case .action(let actionType):
            switch actionType {
            case .shift:
                store.send(.toggleShift(timestampMs: Int(Date().timeIntervalSince1970 * 1000)))
            case .backspace:
                store.send(.deleteBackward)
            case .space:
                store.send(.insertSpace)
            case .newLine:
                store.send(.insertReturn)
            case .toggleSymbols:
                store.send(.toggleSymbols)
            }
        case .mode(let mode):
            store.send(.switchMode(mode))
        }
        state = store.state
    }

    func selectSuggestion(_ suggestion: String) {
        store.send(.applySuggestion(suggestion))
        state = store.state
    }
}
