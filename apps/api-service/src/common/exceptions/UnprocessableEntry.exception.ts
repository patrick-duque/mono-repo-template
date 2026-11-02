import { HttpException, HttpStatus } from '@nestjs/common';

export default class UnprocessableEntryException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
