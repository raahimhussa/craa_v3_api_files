import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';

import CreateFileDto from './dto/create-file.dto';
import { FileDocument } from './schemas/files.schema';
import FilesRepository from './files.repository';
import FoldersRepository from '../../v2/folders/folders.repository';
import { Injectable } from '@nestjs/common';
import SimDocsRepository from '../simDocs/simDocs.repository';
import SimulationsRepository from '../simulations/simulations.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly simDocsRepository: SimDocsRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly simulationsRepository: SimulationsRepository,
  ) {}

  create(createFileDto: CreateFileDto) {
    return this.filesRepository.create(createFileDto);
  }

  async find(query: FindQuery<FileDocument>) {
    const simulationId = query?.options?.fields?.selectedSimulationId;
    if (!simulationId) return this.filesRepository.find(query);
    const files = await this.filesRepository.find({ filter: query.filter });
    const simDocs = await this.simDocsRepository.find({ filter: {} });
    const folders = await this.foldersRepository.find({ filter: {} });
    const simulations = await this.simulationsRepository.find({ filter: {} });
    return files.filter((_file) => {
      const simDoc = simDocs.find((_simDoc) =>
        _simDoc.files.find(
          (_simFile) => _simFile._id.toString() === _file._id.toString(),
        ),
      );
      if (!simDoc) return false;
      const folder = folders.find(
        (_folder) => _folder._id.toString() === simDoc.folderId.toString(),
      );
      if (!folder) return false;
      const _simulations = simulations.filter((_simulation) =>
        _simulation.folderIds.includes(folder._id.toString()),
      );
      if (_simulations.length === 0) return false;
      for (let i = 0; i < _simulations.length; i++) {
        if (_simulations[i]._id.toString() === simulationId) return true;
      }
      return false;
    });
  }

  async queryFind(query: MongoQuery<File>) {
    return this.filesRepository.queryFind(query);
  }

  async getNumberOfElement(query: MongoQuery<File>): Promise<number> {
    const simulationId = query?.options?.fields?.selectedSimulationId;

    if (simulationId) return 0;
    return this.filesRepository.getNumberOfElement(query);
  }

  async pdfFind(path: string) {
    return this.filesRepository.pdfFind(path);
  }

  imageFind(query: FindQuery<FileDocument>) {
    return this.filesRepository.find(query);
  }

  update(query: PatchBody<FileDocument>) {
    if (query.options?.multi) {
      return this.filesRepository.updateMany(query);
    }
    return this.filesRepository.updateOne(query);
  }

  rename(query: PatchBody<FileDocument>) {
    return this.filesRepository.rename(query);
  }

  delete(query: DeleteQuery<FileDocument>) {
    return this.filesRepository.deleteOne(query);
  }
}
