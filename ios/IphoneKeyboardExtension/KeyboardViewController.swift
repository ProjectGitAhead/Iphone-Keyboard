import SwiftUI
import UIKit

@MainActor
final class KeyboardViewController: UIInputViewController {
    private let store = KeyboardStore()
    private lazy var adapter = ProxyTextAdapter(proxy: textDocumentProxy, store: store)
    private var hostingController: UIHostingController<ExtensionKeyboardRootView>?
    private var heightConstraint: NSLayoutConstraint?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupAdaptiveContainer()
        embedKeyboardView()
    }

    override func textDidChange(_ textInput: UITextInput?) {
        super.textDidChange(textInput)
        adapter.syncFromProxyContext()
    }

    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        updateAdaptiveHeight()
    }

    private func setupAdaptiveContainer() {
        view.translatesAutoresizingMaskIntoConstraints = false
        let constraint = view.heightAnchor.constraint(equalToConstant: adaptiveHeight(for: traitCollection))
        constraint.priority = .defaultHigh
        constraint.isActive = true
        heightConstraint = constraint
    }

    private func embedKeyboardView() {
        let root = ExtensionKeyboardRootView(adapter: adapter) { [weak self] in
            self?.advanceToNextInputMode()
        }

        let host = UIHostingController(rootView: root)
        addChild(host)
        host.view.translatesAutoresizingMaskIntoConstraints = false
        host.view.backgroundColor = .clear
        view.addSubview(host.view)

        NSLayoutConstraint.activate([
            host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            host.view.topAnchor.constraint(equalTo: view.topAnchor),
            host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        host.didMove(toParent: self)
        hostingController = host
    }

    private func updateAdaptiveHeight() {
        heightConstraint?.constant = adaptiveHeight(for: traitCollection)
    }

    private func adaptiveHeight(for traits: UITraitCollection) -> CGFloat {
        if traits.verticalSizeClass == .compact {
            return 240
        }
        if traits.preferredContentSizeCategory.isAccessibilityCategory {
            return 360
        }
        return 320
    }
}
