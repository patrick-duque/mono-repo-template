import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { HttpExceptionFilter } from 'common/filters';
import { ResponseInterceptor } from 'common/interceptors';

import AppModule from './modules/app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.APP_TITLE as string)
    .setDescription(`REST API for ${process.env.APP_TITLE as string}`)
    .setVersion(process.env.APP_VERSION as string)
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
