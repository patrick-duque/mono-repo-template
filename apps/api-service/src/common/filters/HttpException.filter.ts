import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';

import { type Response } from 'common/models';

type HttpExceptionBody = {
  statusCode?: unknown;
  message?: unknown;
  data?: unknown;
  errors?: unknown;
  error?: unknown;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const getMessage = (
  responseBody: unknown,
  fallbackMessage: string,
): string | string[] => {
  if (isObjectRecord(responseBody)) {
    const message = responseBody.message;

    if (typeof message === 'string' || isStringArray(message)) {
      return message;
    }
  }

  if (typeof responseBody === 'string') {
    return responseBody;
  }

  return fallbackMessage;
};

const getValidationMessages = (errors: unknown): string[] | undefined => {
  if (!Array.isArray(errors)) return undefined;

  const messages = errors
    .map((error) => {
      if (!isObjectRecord(error)) return undefined;
      return typeof error.message === 'string' ? error.message : undefined;
    })
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages : undefined;
};

const getData = (responseBody: unknown): unknown => {
  if (!isObjectRecord(responseBody)) return undefined;

  const body = responseBody as HttpExceptionBody;

  if (body.data !== undefined && body.errors !== undefined) {
    return { data: body.data, errors: body.errors };
  }

  if (body.data !== undefined) return body.data;
  if (body.errors !== undefined) return { errors: body.errors };

  const extraEntries = Object.entries(responseBody).filter(
    ([key]) => !['statusCode', 'message', 'error'].includes(key),
  );

  if (extraEntries.length === 0) return undefined;

  return Object.fromEntries(extraEntries);
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<ExpressResponse>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      const data = getData(responseBody);
      const validationMessages = isObjectRecord(responseBody)
        ? getValidationMessages(responseBody.errors)
        : undefined;
      const message =
        validationMessages ??
        getMessage(responseBody, exception.message || 'Request failed.');

      const envelope: Response = {
        statusCode,
        ...(data !== undefined ? { data } : {}),
        message,
      };

      response.status(statusCode).json(envelope);
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error.';
    const envelope: Response = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(envelope);
  }
}
