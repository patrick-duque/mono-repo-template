import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

import { type Response } from 'common/models';

const ENVELOPE_KEYS = ['statusCode', 'data', 'meta', 'message'] as const;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasEnvelopeKey = (value: Record<string, unknown>) =>
  ENVELOPE_KEYS.some((key) => key in value);

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    void context;

    return next.handle().pipe(
      map((body: unknown): Response => {
        if (body === undefined) {
          return {};
        }

        if (isObjectRecord(body) && hasEnvelopeKey(body)) {
          const envelope = body as Response;

          return {
            ...(typeof envelope.statusCode === 'number'
              ? { statusCode: envelope.statusCode }
              : {}),
            ...(envelope.data !== undefined ? { data: envelope.data } : {}),
            ...(envelope.meta !== undefined ? { meta: envelope.meta } : {}),
            ...(envelope.message !== undefined
              ? { message: envelope.message }
              : {}),
          };
        }

        return {
          data: body,
        };
      }),
    );
  }
}
