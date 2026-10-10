// Mock AsyncStorage so tests can assert token storage without native code
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock safe-area insets (native measurement is unavailable in Jest)
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock icon library (renders SVG - not needed for behaviour tests)
jest.mock('lucide-react-native', () =>
  new Proxy(
    {},
    {
      get: () => () => null,
    }
  )
);
