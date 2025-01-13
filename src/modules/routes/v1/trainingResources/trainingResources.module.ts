import { Folder, FolderSchema } from '../../v2/folders/schemas/folder.schema';
import {
  TrainingResource,
  TrainingResourceSchema,
} from './schemas/trainingResources.schema';

import FoldersRepository from '../../v2/folders/folders.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SimDocsModule from '../simDocs/simDocs.module';
import SimulationsModule from '../simulations/simulations.module';
import SystemSettingsModule from '../systemSettings/systemSettings.module';
import { TrainingResourcesController } from './trainingResources.controller';
import TrainingResourcesRepository from './trainingResources.repository';
import { TrainingResourcesService } from './trainingResources.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingResource.name, schema: TrainingResourceSchema },
      { name: Folder.name, schema: FolderSchema },
    ]),
    SystemSettingsModule,
    SimDocsModule,
    SimulationsModule,
  ],
  controllers: [TrainingResourcesController],
  providers: [
    TrainingResourcesService,
    TrainingResourcesRepository,
    FoldersRepository,
  ],
  exports: [
    TrainingResourcesService,
    TrainingResourcesRepository,
    FoldersRepository,
  ],
})
export default class TrainingResourcesModule {}
