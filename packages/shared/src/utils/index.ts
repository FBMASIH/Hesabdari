/**
 * Generates a short unique identifier.
 */
export function shortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Asserts that a value is defined (not null or undefined).
 * Throws if the assertion fails.
 */
export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${name} to be defined, but received ${String(value)}`);
  }
}

/**
 * Safely parses a JSON string, returning undefined on failure.
 */
export function safeJsonParse<T>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}
