import { Injectable, type PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';

import { BadRequestException } from 'common/exceptions';

@Injectable()
export class ZodValidationPipe<
  TSchema extends ZodType,
> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.infer<TSchema> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    return result.data;
  }
}

export const zodValidationPipe = <TSchema extends ZodType>(schema: TSchema) =>
  new ZodValidationPipe(schema);
