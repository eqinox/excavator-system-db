import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DelayInterceptor } from './delay.interceptor';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // Increase body size limits to allow large base64 images in requests
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  // Enable cookie parser for refresh tokens
  app.use(cookieParser());

  // Debug: Log the static file serving path
  const staticPath = join(process.cwd(), 'public');
  logger.log(`Static files path: ${staticPath}`);
  logger.log(`Current directory: ${process.cwd()}`);
  logger.log(`__dirname: ${__dirname}`);

  // Add a simple test endpoint
  app.use('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  // Serve static files from the public directory without prefix
  app.useStaticAssets(staticPath);

  // Enable CORS with more permissive settings for development
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable validation with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );
  // Register delay interceptor first (if enabled, adds delay before processing)
  const configService = app.get(ConfigService);
  app.useGlobalInterceptors(new DelayInterceptor(configService));
  app.useGlobalInterceptors(new TransformInterceptor());
  // app.useGlobalInterceptors(new ResponseInterceptor());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Excavator API')
    .setDescription('The Excavator API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('categories', 'Category management endpoints')
    .addTag('equipment', 'Equipment management endpoints')
    .addTag('images', 'Image serving endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT ?? 5000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger is running on: ${await app.getUrl()}/api`);
}
bootstrap();
