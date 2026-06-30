import {
  canBuildFromWheel,
  classifyGuess,
  deriveWheel,
  shuffleWheel,
  wordFromSelection,
} from './wheel';

describe('deriveWheel', () => {
  it('returns the sorted letters of a single word', () => {
    expect(deriveWheel(['ROOT'])).toEqual(['O', 'O', 'R', 'T']);
  });

  it('takes the max count of each letter across all words', () => {
    // MOSS needs two S; LEAF needs nothing extra. Pool must include 2x S.
    const wheel = deriveWheel(['MOSS', 'SO']);
    const sCount = wheel.filter((c) => c === 'S').length;
    expect(sCount).toBe(2);
  });

  it('produces a wheel that can build every source word', () => {
    const words = ['ROOT', 'MOSS', 'TOME', 'STORM', 'MOTOR'];
    const wheel = deriveWheel(words);
    for (const w of words) {
      expect(canBuildFromWheel(w, wheel)).toBe(true);
    }
  });
});

describe('canBuildFromWheel', () => {
  it('respects letter multiplicity', () => {
    expect(canBuildFromWheel('MOSS', ['M', 'O', 'S'])).toBe(false);
    expect(canBuildFromWheel('MOSS', ['M', 'O', 'S', 'S'])).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(canBuildFromWheel('moss', ['M', 'O', 'S', 'S'])).toBe(true);
  });
});

describe('wordFromSelection', () => {
  const wheel = ['R', 'O', 'O', 'T'];

  it('joins selected indices into a word', () => {
    expect(wordFromSelection([0, 1, 3], wheel)).toBe('ROT');
  });

  it('ignores out-of-range indices', () => {
    expect(wordFromSelection([0, 9, -1, 3], wheel)).toBe('RT');
  });

  it('returns empty string for no selection', () => {
    expect(wordFromSelection([], wheel)).toBe('');
  });
});

describe('classifyGuess', () => {
  const words = ['ROOT', 'MOSS'];

  it('flags a correct, new word as valid', () => {
    expect(classifyGuess('ROOT', words, [])).toBe('valid');
  });

  it('flags an already-found word as duplicate', () => {
    expect(classifyGuess('ROOT', words, ['ROOT'])).toBe('duplicate');
  });

  it('flags a non-answer as invalid', () => {
    expect(classifyGuess('TORO', words, [])).toBe('invalid');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(classifyGuess(' root ', words, [])).toBe('valid');
  });
});

describe('shuffleWheel', () => {
  it('preserves the letter multiset', () => {
    const src = ['R', 'O', 'O', 'T'];
    const shuffled = shuffleWheel(src, () => 0.5);
    expect([...shuffled].sort()).toEqual([...src].sort());
  });

  it('does not mutate the source array', () => {
    const src = ['A', 'B', 'C'];
    shuffleWheel(src, () => 0);
    expect(src).toEqual(['A', 'B', 'C']);
  });

  it('is deterministic when rng is fixed', () => {
    const src = ['R', 'O', 'O', 'T'];
    const rng = () => 0.25;
    expect(shuffleWheel(src, rng)).toEqual(shuffleWheel(src, rng));
  });
});
