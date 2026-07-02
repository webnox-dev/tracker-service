import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseShape {
  message?: string | string[];
  errors?: string[];
  error?: string;
}

function isErrorResponseShape(value: unknown): value is ErrorResponseShape {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isErrorResponseShape(exceptionResponse)) {
        if (typeof exceptionResponse.message === 'string') {
          message = exceptionResponse.message;
        } else if (
          Array.isArray(exceptionResponse.message) &&
          exceptionResponse.message.length > 0
        ) {
          message = 'Validation Failed';
          errors = exceptionResponse.message.filter(
            (value): value is string => typeof value === 'string',
          );
        }

        if (Array.isArray(exceptionResponse.errors)) {
          errors = exceptionResponse.errors.filter(
            (value): value is string => typeof value === 'string',
          );
        } else if (typeof exceptionResponse.error === 'string' && errors.length === 0) {
          errors = [exceptionResponse.error];
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception while processing ${request.method} ${request.originalUrl}`,
        exception.stack,
      );
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof HttpException) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status} ${message}`,
        exception.stack,
      );
    }

    if (status < HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof HttpException) {
      this.logger.warn(`${request.method} ${request.originalUrl} -> ${status} ${message}`);
    }

    response.status(status).json({
      success: false,
      message,
      errors,
    });
  }
}
