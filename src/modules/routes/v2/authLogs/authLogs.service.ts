import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { AuthLog } from './schemas/authLog.schema';
import AuthLogDto from './dto/authLog.dto';
import AuthLogsRepository from './authLogs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class AuthLogsService {
  constructor(private readonly authAuthLogsRepository: AuthLogsRepository) {}

  public async create(authAuthLog: AuthLogDto): Promise<AuthLog | null> {
    try {
      return this.authAuthLogsRepository.create(authAuthLog);
    } catch (error) {
      console.log(error);
    }
  }

  public async find(query: MongoQuery<AuthLog>): Promise<AuthLog[] | null> {
    return this.authAuthLogsRepository.find(query);
  }

  public async findOne(query: MongoQuery<AuthLog>): Promise<AuthLog | null> {
    return this.authAuthLogsRepository.findOne(query);
  }

  public async findById(id: string): Promise<AuthLog | null> {
    return this.authAuthLogsRepository.findById(id);
  }

  public async update(body: MongoUpdate<AuthLog>): Promise<AuthLog | null> {
    return this.authAuthLogsRepository.update(body);
  }

  public async delete(query: MongoDelete<AuthLog>): Promise<AuthLog[] | null> {
    return this.authAuthLogsRepository.deleteMany(query);
  }
}
