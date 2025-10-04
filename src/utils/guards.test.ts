/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import {
  isEmptyArray,
  isEmptyObject,
  isFailure,
  isNonEmptyArray,
  isNonEmptyString,
  isNotNullOrUndefined,
  isNullOrUndefined,
  isNumberInRange,
  isPositiveNumber,
  isSuccess,
  isValidNumber,
} from './guards';

describe('Type Guards', () => {
  describe('isNullOrUndefined', () => {
    it.each([
      [null, true, 'null'],
      [undefined, true, 'undefined'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNullOrUndefined(value)).toBe(expected);
    });

    it.each([
      ['', false, 'empty string'],
      [0, false, 'zero'],
      [false, false, 'false boolean'],
      [[], false, 'empty array'],
      [{}, false, 'empty object'],
      ['hello', false, 'non-empty string'],
      [42, false, 'positive number'],
      [true, false, 'true boolean'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNullOrUndefined(value)).toBe(expected);
    });
  });

  describe('isNotNullOrUndefined', () => {
    it.each([
      [null, false, 'null'],
      [undefined, false, 'undefined'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNotNullOrUndefined(value)).toBe(expected);
    });

    it.each([
      ['', true, 'empty string'],
      [0, true, 'zero'],
      [false, true, 'false boolean'],
      [[], true, 'empty array'],
      [{}, true, 'empty object'],
      ['hello', true, 'non-empty string'],
      [42, true, 'positive number'],
      [true, true, 'true boolean'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNotNullOrUndefined(value)).toBe(expected);
    });
  });

  describe('isNonEmptyString', () => {
    it.each([
      ['hello', true, 'non-empty string'],
      ['a', true, 'single character'],
      ['  test  ', true, 'string with whitespace'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNonEmptyString(value)).toBe(expected);
    });

    it.each([
      ['', false, 'empty string'],
      ['   ', false, 'whitespace only'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
      [123, false, 'number'],
      [[], false, 'array'],
      [{}, false, 'object'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNonEmptyString(value)).toBe(expected);
    });
  });

  describe('isEmptyArray', () => {
    it.each([[[], true, 'empty array']])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isEmptyArray(value)).toBe(expected);
    });

    it.each([
      [[1], false, 'non-empty array'],
      ['[]', false, 'string'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
      [{}, false, 'object'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isEmptyArray(value)).toBe(expected);
    });
  });

  describe('isNonEmptyArray', () => {
    it.each([
      [[1, 2, 3], true, 'array with multiple elements'],
      [['a'], true, 'array with single element'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNonEmptyArray(value)).toBe(expected);
    });

    it.each([
      [[], false, 'empty array'],
      [null, false, 'null'],
      ['array', false, 'string'],
      [undefined, false, 'undefined'],
      [{}, false, 'object'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isNonEmptyArray(value)).toBe(expected);
    });
  });

  describe('isEmptyObject', () => {
    it.each([[{}, true, 'empty object']])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isEmptyObject(value)).toBe(expected);
    });

    it.each([
      [{ a: 1 }, false, 'non-empty object'],
      [[], false, 'array'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
      ['{}', false, 'string'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isEmptyObject(value)).toBe(expected);
    });
  });

  describe('isValidNumber', () => {
    it.each([
      [1, true, 'positive integer'],
      [0, true, 'zero'],
      [-1, true, 'negative integer'],
      [1.5, true, 'decimal number'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isValidNumber(value)).toBe(expected);
    });

    it.each([
      [NaN, false, 'NaN'],
      [Infinity, false, 'Infinity'],
      [-Infinity, false, 'negative Infinity'],
      ['1', false, 'string number'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isValidNumber(value)).toBe(expected);
    });
  });

  describe('isPositiveNumber', () => {
    it.each([
      [1, true, 'positive integer'],
      [0.1, true, 'positive decimal'],
      [100, true, 'large positive number'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isPositiveNumber(value)).toBe(expected);
    });

    it.each([
      [0, false, 'zero'],
      [-1, false, 'negative integer'],
      [-0.5, false, 'negative decimal'],
      [NaN, false, 'NaN'],
      [Infinity, false, 'Infinity'],
      ['1', false, 'string number'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
    ])('should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isPositiveNumber(value)).toBe(expected);
    });
  });

  describe('isNumberInRange', () => {
    it.each([
      [5, 1, 10, true, 'number within range'],
      [1, 1, 10, true, 'number at minimum'],
      [10, 1, 10, true, 'number at maximum'],
      [5.5, 1, 10, true, 'decimal within range'],
    ])('should return %p for %s', (...args) => {
      const [value, min, max, expected] = args;
      expect(isNumberInRange(value, min, max)).toBe(expected);
    });

    it.each([
      [0, 1, 10, false, 'number below range'],
      [11, 1, 10, false, 'number above range'],
      [-1, 1, 10, false, 'negative number'],
      [NaN, 1, 10, false, 'NaN'],
    ])('should return %p for %s', (...args) => {
      const [value, min, max, expected] = args;
      expect(isNumberInRange(value, min, max)).toBe(expected);
    });
  });

  describe('result type guards', () => {
    it.each([
      [{ success: true, data: 'test' }, true, 'success result'],
      [{ success: true, data: null }, true, 'success with null data'],
      [{ success: true, data: undefined }, true, 'success with undefined data'],
    ])('isSuccess should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isSuccess(value)).toBe(expected);
    });

    it.each([
      [{ success: false, error: 'error' }, false, 'failure result'],
      [{ success: false, error: null }, false, 'failure with null error'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
      [{}, false, 'empty object'],
    ])('isSuccess should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isSuccess(value as any)).toBe(expected);
    });

    it.each([
      [{ success: false, error: 'error' }, true, 'failure result'],
      [{ success: false, error: null }, true, 'failure with null error'],
    ])('isFailure should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isFailure(value)).toBe(expected);
    });

    it.each([
      [{ success: true, data: 'test' }, false, 'success result'],
      [null, false, 'null'],
      [undefined, false, 'undefined'],
      [{}, false, 'empty object'],
    ])('isFailure should return %p for %s', (...args) => {
      const [value, expected] = args;
      expect(isFailure(value as any)).toBe(expected);
    });
  });
});
