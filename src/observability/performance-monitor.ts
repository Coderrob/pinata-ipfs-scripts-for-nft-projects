/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { MetricsCollector, PerformanceMetrics, StructuredLogger } from '../observability';

/**
 * Performance monitoring decorator and utilities
 */
export class PerformanceMonitor {
  private static readonly logger = new StructuredLogger('PerformanceMonitor');
  private static readonly metricsCollector = MetricsCollector.getInstance();

  /**
   * Decorator to monitor method performance
   */
  static monitor(operationName?: string) {
    return function monitorDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const operation = operationName || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function monitoredMethod(...args: any[]) {
        const timer = PerformanceMonitor.logger.startOperation(operation, {
          className: target.constructor.name,
          methodName: propertyKey,
          argumentCount: args.length,
        });

        try {
          const result = await originalMethod.apply(this, args);
          timer.complete(true, {
            resultType: typeof result,
            hasResult: result !== undefined,
          });
          return result;
        } catch (error) {
          timer.complete(false, {
            errorType: error instanceof Error ? error.constructor.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      };

      return descriptor;
    };
  }

  /**
   * Monitor a function or async operation
   */
  static async monitorFunction<T>(
    operation: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const timer = PerformanceMonitor.logger.startOperation(operation, metadata);

    try {
      const result = await fn();
      timer.complete(true, {
        resultType: typeof result,
        hasResult: result !== undefined,
      });
      return result;
    } catch (error) {
      timer.complete(false, {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Track batch operation performance
   */
  static trackBatchOperation(
    operationName: string,
    totalItems: number,
    onProgress?: (processed: number, total: number) => void
  ) {
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    return {
      recordSuccess: () => {
        processedCount += 1;
        if (onProgress) {
          onProgress(processedCount, totalItems);
        }
      },

      recordError: (error?: Error) => {
        errorCount += 1;
        processedCount += 1;

        if (error) {
          PerformanceMonitor.logger.warn('Batch operation item failed', undefined, {
            operation: operationName,
            metadata: {
              processedCount,
              totalItems,
              errorCount,
              errorType: error.constructor.name,
              errorMessage: error.message,
            },
          });
        }

        if (onProgress) {
          onProgress(processedCount, totalItems);
        }
      },

      complete: (): PerformanceMetrics => {
        const duration = Date.now() - startTime;
        const successCount = processedCount - errorCount;
        const successRate = totalItems > 0 ? (successCount / totalItems) * 100 : 100;

        const metrics: PerformanceMetrics = {
          operation: operationName,
          duration,
          success: errorCount === 0,
          itemsProcessed: processedCount,
          errorCount,
          timestamp: new Date().toISOString(),
        };

        PerformanceMonitor.metricsCollector.recordMetrics(metrics);

        const logLevel = errorCount > 0 ? 'warn' : 'info';
        PerformanceMonitor.logger[logLevel]('Batch operation completed', undefined, {
          operation: operationName,
          duration,
          metadata: {
            totalItems,
            processedCount,
            successCount,
            errorCount,
            successRate: Math.round(successRate * 100) / 100,
            itemsPerSecond: Math.round((processedCount / duration) * 1000 * 100) / 100,
          },
        });

        return metrics;
      },
    };
  }

  /**
   * Monitor memory usage during operation
   */
  static async monitorMemory<T>(
    operation: string,
    fn: () => Promise<T> | T,
    threshold: number = 100 * 1024 * 1024 // 100MB
  ): Promise<T> {
    const initialMemory = process.memoryUsage();

    PerformanceMonitor.logger.debug('Memory monitoring started', {
      operation,
      initialMemory: {
        rss: Math.round(initialMemory.rss / 1024 / 1024),
        heapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(initialMemory.heapTotal / 1024 / 1024),
      },
    });

    try {
      const result = await fn();

      const finalMemory = process.memoryUsage();
      const memoryDelta = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      };

      const logLevel = memoryDelta.heapUsed > threshold ? 'warn' : 'debug';
      PerformanceMonitor.logger[logLevel]('Memory monitoring completed', {
        operation,
        memoryDelta: {
          rss: Math.round(memoryDelta.rss / 1024 / 1024),
          heapUsed: Math.round(memoryDelta.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryDelta.heapTotal / 1024 / 1024),
        },
        finalMemory: {
          rss: Math.round(finalMemory.rss / 1024 / 1024),
          heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(finalMemory.heapTotal / 1024 / 1024),
        },
      });

      return result;
    } catch (error) {
      const finalMemory = process.memoryUsage();
      PerformanceMonitor.logger.error('Memory monitoring failed', error as Error, {
        operation,
        metadata: {
          finalMemory: {
            rss: Math.round(finalMemory.rss / 1024 / 1024),
            heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(finalMemory.heapTotal / 1024 / 1024),
          },
        },
      });
      throw error;
    }
  }
}
