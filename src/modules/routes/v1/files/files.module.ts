import { File, FileSchema } from './schemas/files.schema';
import { Folder, FolderSchema } from '../../v2/folders/schemas/folder.schema';

import { FilesController } from './files.controller';
import FilesRepository from './files.repository';
import { FilesService } from './files.service';
import FoldersRepository from '../../v2/folders/folders.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SimDocsModule from '../simDocs/simDocs.module';
import SimDocsRepository from '../simDocs/simDocs.repository';
import SimulationsModule from '../simulations/simulations.module';
import SimulationsRepository from '../simulations/simulations.repository';
import SystemSettingsModule from '../systemSettings/systemSettings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: File.name, schema: FileSchema },
      { name: Folder.name, schema: FolderSchema },
    ]),
    SimDocsModule,
    SimulationsModule,
    SystemSettingsModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, FilesRepository, FoldersRepository],
  exports: [FilesService, FilesRepository, FoldersRepository],
})
export default class FilesModule {}
