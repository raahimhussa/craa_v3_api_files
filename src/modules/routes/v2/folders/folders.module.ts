import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoldersController } from './folders.controller';
import FoldersRepository from './folders.repository';
import FoldersService from './folders.service';
import { Folder, FolderSchema } from './schemas/folder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
  ],
  controllers: [FoldersController],
  providers: [FoldersService, FoldersRepository],
  exports: [FoldersService, FoldersRepository],
})
export default class FoldersModule {}
