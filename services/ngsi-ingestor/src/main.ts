import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 8091;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);

  console.log(`🚀 NGSI ingestor running on http://${host}:${port}`);
}

bootstrap();
