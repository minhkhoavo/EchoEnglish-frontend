// Export all test types from a single entry point

// Shared types
export type { TestSession as SharedTestSession } from './shared.types';
export * from './shared.types';

// Speaking test types
export * from './speaking-test.types';

// Writing test types
export * from './writing-test.types';

// TOEIC test types
export type { TestSession as TOEICTestSession } from './toeic-test.types';
