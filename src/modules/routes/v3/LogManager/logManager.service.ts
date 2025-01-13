import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthLogType } from '../../v2/authLogs/schemas/authLog.schema';
import LogManagerRepository from './logManager.repository';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class LogManagerService {
  constructor(private readonly logManagerRepository: LogManagerRepository) {}

  async findTop10AuthLogs() {
    const users = await this.logManagerRepository.findUsers({
      filter: {
        isDeleted: false,
        email: { $ne: 'superAdmin@hoansoft.com' },
      },
      options: {
        limit: 10,
        sort: { updatedAt: -1 },
      },
    });
    const data = await Promise.all(
      users.map(
        async (_user) =>
          await this.logManagerRepository.findAuthLogs({
            filter: {
              userId: _user._id.toString(),
              type: AuthLogType.SignIn,
            },
            options: {
              sort: { createdAt: -1 },
              limit: 2,
            },
          }),
      ),
    );
    return data.filter((_data) => _data?.length > 0);
  }

  async findSimulationLogs(query: MongoQuery<any>) {
    const data = await this.logManagerRepository.findAdminLogs(query);
    return data;
  }

  async findSimulationLogsCount(query: MongoQuery<any>) {
    const data = await this.logManagerRepository.findAdminLogsCount(query);
    return data;
  }
}
