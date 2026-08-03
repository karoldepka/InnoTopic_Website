module.exports = {
  testEnvironment: 'node',
  testTimeout: 90000,
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'scripts/tsconfig.ai-backend-jest.json',
    }],
  },
  verbose: true,
}
