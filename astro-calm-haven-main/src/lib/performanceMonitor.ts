export class PerformanceMonitor {
  private inferenceTimes: number[] = [];
  private memoryUsage: number[] = [];
  
  startInference() {
    return performance.now();
  }
  
  endInference(startTime: number) {
    const duration = performance.now() - startTime;
    this.inferenceTimes.push(duration);
    
    // Keep last 100 measurements
    if (this.inferenceTimes.length > 100) {
      this.inferenceTimes.shift();
    }
    
    return duration;
  }
  
  getAverageInferenceTime(): number {
    if (this.inferenceTimes.length === 0) return 0;
    const sum = this.inferenceTimes.reduce((a, b) => a + b, 0);
    return sum / this.inferenceTimes.length;
  }
  
  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.memoryUsage.push(memory.usedJSHeapSize);
      }
    }
  }
  
  getStatus(): {
    avgResponseTime: number;
    ready: boolean;
    recommendations?: string[];
  } {
    const avgTime = this.getAverageInferenceTime();
    const recommendations = [];
    
    if (avgTime > 5000) {
      recommendations.push('Consider using a smaller model');
    }
    
    return {
      avgResponseTime: avgTime,
      ready: avgTime < 10000, // 10 second threshold
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }
}