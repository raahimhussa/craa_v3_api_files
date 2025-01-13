import FilesModule from '../../v1/files/files.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfFileManagementController } from './pdfFileManagement.controller';
import PdfFileManagementService from './pdfFileManagement.service';
import PdfFoldersModule from '../../v2/pdfFolders/pdfFolders.module';

@Module({
  imports: [PdfFoldersModule, FilesModule],
  controllers: [PdfFileManagementController],
  providers: [PdfFileManagementService],
  exports: [PdfFileManagementService],
})
export default class PdfFileManagementModule {}
