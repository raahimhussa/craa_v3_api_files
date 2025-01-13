import {
  ConnectFindingGroup,
  ConnectFindingGroupSchema,
} from './schemas/connectFindingGroup.schema';

import { ConnectFindingGroupsController } from './connectFindingGroups.controller';
import ConnectFindingGroupsRepository from './connectFindingGroups.repository';
import ConnectFindingGroupsService from './connectFindingGroups.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ConnectFindingGroup.name,
        useFactory: () => {
          const schema = ConnectFindingGroupSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [ConnectFindingGroupsController],
  providers: [ConnectFindingGroupsService, ConnectFindingGroupsRepository],
  exports: [ConnectFindingGroupsService, ConnectFindingGroupsRepository],
})
export default class ConnectFindingGroupsModule {}
