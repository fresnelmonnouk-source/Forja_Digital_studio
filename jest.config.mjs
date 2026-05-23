import nextJest from "next/jest.js";

// next/jest transforme les tests TS via SWC : ni ts-node ni ts-jest requis.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/page.tsx",
    "!src/**/layout.tsx",
  ],
};

export default createJestConfig(config);
