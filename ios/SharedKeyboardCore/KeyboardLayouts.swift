import Foundation

public enum KeyboardLayouts {
    private static func charKey(_ char: Character, prefix: String) -> KeyboardKey {
        let value = String(char)
        return KeyboardKey(id: "\(prefix)-\(char)", label: value, kind: .character(value))
    }

    private static func actionKey(
        id: String,
        label: String,
        action: KeyboardActionType,
        width: KeyWidth = .wide
    ) -> KeyboardKey {
        KeyboardKey(id: id, label: label, width: width, kind: .action(action))
    }

    private static func modeKey(
        id: String,
        label: String,
        mode: KeyboardMode,
        width: KeyWidth = .wide
    ) -> KeyboardKey {
        KeyboardKey(id: id, label: label, width: width, kind: .mode(mode))
    }

    public static let letters: [[KeyboardKey]] = [
        Array("qwertyuiop").map { charKey($0, prefix: "letters") },
        Array("asdfghjkl").map { charKey($0, prefix: "letters") },
        [actionKey(id: "letters-shift", label: "shift", action: .shift)] +
            Array("zxcvbnm").map { charKey($0, prefix: "letters") } +
            [actionKey(id: "letters-delete", label: "delete", action: .backspace)],
        [
            modeKey(id: "letters-mode-numbers", label: "123", mode: .numbers),
            actionKey(id: "letters-space", label: "space", action: .space, width: .extraWide),
            actionKey(id: "letters-return", label: "return", action: .newLine),
        ],
    ]

    public static let numbers: [[KeyboardKey]] = [
        Array("1234567890").map { charKey($0, prefix: "numbers") },
        Array("-/:;()$&@\"").map { charKey($0, prefix: "numbers") },
        [actionKey(id: "numbers-toggle-symbols", label: "#+=", action: .toggleSymbols)] +
            Array(".,?!'").map { charKey($0, prefix: "numbers") } +
            [actionKey(id: "numbers-delete", label: "delete", action: .backspace)],
        [
            modeKey(id: "numbers-mode-letters", label: "ABC", mode: .letters),
            actionKey(id: "numbers-space", label: "space", action: .space, width: .extraWide),
            actionKey(id: "numbers-return", label: "return", action: .newLine),
        ],
    ]

    public static let symbols: [[KeyboardKey]] = [
        Array("[]{}#%^*+=").map { charKey($0, prefix: "symbols") },
        Array("_\\|~<>$`@").map { charKey($0, prefix: "symbols") },
        [actionKey(id: "symbols-toggle-numbers", label: "123", action: .toggleSymbols)] +
            Array(".,?!'").map { charKey($0, prefix: "symbols") } +
            [actionKey(id: "symbols-delete", label: "delete", action: .backspace)],
        [
            modeKey(id: "symbols-mode-letters", label: "ABC", mode: .letters),
            actionKey(id: "symbols-space", label: "space", action: .space, width: .extraWide),
            actionKey(id: "symbols-return", label: "return", action: .newLine),
        ],
    ]

    public static func rows(for mode: KeyboardMode) -> [[KeyboardKey]] {
        switch mode {
        case .letters:
            return letters
        case .numbers:
            return numbers
        case .symbols:
            return symbols
        }
    }
}
