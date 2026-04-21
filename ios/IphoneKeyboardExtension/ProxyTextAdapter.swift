import UIKit
import SharedKeyboardCore

@MainActor
final class ProxyTextAdapter: ObservableObject {
    private weak var proxy: UITextDocumentProxy?
    private let store: KeyboardStore

    @Published private(set) var state: KeyboardState

    init(proxy: UITextDocumentProxy, store: KeyboardStore) {
        self.proxy = proxy
        self.store = store
        state = store.state
        syncFromProxyContext()
    }

    func syncFromProxyContext() {
        guard let proxy else { return }
        let context = proxy.documentContextBeforeInput ?? ""
        var refreshed = KeyboardState(text: context, cursor: context.count, mode: state.mode, shiftMode: state.shiftMode)
        refreshed.recomputeTokenRange()
        state = refreshed
        state = store.state
    }

    func handle(action: KeyboardAction) {
        switch action {
        case .insertCharacter(let value):
            let payload = shiftedCharacter(for: value)
            proxy?.insertText(payload)
        case .deleteBackward:
            proxy?.deleteBackward()
        case .insertSpace:
            commitWithDelimiter(" ")
        case .insertReturn:
            commitWithDelimiter("\n")
        case .applySuggestion(let suggestion):
            let tokenLength = state.currentToken.count
            replaceCurrentToken(tokenLength: tokenLength, replacement: suggestion)
        case .toggleShift, .setCapsLock, .switchMode, .toggleSymbols, .refreshSuggestions:
            break
        }

        store.send(action)
        state = store.state
    }

    private func commitWithDelimiter(_ delimiter: String) {
        let token = state.currentToken
        let corrected = SuggestionEngine().autocorrectCommit(token: token)
        if !token.isEmpty, corrected != token {
            replaceCurrentToken(tokenLength: token.count, replacement: corrected)
            store.send(.applySuggestion(corrected))
        }
        proxy?.insertText(delimiter)
    }

    private func shiftedCharacter(for value: String) -> String {
        guard value.count == 1, value.range(of: "^[A-Za-z]$", options: .regularExpression) != nil else {
            return value
        }
        switch state.shiftMode {
        case .off:
            return value.lowercased()
        case .single, .caps:
            return value.uppercased()
        }
    }

    private func replaceCurrentToken(tokenLength: Int, replacement: String) {
        guard tokenLength > 0 else { return }
        for _ in 0..<tokenLength {
            proxy?.deleteBackward()
        }
        proxy?.insertText(replacement)
    }
}
