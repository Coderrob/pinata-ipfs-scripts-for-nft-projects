/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { ConfigurationError } from '../errors';
import { StructuredLogger } from '../observability';
import { isBoolean, isString } from '../utils';

/**
 * Environment-based configuration manager
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private readonly logger: StructuredLogger;
  private config: Map<string, unknown> = new Map();

  private constructor() {
    this.logger = new StructuredLogger('ConfigurationManager');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get string configuration value
   */
  public getString(key: string, defaultValue?: string): string {
    const value = this.getValue(key, defaultValue);
    if (!isString(value)) {
      throw new ConfigurationError(`Configuration value for '${key}' must be a string`, {
        metadata: { key, valueType: typeof value, expectedType: 'string' },
      });
    }
    return value;
  }

  /**
   * Get required string configuration value
   */
  public getRequiredString(key: string): string {
    const value = this.getValue(key);
    if (!isString(value)) {
      throw new ConfigurationError(`Required configuration value '${key}' is missing or invalid`, {
        metadata: { key, valueType: typeof value, expectedType: 'string' },
      });
    }
    return value;
  }

  /**
   * Get number configuration value
   */
  public getNumber(key: string, defaultValue?: number): number {
    const value = this.getValue(key, defaultValue);
    const numValue = Number(value);

    if (Number.isNaN(numValue)) {
      throw new ConfigurationError(`Configuration value for '${key}' must be a valid number`, {
        metadata: { key, value, expectedType: 'number' },
      });
    }

    return numValue;
  }

  /**
   * Get boolean configuration value
   */
  public getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.getValue(key, defaultValue);

    if (isBoolean(value)) {
      return value;
    }

    if (isString(value)) {
      const lowerValue = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
        return true;
      }
      if (['false', '0', 'no', 'off'].includes(lowerValue)) {
        return false;
      }
    }

    throw new ConfigurationError(`Configuration value for '${key}' must be a valid boolean`, {
      metadata: { key, value, expectedType: 'boolean' },
    });
  }

  /**
   * Get JSON configuration value
   */
  public getJSON<T = unknown>(key: string, defaultValue?: T): T {
    const value = this.getValue(key, defaultValue);

    if (isString(value)) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        throw new ConfigurationError(
          `Configuration value for '${key}' must be valid JSON`,
          { metadata: { key, value, parseError: (error as Error).message } },
          error as Error
        );
      }
    }

    return value as T;
  }

  /**
   * Set configuration value
   */
  public set(key: string, value: unknown): void {
    this.config.set(key, value);
    this.logger.debug('Configuration value set', {
      key,
      valueType: typeof value,
    });
  }

  /**
   * Load configuration from environment variables
   */
  public loadFromEnvironment(prefix: string = ''): void {
    this.logger.info('Loading configuration from environment variables', {
      prefix,
    });

    const envEntries = Object.entries(process.env).filter(([key]) => !prefix || key.startsWith(prefix));

    envEntries.forEach(([key, value]) => {
      const configKey = prefix ? key.replace(new RegExp(`^${prefix}`), '') : key;
      this.set(configKey, value);
    });

    const loadedCount = envEntries.length;

    this.logger.info('Configuration loaded from environment', {
      loadedCount,
      prefix: prefix || 'all',
    });
  }

  /**
   * Load configuration from object
   */
  public loadFromObject(config: Record<string, unknown>, prefix: string = ''): void {
    this.logger.info('Loading configuration from object', {
      keyCount: Object.keys(config).length,
      prefix,
    });

    Object.entries(config).forEach(([key, value]) => {
      const configKey = prefix ? `${prefix}${key}` : key;
      this.set(configKey, value);
    });

    this.logger.info('Configuration loaded from object', {
      loadedCount: Object.keys(config).length,
    });
  }

  /**
   * Validate required configuration keys
   */
  public validateRequired(requiredKeys: string[]): void {
    const missing = requiredKeys.filter(key => !this.has(key));

    if (missing.length > 0) {
      throw new ConfigurationError(`Missing required configuration keys: ${missing.join(', ')}`, {
        metadata: { missingKeys: missing, requiredKeys },
      });
    }

    this.logger.info('Configuration validation passed', {
      validatedKeys: requiredKeys.length,
    });
  }

  /**
   * Check if configuration key exists
   */
  public has(key: string): boolean {
    return this.config.has(key) || process.env[key] !== undefined;
  }

  /**
   * Get all configuration keys
   */
  public getKeys(): string[] {
    const configKeys = Array.from(this.config.keys());
    const envKeys = Object.keys(process.env);
    return [...new Set([...configKeys, ...envKeys])];
  }

  /**
   * Clear all configuration
   */
  public clear(): void {
    this.config.clear();
    this.logger.info('Configuration cleared');
  }

  /**
   * Get configuration value with fallback chain
   */
  private getValue(key: string, defaultValue?: unknown): unknown | undefined {
    // Check explicit config first
    if (this.config.has(key)) {
      return this.config.get(key);
    }

    // Check environment variables
    if (process.env[key] !== undefined) {
      return process.env[key];
    }

    // Return default value
    return defaultValue;
  }
}
