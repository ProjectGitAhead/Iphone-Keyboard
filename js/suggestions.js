const DICTIONARY = [
  'the',
  'there',
  'their',
  'then',
  'them',
  'hello',
  'keyboard',
  'iphone',
  'suggestion',
  'typing',
];

const WORD_PRIORITY = {
  the: 100,
  there: 90,
  their: 80,
  then: 20,
  them: 10,
};

const AGGRESSIVE_AUTO_CORRECT = {
  teh: 'the',
};
const MIN_AUTOCORRECT_TOKEN_LENGTH = 3;

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost
      );
    }
  }

  return matrix[a.length][b.length];
}

function typoSimilarityScore(input, candidate) {
  const distance = levenshteinDistance(input, candidate);
  const maxLength = Math.max(input.length, candidate.length) || 1;
  const baseSimilarity = 1 - distance / maxLength;

  if (hasSingleAdjacentSwap(input, candidate)) {
    return baseSimilarity + 0.5;
  }

  return baseSimilarity;
}

function prefixScore(input, candidate) {
  if (!input) {
    return 0;
  }

  if (candidate.startsWith(input)) {
    return 1;
  }

  return 0;
}

function hasSingleAdjacentSwap(input, candidate) {
  if (input.length !== candidate.length || input === candidate) {
    return false;
  }

  const mismatchIndexes = [];
  for (let i = 0; i < input.length; i += 1) {
    if (input[i] !== candidate[i]) {
      mismatchIndexes.push(i);
      if (mismatchIndexes.length > 2) {
        return false;
      }
    }
  }

  if (mismatchIndexes.length !== 2) {
    return false;
  }

  const [first, second] = mismatchIndexes;
  const isAdjacent = second - first === 1;
  if (!isAdjacent) {
    return false;
  }

  return input[first] === candidate[second] && input[second] === candidate[first];
}

function priorityScore(candidate) {
  return (WORD_PRIORITY[candidate] || 0) / 100;
}

function combinedScore(input, candidate) {
  const normalizedInput = input.toLowerCase();
  const normalizedCandidate = candidate.toLowerCase();

  const prefix = prefixScore(normalizedInput, normalizedCandidate);
  const typoTolerance = typoSimilarityScore(normalizedInput, normalizedCandidate);
  const priority = priorityScore(normalizedCandidate);

  return (prefix * 2) + (typoTolerance * 0.7) + (priority * 0.4);
}

function isUppercaseLetter(char) {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}

function isTitleCaseWord(word) {
  if (!word) {
    return false;
  }

  const [first, ...rest] = word;
  return isUppercaseLetter(first) && rest.join('') === rest.join('').toLowerCase();
}

function applyCasePattern(sourceToken, correctedToken) {
  if (!sourceToken || !correctedToken) {
    return correctedToken;
  }

  if (sourceToken === sourceToken.toUpperCase()) {
    return correctedToken.toUpperCase();
  }

  if (sourceToken === sourceToken.toLowerCase()) {
    return correctedToken.toLowerCase();
  }

  if (isTitleCaseWord(sourceToken)) {
    return correctedToken[0].toUpperCase() + correctedToken.slice(1).toLowerCase();
  }

  return correctedToken
    .split('')
    .map((char, index) => (isUppercaseLetter(sourceToken[index]) ? char.toUpperCase() : char.toLowerCase()))
    .join('');
}

function getSuggestions(input) {
  if (!input) {
    return [];
  }

  return DICTIONARY
    .map((word) => ({ word, score: combinedScore(input, word) }))
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, 3)
    .map((entry) => entry.word);
}

function chooseAutoCorrect(token) {
  if (!token) {
    return token;
  }

  const normalizedToken = token.toLowerCase();
  if (AGGRESSIVE_AUTO_CORRECT[normalizedToken]) {
    return applyCasePattern(token, AGGRESSIVE_AUTO_CORRECT[normalizedToken]);
  }

  if (normalizedToken.length < MIN_AUTOCORRECT_TOKEN_LENGTH) {
    return token;
  }

  const [bestSuggestion] = getSuggestions(normalizedToken);
  if (!bestSuggestion) {
    return token;
  }

  const isPartialPrefix = bestSuggestion.startsWith(normalizedToken) && bestSuggestion.length > normalizedToken.length;
  if (isPartialPrefix) {
    return token;
  }

  const currentScore = combinedScore(normalizedToken, normalizedToken);
  const bestScore = combinedScore(normalizedToken, bestSuggestion);
  const shouldAutoCorrect = bestScore > currentScore;

  return shouldAutoCorrect ? applyCasePattern(token, bestSuggestion) : token;
}

export default {
  getSuggestions,
  chooseAutoCorrect,
};
