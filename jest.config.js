module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: [require.resolve('./jest/setup.ts')],
  testRegex: '\\.(test|spec)\\.(ts|tsx)$',
};
