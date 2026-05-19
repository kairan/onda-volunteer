import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') ?? true,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Leader-Ministry-Id',
      'X-Volunteer-Id',
    ],
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
