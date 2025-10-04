/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { LogContext, LogEntry, LogLevel, PerformanceMetrics } from './types';

/**
 * Enhanced logger with structured logging and observability features
 */
export class StructuredLogger {
  private readonly context: string;
  private readonly logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL) || logLevel;
  }

  /**
   * Log an info message with structured context
   */
  public info(message: string, data?: unknown, logContext?: LogContext): void {
    this.log(LogLevel.INFO, message, data, logContext);
  }

  /**
   * Log a warning message with structured context
   */
  public warn(message: string, data?: unknown, logContext?: LogContext): void {
    this.log(LogLevel.WARN, message, data, logContext);
  }

  /**
   * Log an error message with structured context
   */
  public error(message: string, error?: Error | unknown, logContext?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, undefined, logContext, errorObj);
  }

  /**
   * Log a debug message with structured context
   */
  public debug(message: string, data?: unknown, logContext?: LogContext): void {
    this.log(LogLevel.DEBUG, message, data, logContext);
  }

  /**
   * Log a trace message with structured context
   */
  public trace(message: string, data?: unknown, logContext?: LogContext): void {
    this.log(LogLevel.TRACE, message, data, logContext);
  }

  /**
   * Log operation start with timing
   */
  public startOperation(operation: string, metadata?: Record<string, unknown>): OperationTimer {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const logContext: LogContext = {
      requestId,
      operation,
      ...(metadata && { metadata }),
    };

    this.info(`Operation started: ${operation}`, { operation, requestId, metadata }, logContext);

    return new OperationTimer(this, operation, requestId, startTime);
  }

  /**
   * Log performance metrics
   */
  public metrics(metrics: PerformanceMetrics): void {
    this.info('Performance metrics', metrics, {
      operation: metrics.operation,
      duration: metrics.duration,
      metadata: {
        success: metrics.success,
        itemsProcessed: metrics.itemsProcessed,
        errorCount: metrics.errorCount,
      },
    });
  }

  /**
   * Core logging method with structured output
   */
  private log(level: LogLevel, message: string, data?: unknown, logContext?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.buildLogEntry(level, message, data, logContext, error);
    const formattedMessage = this.formatLogEntry(entry);
    this.output(level, formattedMessage);
  }

  /**
   * Determines whether the log level warrants output.
   * @param level - Level associated with the log entry.
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Constructs a structured log entry.
   * @param level - Severity level of the log entry.
   * @param message - Human readable message.
   * @param data - Optional payload to attach.
   * @param logContext - Contextual metadata for the log.
   * @param error - Optional error instance.
   * @returns Structured log entry fragment.
   */
  private buildLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    logContext?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(data !== undefined && { data }),
      ...(logContext && { logContext }),
      ...(error && { error }),
    };
  }

  /**
   * Formats a structured log entry.
   * @param entry - Structured log entry to format.
   */
  private formatLogEntry(entry: LogEntry): string {
    const baseMessage = this.buildBaseMessage(entry);
    const contextString = this.buildContextString(entry);
    const dataString = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    const errorString = this.buildErrorString(entry);

    return `${baseMessage}${contextString}${dataString}${errorString}`;
  }

  /**
   * Creates the base portion of the formatted log message.
   * @param entry - Structured log entry.
   */
  private buildBaseMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
  }

  /**
   * Builds a formatted string representing log context.
   * @param entry - Structured log entry containing context.
   */
  private buildContextString(entry: LogEntry): string {
    const { logContext } = entry;
    if (!logContext) {
      return '';
    }

    const contextParts = [
      this.formatContextValue('requestId', logContext.requestId),
      this.formatContextValue('operation', logContext.operation),
      this.formatDuration(logContext.duration),
    ].filter((part): part is string => Boolean(part));

    return contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';
  }

  /**
   * Formats a generic context value when present.
   * @param key - Context key.
   * @param value - Value to format.
   */
  private formatContextValue(key: string, value?: string | number): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    return `${key}=${value}`;
  }

  /**
   * Formats duration values for log context output.
   * @param duration - Duration value in milliseconds.
   */
  private formatDuration(duration?: number): string | undefined {
    return duration === undefined ? undefined : `duration=${duration}ms`;
  }

  /**
   * Builds a formatted string representing error details.
   * @param entry - Structured log entry containing error data.
   */
  private buildErrorString(entry: LogEntry): string {
    if (!entry.error) {
      return '';
    }

    const stack = entry.error.stack ? `\n${entry.error.stack}` : '';
    return ` ERROR: ${entry.error.message}${stack}`;
  }

  /**
   * Output log message to appropriate stream
   */
  private output(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * Parse log level from string
   */
  private parseLogLevel(level?: string): LogLevel | undefined {
    if (!level) return undefined;

    const normalizedLevel = level.toLowerCase() as LogLevel;
    return Object.values(LogLevel).includes(normalizedLevel) ? normalizedLevel : undefined;
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Operation timer for measuring performance
 */
export class OperationTimer {
  constructor(
    private readonly logger: StructuredLogger,
    private readonly operation: string,
    private readonly requestId: string,
    private readonly startTime: number
  ) {}

  /**
   * Complete the operation and log results
   */
  public complete(success: boolean = true, metadata?: Record<string, unknown>): PerformanceMetrics {
    const duration = Date.now() - this.startTime;

    const metrics: PerformanceMetrics = {
      operation: this.operation,
      duration,
      success,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    const message = `Operation ${success ? 'completed' : 'failed'}: ${this.operation}`;

    const logContext: LogContext = {
      requestId: this.requestId,
      operation: this.operation,
      duration,
      ...(metadata && { metadata }),
    };

    if (success) {
      this.logger.info(message, undefined, logContext);
    } else {
      this.logger.error(message, undefined, logContext);
    }

    this.logger.metrics(metrics);
    return metrics;
  }

  /**
   * Log intermediate progress
   */
  public progress(message: string, itemsProcessed?: number): void {
    const currentDuration = Date.now() - this.startTime;

    this.logger.debug(
      `${this.operation} progress: ${message}`,
      { itemsProcessed },
      {
        requestId: this.requestId,
        operation: this.operation,
        duration: currentDuration,
        metadata: { itemsProcessed },
      }
    );
  }
}
