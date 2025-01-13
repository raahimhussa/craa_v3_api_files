import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import LogDto from './dto/log.dto';
import TrainingLogsRepository from './trainingLogs.repository';
import { TrainingLog } from './schemas/trainingLogs.schema';

@Injectable()
export default class TrainingLogsService {
  constructor(private readonly logsRepository: TrainingLogsRepository) {}

  public async create(log: LogDto): Promise<TrainingLog | null> {
    return this.logsRepository.create(log);
  }

  public async count(query: MongoQuery<TrainingLog>) {
    const logs = await this.logsRepository.findForCount(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return logs.filter((_variable) => {
        if (
          _variable.event?.toLowerCase().includes(searchString.toLowerCase()) ||
          //@ts-ignore
          _variable.training?.title
            ?.toLowerCase()
            .includes(searchString.toLowerCase())
        )
          return true;
        return false;
      }).length;
    } else {
      return logs.length;
    }
    return this.logsRepository.find(query);
  }

  public async find(
    query: MongoQuery<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    const logs = await this.logsRepository.find(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return logs.filter((_variable) => {
        if (
          _variable.event?.toLowerCase().includes(searchString.toLowerCase()) ||
          //@ts-ignore
          _variable.training?.title
            ?.toLowerCase()
            .includes(searchString.toLowerCase()) ||
          //@ts-ignore
          _variable.training?.pages[_variable.pageId]?.title
            ?.toLowerCase()
            .includes(searchString.toLowerCase())
        )
          return true;
        return false;
      });
    } else {
      //@ts-ignore
      return logs;
    }
    return this.logsRepository.find(query);
  }

  public async findOne(
    query: MongoQuery<TrainingLog>,
  ): Promise<TrainingLog | null> {
    return this.logsRepository.findOne(query);
  }

  public async findById(id: string): Promise<TrainingLog | null> {
    return this.logsRepository.findById(id);
  }

  public async update(
    body: MongoUpdate<TrainingLog>,
  ): Promise<TrainingLog | null> {
    return this.logsRepository.update(body);
  }

  public async delete(
    query: MongoDelete<TrainingLog>,
  ): Promise<TrainingLog[] | null> {
    return this.logsRepository.deleteMany(query);
  }
}
