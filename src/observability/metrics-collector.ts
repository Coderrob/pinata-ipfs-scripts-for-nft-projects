/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { StructuredLogger } from './structured-logger';
import { HealthCheckResult, HealthStatus, PerformanceMetrics } from './types';

/**
 * Metrics collector for operational observability
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private readonly logger: StructuredLogger;
  private readonly metrics: Map<string, PerformanceMetrics[]> = new Map();
  private readonly healthChecks: Map<string, HealthCheckResult> = new Map();

  private constructor() {
    this.logger = new StructuredLogger('MetricsCollector');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record performance metrics
   */
  public recordMetrics(metrics: PerformanceMetrics): void {
    const { operation } = metrics;

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(metrics);

    // Keep only last 100 metrics per operation to prevent memory leaks
    if (operationMetrics.length > 100) {
      operationMetrics.shift();
    }

    this.logger.debug('Metrics recorded', { operation, metrics });
  }

  /**
   * Record health check result
   */
  public recordHealthCheck(result: HealthCheckResult): void {
    this.healthChecks.set(result.service, result);

    const logLevel = result.status === HealthStatus.HEALTHY ? 'info' : 'warn';
    this.logger[logLevel]('Health check completed', {
      service: result.service,
      status: result.status,
      responseTime: result.responseTime,
    });
  }

  /**
   * Get aggregated metrics for an operation
   */
  public getOperationMetrics(operation: string): {
    totalCalls: number;
    successRate: number;
    averageDuration: number;
    errorCount: number;
    lastUpdated: string;
  } | null {
    const operationMetrics = this.metrics.get(operation);

    if (!operationMetrics || operationMetrics.length === 0) {
      return null;
    }

    const totalCalls = operationMetrics.length;
    const successfulCalls = operationMetrics.filter(m => m.success).length;
    const successRate = (successfulCalls / totalCalls) * 100;
    const averageDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / totalCalls;
    const errorCount = totalCalls - successfulCalls;
    const lastUpdated = operationMetrics[operationMetrics.length - 1].timestamp;

    return {
      totalCalls,
      successRate,
      averageDuration,
      errorCount,
      lastUpdated,
    };
  }

  /**
   * Get all operation names with metrics
   */
  public getOperationNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get current health status
   */
  public getHealthStatus(): Record<string, HealthCheckResult> {
    return Object.fromEntries(this.healthChecks);
  }

  /**
   * Get overall system health
   */
  public getOverallHealth(): HealthStatus {
    const healthResults = Array.from(this.healthChecks.values());

    if (healthResults.length === 0) {
      return HealthStatus.HEALTHY;
    }

    const unhealthyCount = healthResults.filter(r => r.status === HealthStatus.UNHEALTHY).length;
    const degradedCount = healthResults.filter(r => r.status === HealthStatus.DEGRADED).length;

    if (unhealthyCount > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (degradedCount > 0) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  /**
   * Generate metrics summary report
   */
  public generateMetricsReport(): {
    timestamp: string;
    overallHealth: HealthStatus;
    operations: Array<{
      name: string;
      totalCalls: number;
      successRate: number;
      averageDuration: number;
      errorCount: number;
    }>;
    healthChecks: Record<string, HealthCheckResult>;
  } {
    const operations = this.getOperationNames().map(name => ({
      name,
      ...this.getOperationMetrics(name)!,
    }));

    return {
      timestamp: new Date().toISOString(),
      overallHealth: this.getOverallHealth(),
      operations,
      healthChecks: this.getHealthStatus(),
    };
  }

  /**
   * Clear old metrics (useful for long-running processes)
   */
  public clearOldMetrics(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

    Array.from(this.metrics.entries()).forEach(([operation, metrics]) => {
      const filteredMetrics = metrics.filter(m => new Date(m.timestamp).getTime() > cutoffTime);

      if (filteredMetrics.length === 0) {
        this.metrics.delete(operation);
      } else {
        this.metrics.set(operation, filteredMetrics);
      }
    });

    this.logger.info('Old metrics cleared', {
      cutoffHours: olderThanHours,
      remainingOperations: this.metrics.size,
    });
  }
}
