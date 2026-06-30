import { isPuzzleSolved, isValidGuess, normalizeWord, scorePuzzle } from './wordGrid';

describe('normalizeWord', () => {
  it('trims and uppercases', () => {
    expect(normalizeWord('  root ')).toBe('ROOT');
  });
});

describe('isValidGuess', () => {
  const words = ['ROOT', 'MOSS'];
  it('matches regardless of case/whitespace', () => {
    expect(isValidGuess(' moss ', words)).toBe(true);
  });
  it('rejects non-answers', () => {
    expect(isValidGuess('TREE', words)).toBe(false);
  });
});

describe('isPuzzleSolved', () => {
  const words = ['ROOT', 'MOSS', 'TOME'];
  it('is false until every word is found', () => {
    expect(isPuzzleSolved(['ROOT', 'MOSS'], words)).toBe(false);
  });
  it('is true once all words are found (order/case agnostic)', () => {
    expect(isPuzzleSolved(['tome', 'moss', 'root'], words)).toBe(true);
  });
});

describe('scorePuzzle', () => {
  it('awards base points per word', () => {
    expect(scorePuzzle({ wordCount: 5 })).toBe(500);
  });
  it('adds a speed bonus when time remains', () => {
    expect(scorePuzzle({ wordCount: 5, timeRemaining: 20 })).toBe(600);
  });
  it('ignores non-positive time remaining', () => {
    expect(scorePuzzle({ wordCount: 5, timeRemaining: 0 })).toBe(500);
    expect(scorePuzzle({ wordCount: 5, timeRemaining: null })).toBe(500);
  });
});
