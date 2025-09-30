import '@testing-library/jest-dom';

// Mock structuredClone for older Node versions
if (!global.structuredClone) {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
