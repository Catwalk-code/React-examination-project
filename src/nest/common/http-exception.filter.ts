import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { MongoLoggerService } from './mongo-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private mongoLogger: MongoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = 500;
    let message = 'Внутренняя ошибка сервера';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string'
        ? body
        : (body as any).message || (body as any).error || message;
    }

    void this.mongoLogger.write({
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      method: request?.method,
      path: request?.originalUrl || request?.url,
      timestamp: new Date(),
    });

    response.status(status).json({ error: Array.isArray(message) ? message.join(', ') : message });
  }
}
