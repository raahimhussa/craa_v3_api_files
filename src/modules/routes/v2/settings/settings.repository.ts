import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Setting, SettingDocument } from './schemas/setting.schema';
import SettingDto from './dto/setting.dto';

@Injectable()
export default class SettingsRepository {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  public async create(setting: SettingDto): Promise<Setting | null> {
    const newSetting = await this.settingModel.create(setting);
    return newSetting.toObject();
  }

  public async find(query: MongoQuery<Setting>): Promise<Setting[] | null> {
    return this.settingModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Setting>): Promise<Setting | null> {
    return this.settingModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Setting | null> {
    return this.settingModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Setting>): Promise<Setting | null> {
    const { filter, update, options } = body;

    return this.settingModel
      .updateMany(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async deleteMany(
    query: MongoDelete<Setting>,
  ): Promise<Setting[] | null> {
    const { filter, options } = query;
    return this.settingModel.deleteMany(filter, options).lean();
  }
}
