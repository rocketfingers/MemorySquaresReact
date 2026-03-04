jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native/Libraries/Modal/Modal', () => {
  return ({ visible, children }) => (visible ? children : null);
});

const originalConsoleError = console.error;
jest.spyOn(console, 'error').mockImplementation((...args) => {
  const firstArg = args[0];
  if (typeof firstArg === 'string' && firstArg.includes('not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
});
