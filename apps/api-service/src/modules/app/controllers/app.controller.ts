import { Controller, Get } from '@nestjs/common';

import { Response } from 'common/models';

@Controller()
class AppController {
  @Get()
  async index(): Promise<Response> {
    return {
      data: {
        version: process.env.APP_VERSION,
      },
      message: `Welcome ${process.env.APP_TITLE}`,
    };
  }
}

export default AppController;
