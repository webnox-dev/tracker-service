import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const startedAt = Date.now();

    this.logger.log(
      `Incoming ${request.method} ${request.originalUrl} from ${request.ip ?? 'unknown-ip'}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `Completed ${request.method} ${request.originalUrl} with ${response.statusCode} in ${Date.now() - startedAt}ms`,
          );
        },
      }),
    );
  }
}
