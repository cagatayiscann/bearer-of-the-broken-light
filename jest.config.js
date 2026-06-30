/**
 * Jest config for the PURE engine logic only (ARCHITECTURE.md §6/§7).
 * No React Native here — these tests run on plain TypeScript via ts-jest,
 * so the AI-verifiable surface (grid layout, selection, scoring) stays large.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Only pick up *.test.ts files (pure logic). RN component tests are out of scope here.
  testMatch: ['**/?(*.)+(test).ts'],
  // Keep ts-jest from choking on RN/JSX project settings; isolate type stripping.
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
