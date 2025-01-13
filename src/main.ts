import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError, ValidationPipe } from '@nestjs/common';

import AllExceptionsFilter from './common/filters/all-exceptions.filter';
import AppModule from './modules/app/app.module';
import { NestFactory } from '@nestjs/core';
import ValidationExceptions from './common/exceptions/validation.exceptions';
import helmet from 'helmet';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationExceptions(errors),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(json({ limit: '50mb' }));
  const options = new DocumentBuilder()
    .setTitle('CRAA API v1') // -- switching it to a temp (but an official) title (02/23/2022, dk)
    .setDescription('CRAA Services API v.1.0 Reference') // -- switching it to a temp (but an official) title (02/23/2022, dk)
    .setVersion('1.0')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  const styleOption = {
    // -- added to hide swagger logo/brand (02/23/2022, dk)
    customCss: `
      .swagger-ui .topbar { display: none; padding: 0; }
      .information-container.wrapper {margin-top: -30px; padding: 0;}
      .swagger-ui .info { 
        width: 305px;
        background-color: #eeefea;
        padding: 15px 20px 10px;
        border-radius: 15px;
        box-shadow: inset 0px 1px 1px #5a5757;
      }
      .swagger-ui .info .title { color: #454640;  text-shadow: 1px 1px 0px rgb(0 0 0 / 30%);}
      .swagger-ui .info .title small {background-color: #89bf04 ;}
      .swagger-ui .info .title small.version-stamp {display: none;}
      .swagger-ui .info .description {margin-top: -10px;}
      .swagger-ui .scheme-container {margin-top: -20px;   box-shadow: 0 -5px 3px -3px #ebe6e6, 0 5px 3px -3px #e9e7e7;}
      `,
  };

  SwaggerModule.setup('api', app, document, styleOption); // -- to inject style option (02/23/2022, dk)

  app.enableCors({
    origin: [
      '*',
      // USER
      // 'http://18.222.137.34:3000',
      // 'https://18.222.137.34:3000',
      // 'http://craa-user-dev.hoansoft.com:3000',
      'https://craa-app-dev-3.hoansoft.com',
      // CLIENT
      // 'http://3.132.10.150:4173',
      // 'https://3.132.10.150:4173',
      // 'http://craa-client-dev.hoansoft.com:4173',
      'https://craa-client-dev-3.hoansoft.com',
      // Training
      // 'http://18.117.14.6:4173',
      // 'https://18.117.14.6:4173',
      // 'http://craa-training-dev.hoansoft.com:4173',
      'https://craa-training-dev-3.hoansoft.com',
      // ADMIN
      // 'http://craa-admin-dev.hoansoft.com:4173',
      // 'http://craa-admin-dev.hoansoft.com:4173',
      'https://craa-admin-dev-3.hoansoft.com',
      // 'http://18.117.160.88:4173',
      // 'https://18.117.160.88:4173',
      // API
      // 'http://18.118.156.28:4173',
      // 'https://18.118.156.28:4173',
      // 'http://craa-prod-api.hoansoft.com:4173',
      'https://craa-prod-api.hoansoft.com',
      // /////////////////////////////////////
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:8084',
      'https://craa-prod-user.hoansoft.com',
      'https://craa-prod-admin.hoansoft.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.use(helmet());

  let port = 4000;
  if (process.env.NODE_ENV === 'production') {
    port = 8080;
  } else if (process.env.NODE_ENV === 'staging') {
    port = 4173;
  }

  await app.listen(port, () => {
    console.log(`app listening at port ${port}`);
  });
}
bootstrap();
