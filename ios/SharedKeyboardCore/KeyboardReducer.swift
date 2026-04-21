import Foundation

public enum KeyboardReducer {
    private static let shiftDoubleTapThresholdMs = 350

    public static func action(for key: KeyboardKey, timestampMs: Int? = nil) -> KeyboardAction {
        switch key.kind {
        case .character(let value):
            return .insertCharacter(value)
        case .mode(let mode):
            return .switchMode(mode)
        case .action(let type):
            switch type {
            case .shift:
                return .toggleShift(timestampMs: timestampMs)
            case .backspace:
                return .deleteBackward
            case .space:
                return .insertSpace
            case .newLine:
                return .insertReturn
            case .toggleSymbols:
                return .toggleSymbols
            }
        }
    }

    @discardableResult
    public static func reduce(
        state: inout KeyboardState,
        action: KeyboardAction,
        engine: SuggestionEngine = SuggestionEngine()
    ) -> [KeyboardCommand] {
        var commands: [KeyboardCommand] = []

        switch action {
        case .insertCharacter(let rawValue):
            let value = transformedCharacter(rawValue, shiftMode: state.shiftMode)
            insertText(value, into: &state)
            commands.append(.insert(value))
            if state.shiftMode == .single {
                state.shiftMode = .off
            }
            refreshSuggestions(state: &state, engine: engine)

        case .deleteBackward:
            guard state.cursor > 0 else {
                refreshSuggestions(state: &state, engine: engine)
                return commands
            }
            let start = state.text.index(state.text.startIndex, offsetBy: state.cursor - 1)
            let end = state.text.index(state.text.startIndex, offsetBy: state.cursor)
            state.text.replaceSubrange(start..<end, with: "")
            state.cursor -= 1
            commands.append(.deleteBackward(1))
            refreshSuggestions(state: &state, engine: engine)

        case .insertSpace:
            autocorrectAndCommitDelimiter(state: &state, delimiter: " ", engine: engine, commands: &commands)

        case .insertReturn:
            autocorrectAndCommitDelimiter(state: &state, delimiter: "\n", engine: engine, commands: &commands)

        case .toggleShift(let timestampMs):
            let now = timestampMs ?? Int(Date().timeIntervalSince1970 * 1000)
            switch state.shiftMode {
            case .caps:
                state.shiftMode = .off
                state.lastShiftTapTimestampMs = nil
            case .off:
                state.shiftMode = .single
                state.lastShiftTapTimestampMs = now
            case .single:
                if let previous = state.lastShiftTapTimestampMs, now - previous <= shiftDoubleTapThresholdMs {
                    state.shiftMode = .caps
                    state.lastShiftTapTimestampMs = nil
                } else {
                    state.shiftMode = .single
                    state.lastShiftTapTimestampMs = now
                }
            }

        case .setCapsLock(let enabled):
            state.shiftMode = enabled ? .caps : .off
            state.lastShiftTapTimestampMs = nil

        case .switchMode(let mode):
            state.mode = mode

        case .toggleSymbols:
            state.mode = state.mode == .symbols ? .numbers : .symbols

        case .applySuggestion(let suggestion):
            let oldCount = state.currentToken.count
            state.replaceCurrentToken(with: suggestion)
            commands.append(.replaceCurrentToken(originalCount: oldCount, replacement: suggestion))
            refreshSuggestions(state: &state, engine: engine)

        case .refreshSuggestions:
            refreshSuggestions(state: &state, engine: engine)
        }

        return commands
    }

    private static func transformedCharacter(_ value: String, shiftMode: ShiftMode) -> String {
        guard value.count == 1, value.range(of: "^[A-Za-z]$", options: .regularExpression) != nil else {
            return value
        }
        switch shiftMode {
        case .off:
            return value.lowercased()
        case .single, .caps:
            return value.uppercased()
        }
    }

    private static func insertText(_ value: String, into state: inout KeyboardState) {
        let insertion = state.text.index(state.text.startIndex, offsetBy: state.cursor)
        state.text.insert(contentsOf: value, at: insertion)
        state.cursor += value.count
    }

    private static func refreshSuggestions(state: inout KeyboardState, engine: SuggestionEngine) {
        state.recomputeTokenRange()
        state.suggestions = engine.suggestions(for: state.currentToken)
    }

    private static func autocorrectAndCommitDelimiter(
        state: inout KeyboardState,
        delimiter: String,
        engine: SuggestionEngine,
        commands: inout [KeyboardCommand]
    ) {
        state.recomputeTokenRange()
        let token = state.currentToken
        let corrected = engine.autocorrectCommit(token: token)
        if !token.isEmpty, corrected != token {
            let oldCount = token.count
            state.replaceCurrentToken(with: corrected)
            commands.append(.replaceCurrentToken(originalCount: oldCount, replacement: corrected))
        }
        insertText(delimiter, into: &state)
        commands.append(.insert(delimiter))
        refreshSuggestions(state: &state, engine: engine)
    }
}
