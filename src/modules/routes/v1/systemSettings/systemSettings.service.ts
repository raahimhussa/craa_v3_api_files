import { Injectable, OnModuleInit } from '@nestjs/common';

import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import { SystemSetting } from './schemas/systemSetting.schema';
import SystemSettingsRepository from './systemSettings.repository';

@Injectable()
export default class SystemSettingsService implements OnModuleInit {
  constructor(
    private readonly systemSettingsRepository: SystemSettingsRepository,
  ) {}

  async onModuleInit() {
    const isExist = await this.findDemoDbVersion();
    if (!isExist) await this.createDemoVersion();
  }

  findAll(): Promise<SystemSetting[] | null> {
    return this.systemSettingsRepository.findAll();
  }

  findDBKeys(): Promise<SystemSetting[] | null> {
    return this.systemSettingsRepository.findDBKeys();
  }

  async findDemoDbVersion() {
    const data = await this.systemSettingsRepository.findDemoDbVersion();
    return data?.version;
  }

  async createDemoVersion() {
    const prevData = await this.findDemoDbVersion();
    if (prevData) return false;
    else this.systemSettingsRepository.createDemoDbVersion();
    return true;
  }

  async updateDemoVersion(version: string) {
    const isExist = await this.findDemoDbVersion();
    if (isExist) {
      await this.systemSettingsRepository.updateDemoDbVersion(version);
    } else {
      await this.systemSettingsRepository.createDemoDbVersion();
    }
  }
}
