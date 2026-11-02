import { HttpException, HttpStatus } from '@nestjs/common';

export default class BadRequestException extends HttpException {
  constructor(message: string | Record<string, unknown> = 'Bad request.') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
