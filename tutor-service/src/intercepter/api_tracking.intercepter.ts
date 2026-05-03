import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiMetricsService } from 'src/dashboard/metrics/api-metrics.service';

@Injectable()
export class ApiTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API_TRACKER');

  constructor(
    private readonly apiMetricsService: ApiMetricsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const { method, originalUrl } = req;
    
    // Bỏ qua các API không quan trọng (như health check)
    if (originalUrl.includes('health')) return next.handle();

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.apiMetricsService.recordSuccess(); // Ghi nhận thành công
          const duration = Date.now() - startTime;
          this.apiMetricsService.recordDuration(duration); // Ghi nhận thời gian thực thi
          this.logger.log(`[SUCCESS] ${method} ${originalUrl} - ${duration}ms`);
        },
        error: () => {
          this.apiMetricsService.recordError(); // Ghi nhận lỗi
          const duration = Date.now() - startTime;
          this.apiMetricsService.recordDuration(duration); // Ghi nhận thời gian thực thi
          this.logger.error(`[ERROR] ${method} ${originalUrl} - ${duration}ms`);
        }
      }),
    );
  }
}