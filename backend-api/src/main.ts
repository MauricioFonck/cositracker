import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error if extra properties present
    transform: true,            // Transform payloads to DTO instances
  }));

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
