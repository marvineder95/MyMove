import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that standardizes error responses.
 * Returns a consistent JSON shape for all HTTP errors.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      error:
        typeof exceptionResponse === 'object' && 'error' in exceptionResponse
          ? exceptionResponse.error
          : HttpStatus[status] || 'ERROR',
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? exceptionResponse.message
          : exception.message,
      details:
        typeof exceptionResponse === 'object' && 'details' in exceptionResponse
          ? exceptionResponse.details
          : null,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] || `req_${Date.now()}`,
    };

    response.status(status).json(errorResponse);
  }
}
