module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  // Mostrar todos los console.log en las pruebas
  verbose: true,
  // No silenciar los console.log
  silent: false,
  // Mostrar output de las pruebas
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};


