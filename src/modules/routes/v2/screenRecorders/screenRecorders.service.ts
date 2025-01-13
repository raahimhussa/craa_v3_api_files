import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import ScreenRecorderDto from './dto/screenRecorder.dto';
import ScreenRecordersRepository from './screenRecorders.repository';
import { ScreenRecorder } from './schemas/screenRecorder.schema';

@Injectable()
export default class ScreenRecordersService {
  constructor(
    private readonly screenRecordersRepository: ScreenRecordersRepository,
  ) {}

  public async create(
    screenRecorder: ScreenRecorderDto,
  ): Promise<ScreenRecorder | null> {
    return this.screenRecordersRepository.create(screenRecorder);
  }

  public async find(
    query: MongoQuery<ScreenRecorder>,
  ): Promise<ScreenRecorder[] | null> {
    return this.screenRecordersRepository.find(query);
  }

  public async findOne(
    query: MongoQuery<ScreenRecorder>,
  ): Promise<ScreenRecorder | null> {
    return this.screenRecordersRepository.findOne(query);
  }

  public async findById(id: string): Promise<ScreenRecorder | null> {
    return this.screenRecordersRepository.findById(id);
  }

  public async update(
    body: MongoUpdate<ScreenRecorder>,
  ): Promise<ScreenRecorder | null> {
    if (body.options?.isUniq) {
      var _ = require('lodash');
      const data: any = await this.screenRecordersRepository.findOne(body);
      const uniq = _.uniqBy(data?.recorders, 'info.recordId');
      return this.screenRecordersRepository.updateUniq(body, uniq);
    } else {
      return this.screenRecordersRepository.update(body);
    }
  }

  public async delete(
    query: MongoDelete<ScreenRecorder>,
  ): Promise<ScreenRecorder[] | null> {
    return this.screenRecordersRepository.deleteMany(query);
  }
}
