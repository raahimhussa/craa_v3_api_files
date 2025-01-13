import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  SystemSetting,
  SystemSettingDocument,
} from './schemas/systemSetting.schema';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class SystemSettingsRepository {
  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingsModel: Model<SystemSettingDocument>,
  ) {}

  public async findDBKeys(): Promise<SystemSetting[] | null> {
    return this.systemSettingsModel
      .find({
        id: { $in: ['tmfl', 'dpax'] },
      })
      .lean();
  }

  public async findAll(): Promise<SystemSetting[] | null> {
    return this.systemSettingsModel.find().lean();
  }

  public async findDemoDbVersion(): Promise<SystemSetting | null> {
    return this.systemSettingsModel
      .findOne({
        id: 'demo',
      })
      .lean();
  }

  public async createDemoDbVersion() {
    return this.systemSettingsModel.create({
      id: 'demo',
      version: '1',
    });
  }

  public async updateDemoDbVersion(version: string) {
    return this.systemSettingsModel.updateOne(
      {
        id: 'demo',
      },
      {
        $set: {
          version,
        },
      },
    );
  }
}
