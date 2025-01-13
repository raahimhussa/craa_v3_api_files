import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { AdminLog } from './schemas/adminLog.schema';
import AdminLogDao from './dao/adminLogdao';
import AdminLogsRepository from './adminLogs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class AdminLogsService {
  constructor(private readonly logsRepository: AdminLogsRepository) {}

  public async create(log: AdminLogDao): Promise<AdminLog | null> {
    try {
      return this.logsRepository.create(log);
    } catch (error) {
      console.log(error);
    }
  }

  async count(query: MongoQuery<AdminLog>) {
    const logs = await this.logsRepository.findForCount(query);
    const searchString = query?.options?.fields?.searchString;
    return 1;
  }

  public async find(query: MongoQuery<AdminLog>): Promise<AdminLog[] | null> {
    return this.logsRepository.find(query);
  }

  public async findOne(query: MongoQuery<AdminLog>): Promise<AdminLog | null> {
    return this.logsRepository.findOne(query);
  }

  public async findById(id: string): Promise<AdminLog | null> {
    return this.logsRepository.findById(id);
  }

  // public async update(body: MongoUpdate<AdminLog>): Promise<AdminLog | null> {
  public async update(body: MongoUpdate<AdminLog>) {
    if (body.options?.multi) {
      return this.logsRepository.updateMany(body);
    }
    return this.logsRepository.updateOne(body);
  }

  public async delete(
    query: MongoDelete<AdminLog>,
  ): Promise<AdminLog[] | null> {
    return this.logsRepository.deleteMany(query);
  }
}
