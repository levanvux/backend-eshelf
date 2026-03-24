import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Shelf API')
    .setDescription('API documentation for E-book platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
}

bootstrap();
