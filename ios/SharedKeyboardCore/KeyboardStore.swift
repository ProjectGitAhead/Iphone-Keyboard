import Foundation

@MainActor
public final class KeyboardStore: ObservableObject {
    @Published public private(set) var state: KeyboardState

    private let engine: SuggestionEngine

    public init(initialState: KeyboardState = KeyboardState(), engine: SuggestionEngine = SuggestionEngine()) {
        self.engine = engine
        state = initialState
        _ = KeyboardReducer.reduce(state: &state, action: .refreshSuggestions, engine: engine)
    }

    public func send(_ action: KeyboardAction) {
        _ = KeyboardReducer.reduce(state: &state, action: action, engine: engine)
    }
}
