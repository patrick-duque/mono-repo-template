import { HttpException, HttpStatus } from '@nestjs/common';

export default class UnauthorizedException extends HttpException {
  constructor() {
    super('Unauthorized.', HttpStatus.UNAUTHORIZED);
  }
}
