// Fixed time zone (with DST) so date tests are deterministic on any machine.
process.env.TZ = 'America/New_York';

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Resolves Reanimated/Worklets to their JS (non-native) implementations.
  resolver: 'react-native-reanimated/jest/resolver',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|@react-navigation)/)',
  ],
};
