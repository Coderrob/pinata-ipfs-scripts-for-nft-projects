/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { PinataConfig } from '../types';
import { ConfigurationManager } from './configuration-manager';

/**
 * Application configuration with validation and defaults
 */
export class AppConfig {
  private static readonly configManager = ConfigurationManager.getInstance();

  /**
   * Initialize configuration from environment
   */
  public static initialize(): void {
    AppConfig.configManager.loadFromEnvironment();
  }

  /**
   * Get Pinata configuration
   */
  public static getPinataConfig(): PinataConfig {
    AppConfig.configManager.validateRequired(['PINATA_API_KEY', 'PINATA_API_SECRET']);

    return {
      apiKey: AppConfig.configManager.getRequiredString('PINATA_API_KEY'),
      apiSecret: AppConfig.configManager.getRequiredString('PINATA_API_SECRET'),
    };
  }

  /**
   * Get logging configuration
   */
  public static getLoggingConfig() {
    return {
      level: AppConfig.configManager.getString('LOG_LEVEL', 'info'),
      enableConsole: AppConfig.configManager.getBoolean('LOG_CONSOLE', true),
      enableFile: AppConfig.configManager.getBoolean('LOG_FILE', false),
      filePath: AppConfig.configManager.getString('LOG_FILE_PATH', './logs/app.log'),
    };
  }

  /**
   * Get rate limiting configuration
   */
  public static getRateLimitConfig() {
    return {
      maxConcurrent: AppConfig.configManager.getNumber('RATE_LIMIT_MAX_CONCURRENT', 5),
      minTime: AppConfig.configManager.getNumber('RATE_LIMIT_MIN_TIME', 1000),
      uploadConcurrent: AppConfig.configManager.getNumber('UPLOAD_MAX_CONCURRENT', 1),
      uploadMinTime: AppConfig.configManager.getNumber('UPLOAD_MIN_TIME', 3000),
    };
  }

  /**
   * Get file processing configuration
   */
  public static getFileProcessingConfig() {
    return {
      defaultInputFolder: AppConfig.configManager.getString('DEFAULT_INPUT_FOLDER', 'files'),
      defaultOutputFolder: AppConfig.configManager.getString('DEFAULT_OUTPUT_FOLDER', './output'),
      maxFileSize: AppConfig.configManager.getNumber('MAX_FILE_SIZE_MB', 100),
      supportedExtensions: AppConfig.configManager
        .getString('SUPPORTED_EXTENSIONS', '.jpg,.jpeg,.png,.gif,.svg,.json,.txt,.md')
        .split(',')
        .map(ext => ext.trim().toLowerCase()),
    };
  }

  /**
   * Get health check configuration
   */
  public static getHealthCheckConfig() {
    return {
      enabled: AppConfig.configManager.getBoolean('HEALTH_CHECK_ENABLED', true),
      interval: AppConfig.configManager.getNumber('HEALTH_CHECK_INTERVAL_MS', 30000),
      timeout: AppConfig.configManager.getNumber('HEALTH_CHECK_TIMEOUT_MS', 10000),
    };
  }

  /**
   * Get performance monitoring configuration
   */
  public static getPerformanceConfig() {
    return {
      enableMetrics: AppConfig.configManager.getBoolean('PERFORMANCE_METRICS_ENABLED', true),
      metricsRetentionHours: AppConfig.configManager.getNumber('METRICS_RETENTION_HOURS', 24),
      memoryThresholdMB: AppConfig.configManager.getNumber('MEMORY_THRESHOLD_MB', 100),
    };
  }

  /**
   * Get retry configuration
   */
  public static getRetryConfig() {
    return {
      maxRetries: AppConfig.configManager.getNumber('MAX_RETRIES', 3),
      baseDelayMs: AppConfig.configManager.getNumber('RETRY_BASE_DELAY_MS', 1000),
      maxDelayMs: AppConfig.configManager.getNumber('RETRY_MAX_DELAY_MS', 30000),
      exponentialBackoff: AppConfig.configManager.getBoolean('RETRY_EXPONENTIAL_BACKOFF', true),
    };
  }

  /**
   * Validate all required configuration
   */
  public static validate(): void {
    const requiredKeys = ['PINATA_API_KEY', 'PINATA_API_SECRET'];

    AppConfig.configManager.validateRequired(requiredKeys);
  }
}
