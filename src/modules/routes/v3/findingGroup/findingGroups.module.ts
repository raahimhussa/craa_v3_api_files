import {
  FindingGroup,
  FindingGroupSchema,
} from './schemas/findingGroup.schema';

import { FindingGroupsController } from './findingGroups.controller';
import FindingGroupsRepository from './findingGroups.repository';
import FindingGroupsService from './findingGroups.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: FindingGroup.name,
        useFactory: () => {
          const schema = FindingGroupSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [FindingGroupsController],
  providers: [FindingGroupsService, FindingGroupsRepository],
  exports: [FindingGroupsService, FindingGroupsRepository],
})
export default class FindingGroupsModule {}
