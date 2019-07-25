module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: [
    require.resolve('./jest/setup.ts'),
    '@testing-library/react/cleanup-after-each',
  ],
  testRegex: '\\.(test|spec)\\.(ts|tsx)$',
};
