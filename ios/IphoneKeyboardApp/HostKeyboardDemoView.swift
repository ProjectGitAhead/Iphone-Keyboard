import SwiftUI

struct HostKeyboardDemoView: View {
    @StateObject private var adapter = HostTextBufferAdapter()

    var body: some View {
        VStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Typed text")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                ScrollView {
                    Text(adapter.text.isEmpty ? "Start typing..." : adapter.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                }
                .frame(minHeight: 96, maxHeight: 160)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(uiColor: .secondarySystemBackground))
                )
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color(uiColor: .systemBackground))
            )

            SuggestionRail(
                suggestions: adapter.suggestions,
                onSelect: adapter.selectSuggestion(_:)
            )

            KeyboardGrid(
                state: adapter.state,
                onKeyTap: adapter.tapKey(_:)
            )
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.95, green: 0.97, blue: 1.0),
                    Color(red: 0.85, green: 0.89, blue: 0.98),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

struct SuggestionRail: View {
    let suggestions: [String]
    let onSelect: (String) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(suggestions.enumerated()), id: \.offset) { index, suggestion in
                    Button(action: { onSelect(suggestion) }) {
                        Text(suggestion)
                            .font(.subheadline.weight(.medium))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .frame(minWidth: 68)
                    }
                    .buttonStyle(.plain)
                    .background(
                        Capsule()
                            .fill(index == 0 ? Color.blue.opacity(0.15) : Color.white.opacity(0.9))
                    )
                    .overlay(
                        Capsule()
                            .stroke(index == 0 ? Color.blue.opacity(0.35) : Color.gray.opacity(0.3), lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 4)
        }
        .frame(height: 44)
    }
}

struct KeyboardGrid: View {
    let state: KeyboardState
    let onKeyTap: (KeyboardKey) -> Void

    var body: some View {
        let rows = KeyboardLayouts.keys(for: state.mode)
        VStack(spacing: 7) {
            ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                HStack(spacing: 6) {
                    ForEach(row) { key in
                        Button(action: { onKeyTap(key) }) {
                            Text(key.displayLabel(for: state))
                                .font(.system(size: 16, weight: key.textWeight))
                                .frame(maxWidth: .infinity)
                                .frame(height: 42)
                        }
                        .buttonStyle(.plain)
                        .frame(maxWidth: .infinity)
                        .layoutPriority(key.layoutPriority)
                        .background(
                            RoundedRectangle(cornerRadius: 9)
                                .fill(key.backgroundColor(for: state))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 9)
                                .stroke(Color.black.opacity(0.08), lineWidth: 1)
                        )
                    }
                }
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(red: 0.79, green: 0.82, blue: 0.9))
        )
    }
}

private extension KeyboardKey {
    func displayLabel(for state: KeyboardState) -> String {
        switch kind {
        case .character(let value):
            guard state.mode == .letters, value.range(of: "^[A-Za-z]$", options: .regularExpression) != nil else {
                return value
            }
            if state.shiftMode == .single || state.shiftMode == .caps {
                return value.uppercased()
            }
            return value.lowercased()
        case .action, .mode:
            return label
        }
    }

    var layoutPriority: Double {
        switch width {
        case .normal:
            return 1
        case .wide:
            return 1.25
        case .extraWide:
            return 2.2
        }
    }

    var textWeight: Font.Weight {
        switch kind {
        case .character:
            return .regular
        case .action, .mode:
            return .semibold
        }
    }

    func backgroundColor(for state: KeyboardState) -> Color {
        if case .action(.shift) = kind {
            if state.shiftMode == .caps {
                return Color.blue.opacity(0.35)
            }
            if state.shiftMode == .single {
                return Color.blue.opacity(0.2)
            }
        }

        switch kind {
        case .character:
            return Color.white.opacity(0.95)
        case .action, .mode:
            return Color(red: 0.88, green: 0.9, blue: 0.96)
        }
    }
}

#Preview {
    HostKeyboardDemoView()
}
