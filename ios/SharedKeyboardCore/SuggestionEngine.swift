import Foundation

public struct SuggestionEngine {
    public static let sharedDictionary: [String] = [
        "the", "there", "their", "then", "them",
        "hello", "keyboard", "iphone", "suggestion", "typing",
    ]

    private static let wordPriority: [String: Double] = [
        "the": 1.0,
        "there": 0.9,
        "their": 0.8,
        "then": 0.2,
        "them": 0.1,
    ]

    private static let aggressiveCorrections: [String: String] = ["teh": "the"]
    private static let minimumAutocorrectTokenLength = 3
    private static let prefixWeight = 2.0
    private static let typoWeight = 0.7
    private static let priorityWeight = 0.2

    private let dictionary: [String]

    public init(dictionary: [String] = sharedDictionary) {
        self.dictionary = dictionary
    }

    public func suggestions(for token: String, limit: Int = 3) -> [String] {
        let normalized = token.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalized.isEmpty else { return [] }

        return dictionary
            .map { word in (word: word, score: combinedScore(input: normalized, candidate: word.lowercased())) }
            .sorted { lhs, rhs in
                if lhs.score == rhs.score { return lhs.word < rhs.word }
                return lhs.score > rhs.score
            }
            .prefix(limit)
            .map(\.word)
    }

    public func autocorrectCommit(token: String) -> String {
        guard !token.isEmpty else { return token }
        let normalized = token.lowercased()

        if let mapped = Self.aggressiveCorrections[normalized] {
            return applyCasePattern(from: token, to: mapped)
        }

        guard normalized.count >= Self.minimumAutocorrectTokenLength else { return token }
        guard let bestSuggestion = suggestions(for: normalized, limit: 1).first else { return token }

        let suggestionLower = bestSuggestion.lowercased()
        let isPartialPrefix = suggestionLower.hasPrefix(normalized) && suggestionLower.count > normalized.count
        if isPartialPrefix { return token }

        let currentScore = combinedScore(input: normalized, candidate: normalized)
        let bestScore = combinedScore(input: normalized, candidate: suggestionLower)
        guard bestScore > currentScore else { return token }

        return applyCasePattern(from: token, to: bestSuggestion)
    }

    private func combinedScore(input: String, candidate: String) -> Double {
        let prefix = prefixScore(input: input, candidate: candidate)
        let typo = typoSimilarity(input: input, candidate: candidate)
        let priority = Self.wordPriority[candidate] ?? 0
        return (prefix * Self.prefixWeight) + (typo * Self.typoWeight) + (priority * Self.priorityWeight)
    }

    private func prefixScore(input: String, candidate: String) -> Double {
        guard !input.isEmpty else { return 0 }
        return candidate.hasPrefix(input) ? 1.0 : 0.0
    }

    private func typoSimilarity(input: String, candidate: String) -> Double {
        let distance = Double(levenshteinDistance(input, candidate))
        let maxLength = Double(max(input.count, candidate.count))
        guard maxLength > 0 else { return 1 }
        var similarity = 1 - (distance / maxLength)
        if hasSingleAdjacentSwap(input: input, candidate: candidate) {
            similarity += 0.5
        }
        return similarity
    }

    private func levenshteinDistance(_ lhs: String, _ rhs: String) -> Int {
        let a = Array(lhs)
        let b = Array(rhs)
        var matrix = Array(repeating: Array(repeating: 0, count: b.count + 1), count: a.count + 1)

        for i in 0 ... a.count { matrix[i][0] = i }
        for j in 0 ... b.count { matrix[0][j] = j }

        for i in 1 ... a.count {
            for j in 1 ... b.count {
                let cost = a[i - 1] == b[j - 1] ? 0 : 1
                matrix[i][j] = min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                )
            }
        }

        return matrix[a.count][b.count]
    }

    private func hasSingleAdjacentSwap(input: String, candidate: String) -> Bool {
        guard input.count == candidate.count, input != candidate else { return false }
        let left = Array(input)
        let right = Array(candidate)
        var mismatches: [Int] = []

        for index in left.indices {
            if left[index] != right[index] { mismatches.append(index) }
            if mismatches.count > 2 { return false }
        }

        guard mismatches.count == 2 else { return false }
        let first = mismatches[0]
        let second = mismatches[1]
        guard second - first == 1 else { return false }

        return left[first] == right[second] && left[second] == right[first]
    }

    private func applyCasePattern(from original: String, to corrected: String) -> String {
        guard !original.isEmpty, !corrected.isEmpty else { return corrected }
        if original.uppercased() == original { return corrected.uppercased() }
        if original.lowercased() == original { return corrected.lowercased() }
        if isTitleCase(original) {
            return corrected.prefix(1).uppercased() + corrected.dropFirst().lowercased()
        }

        let originalChars = Array(original)
        let correctedChars = Array(corrected)
        return correctedChars.enumerated().map { index, char in
            if index < originalChars.count, String(originalChars[index]).uppercased() == String(originalChars[index]) {
                return String(char).uppercased()
            }
            return String(char).lowercased()
        }.joined()
    }

    private func isTitleCase(_ word: String) -> Bool {
        guard let first = word.first else { return false }
        let remainder = String(word.dropFirst())
        return String(first).uppercased() == String(first) && remainder.lowercased() == remainder
    }
}
