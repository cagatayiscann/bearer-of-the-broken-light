import {
  applyOfflineDecay,
  clampFatigue,
  offlineDecayAmount,
  palantirFatigueAfter,
} from './fatigue';

describe('clampFatigue', () => {
  it('clamps to 0..max', () => {
    expect(clampFatigue(-5, 100)).toBe(0);
    expect(clampFatigue(50, 100)).toBe(50);
    expect(clampFatigue(150, 100)).toBe(100);
  });
});

describe('offlineDecayAmount', () => {
  it('returns 0 for non-positive elapsed time', () => {
    expect(offlineDecayAmount(0, 12)).toBe(0);
    expect(offlineDecayAmount(-1000, 12)).toBe(0);
  });

  it('scales linearly with hours', () => {
    expect(offlineDecayAmount(3_600_000, 12)).toBe(12);
    expect(offlineDecayAmount(1_800_000, 12)).toBe(6);
  });
});

describe('applyOfflineDecay', () => {
  it('leaves fatigue unchanged when there is no lastClosedAt', () => {
    expect(applyOfflineDecay(80, null, Date.now(), 12, 100)).toBe(80);
  });

  it('reduces fatigue by elapsed camp decay', () => {
    const closed = 0;
    const now = 3_600_000; // 1 hour later
    expect(applyOfflineDecay(80, closed, now, 12, 100)).toBe(68);
  });

  it('never drops below zero', () => {
    expect(applyOfflineDecay(5, 0, 3_600_000 * 10, 12, 100)).toBe(0);
  });
});

describe('palantirFatigueAfter', () => {
  it('reduces fatigue by the reward amount', () => {
    expect(palantirFatigueAfter(70, 40, 100)).toBe(30);
  });

  it('does not go below zero', () => {
    expect(palantirFatigueAfter(20, 40, 100)).toBe(0);
  });
});
