import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { SimDoc, SimDocDocument } from './schemas/simDoc.schema';

import FoldersService from '../../v2/folders/folders.service';
import SimDocDto from './dto/simDoc.dto';
import SimDocsRepository from './simDocs.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class SimDocsService {
  constructor(
    private readonly simDocsRepository: SimDocsRepository,
    private readonly foldersService: FoldersService,
  ) {}

  create(simDoc: SimDocDto): Promise<SimDoc | null> {
    return this.simDocsRepository.create(simDoc);
  }

  bulkDemoCreate(simDocs: SimDocDto[]) {
    return this.simDocsRepository.bulkDemoCreate(simDocs);
  }

  finCount(query: MongoQuery<SimDoc>) {
    return this.simDocsRepository.findCount(query);
  }

  find(query: MongoQuery<SimDoc>): Promise<SimDoc[] | null> {
    return this.simDocsRepository.find(query);
  }

  findOne(query: MongoQuery<SimDoc>): Promise<SimDoc | null> {
    return this.simDocsRepository.findOne(query);
  }

  public async excelExport() {
    const simDocs = await this.simDocsRepository.find({
      filter: { isDeleted: false },
    });
    const folders = await this.foldersService.find({
      filter: { isDeleted: false },
    });

    const wb = new Workbook();
    const ws = wb.addWorksheet('Simulations');
    ws.addRow([
      'id',
      'kind',
      'title',
      'folder name',
      'file name',
      'number of pills to show',
      'number of pills to be taken by subject',
      'number of pills to be prescribed',
      'active',
    ]);

    simDocs.forEach((_simDoc) => {
      const id = _simDoc.visibleId;
      const kind = _simDoc.kind;
      const title = _simDoc.title;
      const folderName =
        folders.find((_folder) => _folder._id.toString() === _simDoc.folderId)
          ?.name || '';
      const fileName = _simDoc.files.length > 0 ? _simDoc.files[0].name : '';
      const numberOfPillsToShow = _simDoc.numberOfPillsToShow;
      const numberOfPillsToBeTakenBySubject =
        _simDoc.numberOfPillsTakenBySubject;
      const numberOfPillsToBePrescribed = _simDoc.numberOfPillsPrescribed;
      const active = _simDoc.isActivated ? 'active' : 'inactive';
      ws.addRow([
        id,
        kind,
        title,
        folderName,
        fileName,
        numberOfPillsToShow,
        numberOfPillsToBeTakenBySubject,
        numberOfPillsToBePrescribed,
        active,
      ]);
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'tmp',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          wb.xlsx
            .writeFile(file)
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });
    return File;
  }

  update(body: MongoUpdate<SimDocDocument>) {
    if (body.options?.multi) {
      return this.simDocsRepository.updateOne(body);
    }
    return this.simDocsRepository.updateMany(body);
  }

  delete(query: MongoDelete<SimDocDocument>) {
    return this.simDocsRepository.deleteMany(query);
  }

  async findByFolderIds(folderIds: any[]): Promise<SimDoc[]> {
    return this.simDocsRepository.find({
      filter: {
        folderId: {
          $in: folderIds,
        },
      },
    });
  }
}
