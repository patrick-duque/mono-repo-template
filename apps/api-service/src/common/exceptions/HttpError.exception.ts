import { HttpException, HttpStatus } from '@nestjs/common';

export default class HttpError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
