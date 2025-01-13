import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FindQuery,
  MongoDelete,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import CreateSimulationDto from './dto/createSimulation.dto';
import FoldersService from '../../v2/folders/folders.service';
import { Simulation } from './schemas/simulation.schema';
import SimulationsRepository from './simulations.repository';
import { Workbook } from 'exceljs';

import { SortNPaginationService } from 'src/common/aggregations';

@Injectable()
export class SimulationsService {
  constructor(
    private readonly simulationsRepository: SimulationsRepository,
    private readonly foldersService: FoldersService,
    private readonly sortNPaginationService: SortNPaginationService,
  ) {}

  create(createSimulationDto: CreateSimulationDto): Promise<Simulation | null> {
    return this.simulationsRepository.create(createSimulationDto);
  }

  find(query: FindQuery<Simulation>): Promise<Simulation[] | null> {
    if (query['sortBy'] && query['sortBy'][0]) {
      const sortBy = JSON.parse(query['sortBy'][0]);

      const sortField = sortBy.id;
      // const sortOrder = sortBy.desc ? -1 : 1;

      if (sortBy && sortField) {
        // delete query.options.skip;
        // delete query.options.limit;
        // query.options['sort'] = { [sortField]: sortOrder };

        const aggregationPipeline =
          this.sortNPaginationService.createCaseInsensitiveSortNPaginationPipeline(
            sortBy,
            query.options.skip,
            query.options.limit,
          );

        return this.simulationsRepository.aggregate(aggregationPipeline);
      }
    }

    return this.simulationsRepository.find(query);
  }

  findOne(query: FindQuery<Simulation>): Promise<Simulation | null> {
    return this.simulationsRepository.findOne(query);
  }

  async count(query: FindQuery<Simulation>) {
    return this.simulationsRepository.count(query);
  }

  update(
    body: MongoUpdate<Simulation>,
  ): Promise<Simulation[] | null> | Promise<Simulation | null> {
    if (body.options?.multi) {
      return this.simulationsRepository.updateMany(body);
    }
    return this.simulationsRepository.updateOne(body);
  }

  delete(query: MongoDelete<Simulation>) {
    return this.simulationsRepository.deleteMany(query);
  }

  findById(simulationId: any): Promise<Simulation | null> {
    return this.simulationsRepository.findById(simulationId);
  }

  public async excelExport() {
    const simulations = await this.simulationsRepository.find({
      filter: { isDeleted: false },
    });
    const folders = await this.foldersService.find({
      filter: { isDeleted: false },
    });

    const wb = new Workbook();
    const ws = wb.addWorksheet('Simulations');
    ws.addRow(['id', 'name', 'label', 'folder name']);

    simulations.forEach((_simulation) => {
      const id = _simulation.visibleId;
      const name = _simulation.name;
      const label = _simulation.label;
      const folder_name = folders
        .filter((_folder) =>
          _simulation.folderIds.includes(_folder._id.toString()),
        )
        .map((_folder) => _folder.name)
        .join(',');
      ws.addRow([id, name, label, folder_name]);
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
}
