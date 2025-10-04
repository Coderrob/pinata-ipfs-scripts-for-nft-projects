/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { FileUtils, Logger, ObjectUtils } from '.';

describe('FileUtils', () => {
  describe('getFileName', () => {
    test('should extract filename from unix path', () => {
      expect(FileUtils.getFileName('/path/to/file.txt')).toBe('file.txt');
    });

    test('should extract filename from windows path', () => {
      expect(FileUtils.getFileName('C:\\path\\to\\file.txt')).toBe('file.txt');
    });

    test('should return empty string for empty path', () => {
      expect(FileUtils.getFileName('')).toBe('');
    });

    test('should return filename when no path separators', () => {
      expect(FileUtils.getFileName('file.txt')).toBe('file.txt');
    });
  });

  describe('isValidPath', () => {
    test('should return true for valid paths', () => {
      expect(FileUtils.isValidPath('/valid/path')).toBe(true);
      expect(FileUtils.isValidPath('relative/path')).toBe(true);
    });

    test('should return false for invalid paths', () => {
      expect(FileUtils.isValidPath('')).toBe(false);
      expect(FileUtils.isValidPath('   ')).toBe(false);
    });
  });
});

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should log info message with context', () => {
    const logger = new Logger('TestContext');
    logger.info('Test message');

    expect(consoleSpy).toHaveBeenCalledWith('[TestContext] INFO: Test message', '');
  });
});

describe('ObjectUtils', () => {
  describe('sortObjectByKeys', () => {
    test('should sort object keys naturally', () => {
      const input = {
        'file10.txt': 'hash10',
        'file2.txt': 'hash2',
        'file1.txt': 'hash1',
      };
      const result = ObjectUtils.sortObjectByKeys(input);

      expect(Object.keys(result)).toEqual(['file1.txt', 'file2.txt', 'file10.txt']);
    });
  });

  describe('isEmpty', () => {
    test('should return true for empty object', () => {
      expect(ObjectUtils.isEmpty({})).toBe(true);
    });

    test('should return false for non-empty object', () => {
      expect(ObjectUtils.isEmpty({ key: 'value' })).toBe(false);
    });
  });
});
