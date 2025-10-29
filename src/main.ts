import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService<AllConfigType>);
  const config = new DocumentBuilder()
    .setTitle('Pulse API')
    .setDescription('API documentation for Pulse application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableCors();

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});
