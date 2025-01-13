import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { ScorerSetting, Setting } from './schemas/setting.schema';

import DomainsService from '../domains/domains.service';
import SettingDto from './dto/setting.dto';
import SettingsRepository from './settings.repository';

@Injectable()
export default class SettingsService implements OnApplicationBootstrap {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly domainsService: DomainsService,
  ) {}

  async onApplicationBootstrap() {
    const scorerSetting = await this.settingsRepository.findOne({
      filter: { kind: ScorerSetting.name },
    });

    if (scorerSetting) return console.info('Exist scorer setting');

    const domains = await this.domainsService.find({
      filter: {
        depth: 0,
        followupNumber: { $gt: 0 },
      },
    });

    const scorerSettingDoc: ScorerSetting = {
      kind: ScorerSetting.name,
      firstScorerId: '',
      secondScorerId: '',
      adjudicatorId: '',
      domains: [],
      updatedAt: new Date(),
      isDeleted: false,
      createdAt: new Date(),
    };

    const settingDomains = domains.map((domain) => {
      return {
        _id: domain._id.toString(),
        label: domain.name,
        minScore: 50,
      };
    });

    scorerSettingDoc.domains = settingDomains;

    await this.settingsRepository.create(scorerSettingDoc);
  }

  public async create(setting: SettingDto): Promise<Setting | null> {
    return this.settingsRepository.create(setting);
  }

  public async find(query: MongoQuery<Setting>): Promise<Setting[] | null> {
    return this.settingsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Setting>): Promise<Setting | null> {
    return this.settingsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Setting | null> {
    return this.settingsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Setting>): Promise<Setting | null> {
    return this.settingsRepository.update(body);
  }

  public async delete(query: MongoDelete<Setting>): Promise<Setting[] | null> {
    return this.settingsRepository.deleteMany(query);
  }

  public async getScorerSetting(): Promise<Setting | null> {
    return this.settingsRepository.findOne({
      filter: {
        kind: ScorerSetting.name,
      },
    });
  }
}
