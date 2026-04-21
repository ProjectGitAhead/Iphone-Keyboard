import SwiftUI

struct ExtensionKeyboardRootView: View {
    @ObservedObject var adapter: ProxyTextAdapter
    let onAdvanceToNextInputMode: (() -> Void)?

    private var state: KeyboardState {
        adapter.state
    }

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 6) {
                if let onAdvanceToNextInputMode {
                    Button(action: onAdvanceToNextInputMode) {
                        Image(systemName: "globe")
                            .font(.system(size: 18, weight: .semibold))
                            .frame(width: 40, height: 30)
                    }
                    .buttonStyle(.plain)
                    .background(Color.white.opacity(0.9))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(Array(state.suggestions.enumerated()), id: \.offset) { _, suggestion in
                            Button(action: {
                                adapter.handle(action: .applySuggestion(suggestion))
                            }) {
                                Text(suggestion)
                                    .font(.system(size: 14, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.white.opacity(0.92))
                                    .foregroundStyle(Color.black.opacity(0.78))
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            VStack(spacing: 6) {
                ForEach(Array(KeyboardLayouts.rows(for: state.mode).enumerated()), id: \.offset) { _, row in
                    HStack(spacing: 6) {
                        ForEach(row) { key in
                            keyButton(for: key)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.top, 8)
        .padding(.bottom, 12)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                colors: [Color(red: 0.84, green: 0.87, blue: 0.93), Color(red: 0.76, green: 0.80, blue: 0.89)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    private func keyButton(for key: KeyboardKey) -> some View {
        Button(action: { handleKeyTap(key) }) {
            Text(key.displayLabel(for: state))
                .font(.system(size: 17, weight: key.textWeight))
                .frame(maxWidth: .infinity, minHeight: 44)
        }
        .buttonStyle(.plain)
        .padding(.horizontal, horizontalPadding(for: key.width))
        .background(backgroundColor(for: key))
        .foregroundStyle(Color.black.opacity(0.78))
        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
    }

    private func backgroundColor(for key: KeyboardKey) -> Color {
        if case .action(.shift) = key.kind {
            switch state.shiftMode {
            case .off:
                return Color.white.opacity(0.95)
            case .single:
                return Color(red: 0.73, green: 0.80, blue: 0.95)
            case .caps:
                return Color(red: 0.56, green: 0.68, blue: 0.95)
            }
        }

        if key.isControlKey {
            return Color(red: 0.86, green: 0.89, blue: 0.94)
        }

        return Color.white.opacity(0.95)
    }

    private func horizontalPadding(for width: KeyWidth) -> CGFloat {
        switch width {
        case .normal:
            return 0
        case .wide:
            return 8
        case .extraWide:
            return 18
        }
    }

    private func handleKeyTap(_ key: KeyboardKey) {
        let action = KeyboardReducer.action(
            for: key,
            timestampMs: Int(Date().timeIntervalSince1970 * 1000)
        )
        adapter.handle(action: action)
    }
}
