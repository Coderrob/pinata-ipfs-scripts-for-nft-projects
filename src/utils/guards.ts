/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Type guard utilities to reduce redundant expression checks
 * across the source code and improve type safety.
 */

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is neither null nor undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks if a value is a string (including empty strings)
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is an empty string or only whitespace
 */
export function isEmptyOrWhitespace(value: unknown): boolean {
  return !isString(value) || value.trim().length === 0;
}

/**
 * Checks if a value is a valid number (not NaN, not Infinity)
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Checks if a value is a positive number (greater than 0)
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

/**
 * Checks if a value is a non-negative number (0 or greater)
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Checks if a value is within a specified range (inclusive)
 */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return isValidNumber(value) && value >= min && value <= max;
}

/**
 * Checks if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return isArray(value) && value.length > 0;
}

/**
 * Checks if a value is an empty array
 */
export function isEmptyArray(value: unknown): value is [] {
  return isArray(value) && value.length === 0;
}

/**
 * Checks if a value is a plain object (not null, not array, not function)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if an object is empty (has no enumerable own properties)
 */
export function isEmptyObject(value: unknown): boolean {
  return isObject(value) && Object.keys(value).length === 0;
}

/**
 * Checks if an object has any enumerable own properties
 */
export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Checks if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Checks if a value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is defined (not undefined, but can be null)
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Checks if a value exists (not null and not undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return isNotNullOrUndefined(value);
}

/**
 * Checks if a string represents a valid file path
 */
export function isValidFilePath(value: unknown): value is string {
  return isNonEmptyString(value) && !value.includes('\0');
}

/**
 * Checks if a value has a specific property
 */
export function hasProperty<T extends Record<string, unknown>, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

/**
 * Checks if environment variables are set and non-empty
 */
export function hasRequiredEnvVars(...varNames: string[]): boolean {
  return varNames.every(varName => isNonEmptyString(process.env[varName]));
}

/**
 * Checks if a value is truthy (excludes false, 0, "", null, undefined, NaN)
 */
export function isTruthy<T>(value: T | null | undefined | false | 0 | ''): value is T {
  return Boolean(value);
}

/**
 * Checks if a value is falsy (false, 0, "", null, undefined, NaN)
 */
export function isFalsy(value: unknown): value is null | undefined | false | 0 | '' | typeof NaN {
  return !value;
}

/**
 * Type guard for successful operation results
 */
export function isSuccess<T>(result: {
  success: boolean;
  data?: T;
  error?: unknown;
}): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard for failed operation results
 */
export function isFailure<T>(result: {
  success: boolean;
  data?: T;
  error?: unknown;
}): result is { success: false; error: unknown } {
  return result.success === false;
}
