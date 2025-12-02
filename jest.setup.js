// Set up test environment variables
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars for 32 bytes
process.env.NODE_ENV = 'test';

// Suppress console outputs during tests for cleaner test results
// Comment out any of these to see those console outputs
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress all console.error messages during tests (unless SHOW_LOGS=true)
  console.error = (...args) => {
    if (process.env.SHOW_LOGS === 'true') {
      originalConsoleError(...args);
    }
    // Otherwise suppress all error logs during tests
  };

  // Suppress console.log messages (unless SHOW_LOGS=true)
  console.log = (...args) => {
    if (process.env.SHOW_LOGS === 'true') {
      originalConsoleLog(...args);
    }
  };

  // Suppress console.info messages (unless SHOW_LOGS=true)
  console.info = (...args) => {
    if (process.env.SHOW_LOGS === 'true') {
      originalConsoleInfo(...args);
    }
  };

  // Suppress console.warn messages (unless SHOW_LOGS=true)
  console.warn = (...args) => {
    if (process.env.SHOW_LOGS === 'true') {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
  console.warn = originalConsoleWarn;
});
