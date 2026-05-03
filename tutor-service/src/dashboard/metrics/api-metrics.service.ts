import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiMetricsService {
  private metrics = {
    total: 0,
    success: 0,
    error: 0,
    avg_duration: 0
  };

  recordSuccess() {
    this.metrics.total++;
    this.metrics.success++;
  }

  recordError() {
    this.metrics.total++;
    this.metrics.error++;
  }

  recordDuration(duration: number) {
    this.metrics.avg_duration = (this.metrics.avg_duration * (this.metrics.total - 1) + duration) / this.metrics.total;
  }

  // Lấy dữ liệu và reset bộ đếm cho chu kỳ tiếp theo
  getAndResetMetrics() {
    const currentMetrics = { ...this.metrics };
    
    // Reset về 0 để đo lường cho phút tiếp theo
    this.metrics = { total: 0, success: 0, error: 0, avg_duration: 0 };
    
    return currentMetrics;
  }
}