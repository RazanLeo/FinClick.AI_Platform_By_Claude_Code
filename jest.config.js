module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/*.(test|spec).js'
  ],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  collectCoverageFrom: [
    'lib/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!lib/supabase.js', // Exclude config files
    '!**/node_modules/**',
    '!coverage/**',
    '!tests/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test timeout
  testTimeout: 30000,

  // Mock settings
  clearMocks: true,
  restoreMocks: true,

  // Module directories
  moduleDirectories: [
    'node_modules',
    'lib'
  ],

  // Transform settings (if using ES6 modules)
  transform: {},

  // Test result processor
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/uploads/',
    '/reports/',
    '/charts/'
  ],

  // Global variables
  globals: {
    'process.env': {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      OPENAI_API_KEY: 'test-openai-key',
      GEMINI_API_KEY: 'test-gemini-key',
      PAYTABS_PROFILE_ID: 'test-paytabs-profile',
      PAYTABS_SERVER_KEY: 'test-paytabs-key',
      BASE_URL: 'http://localhost:3000'
    }
  },

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Error handling
  errorOnDeprecated: true,

  // Force exit
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Max workers
  maxWorkers: '50%'
};