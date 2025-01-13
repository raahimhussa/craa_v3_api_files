import {
  SystemSetting,
  SystemSettingSchema,
} from './schemas/systemSetting.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SystemSettingsController from './systemSettings.controller';
import SystemSettingsRepository from './systemSettings.repository';
import SystemSettingsService from './systemSettings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SystemSetting.name,
        schema: SystemSettingSchema,
      },
    ]),
  ],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, SystemSettingsRepository],
  exports: [SystemSettingsService, SystemSettingsRepository],
})
export default class SystemSettingsModule {}
