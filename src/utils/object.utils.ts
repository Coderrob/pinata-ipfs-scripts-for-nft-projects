/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { isEmptyObject } from './guards';

export class ObjectUtils {
  /**
   * Sorts an object by its keys using natural sorting (handles numeric values)
   * @param obj - The object to sort
   * @returns A new object with sorted keys
   */
  public static sortObjectByKeys<T>(obj: Record<string, T>): Record<string, T> {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
      .reduce((accumulator: Record<string, T>, key: string) => {
        accumulator[key] = obj[key];
        return accumulator;
      }, {});
  }

  /**
   * Checks if an object is empty (has no enumerable properties)
   * @param obj - The object to check
   * @returns True if empty, false otherwise
   */
  public static isEmpty(obj: Record<string, unknown>): boolean {
    return isEmptyObject(obj);
  }

  /**
   * Deep clones an object
   * @param obj - The object to clone
   * @returns A deep clone of the object
   */
  public static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merges two objects, with the second object taking precedence
   * @param target - The target object
   * @param source - The source object to merge
   * @returns A new merged object
   */
  public static merge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    return { ...target, ...source };
  }
}
