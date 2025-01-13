import * as AutoIncrementFactory from 'mongoose-sequence';

import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';

import AssessmentCyclesModule from '../assessmentCycles/assessmentCycles.module';
import AssessmentTypesModule from '../assessmentTypes/assessmentTypes.module';
import ClientUnitsModule from '../clientUnits/clientUnits.module';
import { Connection } from 'mongoose';
import { forwardRef, Module } from '@nestjs/common';
import PasswordService from './password.service';
import RolesModule from '../roles/roles.module';
import UserAssessmentCyclesModule from '../userAssessmentCycles/userAssessmentCycles.module';
import UserSimulationsModule from '../../v2/userSimulations/userSimulations.module';
import UserTrainingsModule from '../../v2/userTrainings/userTrainings.module';
import UsersBusinessService from './business.service';
import UsersController from './users.controller';
import UsersRepository from './users.repository';
import UsersService from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: async (connection: Connection) => {
          const schema = UserSchema;

          schema.pre('save', async function (next) {
            const userCount = await connection.db
              .collection('users')
              .countDocuments();
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const user = this;
            const firstName_0 =
              user.profile.firstName.length > 0
                ? user.profile.firstName[0]
                : '';
            const lastName_0 =
              user.profile.lastName.length > 0 ? user.profile.lastName[0] : '';
            user.profile.initial = `${firstName_0.toUpperCase()}${lastName_0.toUpperCase()}-${userCount}`;
            next();
          });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    RolesModule,
    AssessmentCyclesModule,
    UserAssessmentCyclesModule,
    AssessmentTypesModule,
    UserSimulationsModule,
    UserTrainingsModule,
    ClientUnitsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersBusinessService,
    PasswordService,
  ],
  exports: [
    UsersService,
    UsersRepository,
    UsersBusinessService,
    PasswordService,
  ],
})
export default class UsersModule {}
