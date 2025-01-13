import { UserSimulationDocument } from '../../v2/userSimulations/schemas/userSimulation.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import {
  AuthLog,
  AuthLogDocument,
} from '../../v2/authLogs/schemas/authLog.schema';
import { User, UserDocument } from '../../v1/users/schemas/users.schema';
import {
  AdminLog,
  AdminLogDocument,
} from '../../v2/adminLogs/schemas/adminLog.schema';

@Injectable()
export default class LogManagerRepository {
  constructor(
    @InjectModel(AuthLog.name)
    private authLogModel: Model<AuthLogDocument>,
    @InjectModel(AdminLog.name)
    private adminLogModel: Model<AdminLogDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  public async findAuthLogs(query: MongoQuery<any>) {
    const { filter, projection, options } = query;

    return this.authLogModel.find(filter, projection, options).lean();
  }

  public async findUsers(query: MongoQuery<User>) {
    const { filter, projection, options } = query;

    return this.userModel.find(filter, projection, options).lean();
  }

  public async findAdminLogs(query: MongoQuery<any>) {
    const { filter, projection, options } = query;
    return this.adminLogModel.find(filter, projection, options).lean();
  }

  public async findAdminLogsCount(query: MongoQuery<any>) {
    const { filter, projection, options } = query;

    return this.adminLogModel.find(filter, projection, options).count();
  }
}
