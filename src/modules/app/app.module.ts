import * as path from 'path';

import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import AppController from './app.controller';
import AppService from './app.service';
import EventsModule from '../events/eventsModule';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemSetting } from '../routes/v1/systemSettings/schemas/systemSetting.schema';
import SystemSettingsModule from '../routes/v1/systemSettings/systemSettings.module';
import SystemSettingsService from '../routes/v1/systemSettings/systemSettings.service';
import V1Module from 'src/modules/routes/v1/v1.module';
import V2Module from '../routes/v2/v2.module';
import V3Module from 'src/modules/routes/v3/v3.module';
import configuration from 'src/config/configuration';
import { decrypt } from 'src/decrypt';

import { SortNPaginationService } from 'src/common/aggregations';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const database = await configService.get('database');
        const url =
          'mongodb+srv://craadbuser:cJpKkhoPOgYjHjJh@cluster0.u0kcd.mongodb.net/craa_services_db?retryWrites=true&w=majority';
        return {
          uri: process.env.NODE_ENV === 'staging' ? url : database.uri,
          // connectionFactory: (connection) => {
          //   connection.plugin(require('mongoose-auto-increment'));
          //   return connection;
          // },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      connectionName: 'demo_db',
      useFactory: async (configService: ConfigService) => {
        const database = await configService.get('database');
        return {
          uri:
            process.env.NODE_ENV === 'staging'
              ? database.demo_uri
              : database.demo_uri,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      connectionName: 'demo_db2',
      useFactory: async (configService: ConfigService) => {
        const database = await configService.get('database');
        return {
          uri:
            process.env.NODE_ENV === 'staging'
              ? database.demo_uri2
              : database.demo_uri2,
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [SystemSettingsModule],
      useFactory: async (
        configService: ConfigService,
        systemSettingsService: SystemSettingsService,
      ) => {
        const texts =
          (await systemSettingsService.findDBKeys()) as SystemSetting[];

        let awsConsoleKeys = {} as any;
        let awsSmtpKeys = {} as any;
        texts.forEach((_text) => {
          let keys = [];
          if (_text.id === 'tmfl') {
            keys = decrypt(_text.enck, `${_text.thfxm}${_text.cAtRaw}`);
            awsConsoleKeys = { ...keys };
          } else if (_text.id === 'dpax') {
            keys = decrypt(_text.enck, `${_text.thfxm}${_text.cAtRaw}`);
            awsSmtpKeys = { ...keys };
          }
        });
        return {
          transport: {
            host: awsSmtpKeys.hVal,
            port: awsSmtpKeys.tVal,
            secure: true,
            auth: {
              user: awsSmtpKeys.uVal,
              pass: awsSmtpKeys.pVal,
            },
            // tls: { rejectUnauthorized: false },
          },
          defaults: {
            from: awsSmtpKeys.sVal,
          },
          template: {
            dir: path.join(String(process.env.PWD), 'src/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService, SystemSettingsService],
    }),
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
      ],
      load: [configuration],
      isGlobal: true,
    }),
    EventsModule,
    V1Module,
    V2Module,
    V3Module,
  ],
  controllers: [AppController],
  providers: [AppService, SortNPaginationService],
  exports: [SortNPaginationService],
})
export default class AppModule {}
