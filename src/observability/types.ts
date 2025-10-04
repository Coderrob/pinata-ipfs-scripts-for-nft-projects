/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * Log context interface for structured logging
 */
export interface LogContext {
  readonly requestId?: string;
  readonly userId?: string;
  readonly operation?: string;
  readonly duration?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly context: string;
  readonly message: string;
  readonly data?: unknown;
  readonly logContext?: LogContext;
  readonly error?: Error;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  readonly operation: string;
  readonly duration: number;
  readonly success: boolean;
  readonly itemsProcessed?: number;
  readonly errorCount?: number;
  readonly timestamp: string;
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly service: string;
  readonly timestamp: string;
  readonly responseTime?: number;
  readonly details?: Record<string, unknown>;
  readonly error?: string;
}
