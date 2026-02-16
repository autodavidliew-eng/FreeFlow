import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appAny = app as any;
  if (typeof appAny.useBodyParser === 'function') {
    appAny.useBodyParser('json', {
      type: ['application/json', 'application/ld+json', 'application/*+json'],
    });
  }

  const port = process.env.PORT || 8092;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);

  console.log(`🚀 NGSI consumer running on http://${host}:${port}`);
}

bootstrap();
