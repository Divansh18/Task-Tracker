import { randomUUID } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as unknown as { crypto: { randomUUID: typeof randomUUID } })
    .crypto = { randomUUID };
} else if (typeof globalThis.crypto.randomUUID !== 'function') {
  (globalThis.crypto as unknown as { randomUUID: typeof randomUUID }).randomUUID =
    randomUUID;
}

async function bootstrap() {
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`🚀 Backend listening on http://localhost:${port}`);
}
bootstrap();
