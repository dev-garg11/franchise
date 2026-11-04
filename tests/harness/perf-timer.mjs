/**
 * Performance Benchmark Timer for Franchise Roots E2E Tests
 * High-resolution measurement for UI transitions and network flows
 */

export class PerfTimer {
  constructor() {
    this.measurements = [];
  }

  async measure(label, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const durationMs = end - start;

    const entry = {
      label,
      durationMs: parseFloat(durationMs.toFixed(3)),
      passed: durationMs < 500.0,
      timestamp: Date.now()
    };

    this.measurements.push(entry);
    return { result, entry };
  }

  getSummary() {
    if (this.measurements.length === 0) {
      return { count: 0, min: 0, max: 0, mean: 0, violations: 0 };
    }

    const durations = this.measurements.map(m => m.durationMs);
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sum = durations.reduce((a, b) => a + b, 0);
    const mean = parseFloat((sum / durations.length).toFixed(3));
    const violations = this.measurements.filter(m => !m.passed).length;

    return {
      count: this.measurements.length,
      min,
      max,
      mean,
      violations,
      allPassed: violations === 0
    };
  }

  reset() {
    this.measurements = [];
  }
}
