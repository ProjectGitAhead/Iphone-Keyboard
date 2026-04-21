import Foundation

public enum KeyboardMode: String, CaseIterable {
    case letters
    case numbers
    case symbols
}

public enum ShiftMode: String {
    case off
    case single
    case caps
}

public enum KeyWidth: String {
    case normal
    case wide
    case extraWide
}

public struct KeyboardTokenRange: Equatable {
    public var start: Int
    public var end: Int

    public init(start: Int, end: Int) {
        self.start = start
        self.end = end
    }
}

public enum KeyboardActionType: String, Equatable {
    case shift
    case backspace
    case space
    case newLine
    case toggleSymbols
}

public enum KeyKind: Equatable {
    case character(String)
    case action(KeyboardActionType)
    case mode(KeyboardMode)
}

public struct KeyboardKey: Identifiable, Equatable {
    public let id: String
    public let label: String
    public let width: KeyWidth
    public let kind: KeyKind

    public init(id: String, label: String, width: KeyWidth = .normal, kind: KeyKind) {
        self.id = id
        self.label = label
        self.width = width
        self.kind = kind
    }
}

public struct KeyboardState: Equatable {
    public var text: String
    public var cursor: Int
    public var mode: KeyboardMode
    public var shiftMode: ShiftMode
    public var currentTokenRange: KeyboardTokenRange
    public var suggestions: [String]
    public var lastShiftTapTimestampMs: Int?

    public init(
        text: String = "",
        cursor: Int = 0,
        mode: KeyboardMode = .letters,
        shiftMode: ShiftMode = .off,
        currentTokenRange: KeyboardTokenRange = KeyboardTokenRange(start: 0, end: 0),
        suggestions: [String] = [],
        lastShiftTapTimestampMs: Int? = nil
    ) {
        self.text = text
        self.cursor = cursor
        self.mode = mode
        self.shiftMode = shiftMode
        self.currentTokenRange = currentTokenRange
        self.suggestions = suggestions
        self.lastShiftTapTimestampMs = lastShiftTapTimestampMs
    }

    public var currentToken: String {
        guard currentTokenRange.start < currentTokenRange.end else {
            return ""
        }
        let startIndex = text.index(text.startIndex, offsetBy: currentTokenRange.start)
        let endIndex = text.index(text.startIndex, offsetBy: currentTokenRange.end)
        return String(text[startIndex..<endIndex])
    }

    public mutating func recomputeTokenRange() {
        currentTokenRange = Self.tokenRange(in: text, cursor: cursor)
    }

    public mutating func replaceCurrentToken(with replacement: String) {
        guard currentTokenRange.start <= currentTokenRange.end else { return }
        guard currentTokenRange.end <= text.count else { return }
        let startIndex = text.index(text.startIndex, offsetBy: currentTokenRange.start)
        let endIndex = text.index(text.startIndex, offsetBy: currentTokenRange.end)
        text.replaceSubrange(startIndex..<endIndex, with: replacement)
        cursor = currentTokenRange.start + replacement.count
        recomputeTokenRange()
    }

    public static func tokenRange(in text: String, cursor: Int) -> KeyboardTokenRange {
        let boundedCursor = max(0, min(cursor, text.count))
        var start = boundedCursor
        var end = boundedCursor

        while start > 0 {
            let index = text.index(text.startIndex, offsetBy: start - 1)
            if text[index].isWhitespace {
                break
            }
            start -= 1
        }

        while end < text.count {
            let index = text.index(text.startIndex, offsetBy: end)
            if text[index].isWhitespace {
                break
            }
            end += 1
        }

        return KeyboardTokenRange(start: start, end: end)
    }
}

public enum KeyboardAction: Equatable {
    case insertCharacter(String)
    case deleteBackward
    case insertSpace
    case insertReturn
    case toggleShift(timestampMs: Int?)
    case setCapsLock(Bool)
    case switchMode(KeyboardMode)
    case toggleSymbols
    case applySuggestion(String)
    case refreshSuggestions
}

public enum KeyboardCommand: Equatable {
    case insert(String)
    case deleteBackward(Int)
    case replaceCurrentToken(originalCount: Int, replacement: String)
}

public struct KeyboardTransition: Equatable {
    public let state: KeyboardState
    public let commands: [KeyboardCommand]
}
