import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
}
bootstrap();
