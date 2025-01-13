import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';

import CreateTrainingResourceDto from './dto/create-file.dto';
import { TrainingResourceDocument } from './schemas/trainingResources.schema';
import TrainingResourcesRepository from './trainingResources.repository';
import FoldersRepository from '../../v2/folders/folders.repository';
import { Injectable } from '@nestjs/common';
import SimDocsRepository from '../simDocs/simDocs.repository';
import SimulationsRepository from '../simulations/simulations.repository';

@Injectable()
export class TrainingResourcesService {
  constructor(
    private readonly trainingResourcesRepository: TrainingResourcesRepository,
    private readonly simDocsRepository: SimDocsRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly simulationsRepository: SimulationsRepository,
  ) {}
  create(createFileDto: CreateTrainingResourceDto) {
    return this.trainingResourcesRepository.create(createFileDto);
  }

  async find(query: FindQuery<TrainingResourceDocument>) {
    const simulationId = query?.options?.fields?.selectedSimulationId;
    if (!simulationId) return this.trainingResourcesRepository.find(query);
    const files = await this.trainingResourcesRepository.find({
      filter: query.filter,
    });
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

  async getNumberOfElement(query: MongoQuery<File>): Promise<number> {
    const simulationId = query?.options?.fields?.selectedSimulationId;

    if (simulationId) return 0;
    return this.trainingResourcesRepository.getNumberOfElement(query);
  }

  imageFind(query: FindQuery<TrainingResourceDocument>) {
    return this.trainingResourcesRepository.find(query);
  }

  update(query: PatchBody<TrainingResourceDocument>) {
    if (query.options?.multi) {
      return this.trainingResourcesRepository.updateOne(query);
    }
    return this.trainingResourcesRepository.updateMany(query);
  }

  delete(query: DeleteQuery<TrainingResourceDocument>) {
    return this.trainingResourcesRepository.deleteOne(query);
  }
}
