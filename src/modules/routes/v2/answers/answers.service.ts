import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Answer } from './schemas/answer.schema';
import AnswerDto from './dto/answer.dto';
import AnswersRepository from './answers.repository';
// import SettingsService from '../settings/settings.service';
// import _ from 'lodash';
// import { ScorerSetting } from '../settings/schemas/setting.schema';
// import _ from 'lodash';

@Injectable()
export default class AnswersService implements OnModuleInit {
  constructor(
    private readonly answersRepository: AnswersRepository, // private readonly settingsService: SettingsService,
  ) {}

  async onModuleInit() {
    // const setting: ScorerSetting =
    //   (await this.settingsService.getScorerSetting()) as unknown as ScorerSetting;
    // const idFilter = (answer) => {
    //   delete answer._id;
    //   return answer;
    // };
    // const answers = await this.find({ filter: {} });
    // await this.update({
    //   filter: {},
    //   update: {
    //     scorerId: setting.firstScorerId,
    //   },
    // });
    // const secondAnswers = answers?.map(idFilter).map((answer) => {
    //   answer.scorerId = setting.secondScorerId;
    //   return answer;
    // });
    // await this.bulkCreate(secondAnswers);
  }

  public async create(answer: AnswerDto): Promise<Answer | null> {
    return this.answersRepository.create(answer);
  }

  public async find(query: MongoQuery<Answer>): Promise<Answer[] | null> {
    return this.answersRepository.find(query);
  }

  public async findOne(query: MongoQuery<Answer>): Promise<Answer | null> {
    return this.answersRepository.findOne(query);
  }

  public async findById(id: string): Promise<Answer | null> {
    return this.answersRepository.findById(id);
  }

  public async update(body: MongoUpdate<Answer>): Promise<Answer | null> {
    return this.answersRepository.update(body);
  }

  public async delete(query: MongoDelete<Answer>): Promise<Answer[] | null> {
    return this.answersRepository.deleteMany(query);
  }

  public async bulkCreate(answers: Answer[]): Promise<Answer[]> {
    return this.answersRepository.insertMany(answers);
  }
}
