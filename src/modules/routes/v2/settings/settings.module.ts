import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import SettingsRepository from './settings.repository';
import SettingsService from './settings.service';
import {
  ScorerSetting,
  ScorerSettingSchema,
  Setting,
  SettingSchema,
} from './schemas/setting.schema';
import DomainsModule from '../domains/domains.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Setting.name,
        schema: SettingSchema,
        discriminators: [
          { name: ScorerSetting.name, schema: ScorerSettingSchema },
        ],
      },
    ]),
    DomainsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService, SettingsRepository],
})
export default class SettingsModule {}
