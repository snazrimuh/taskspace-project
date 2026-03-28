import 'dotenv/config';
import * as classValidator from 'class-validator';
import * as classTransformer from 'class-transformer';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

const server = express();
let app: any;

async function bootstrap() {
  if (app) return;

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] },
  );

  nestApp.setGlobalPrefix('api/v1');
  nestApp.use(cookieParser());

  const allowedOrigins = [
    'https://task-space.rizan.app',
    'https://unified-portal.rizan.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  nestApp.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.rizan.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validatorPackage: classValidator,
      transformerPackage: classTransformer,
    }),
  );

  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.useGlobalInterceptors(new ResponseInterceptor());

  await nestApp.init();
  app = nestApp;
}

export default async (req: Request, res: Response) => {
  await bootstrap();
  server(req, res);
};
