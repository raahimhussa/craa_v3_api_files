import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import FindingDto, { FindingsArray } from './dto/finding.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Domain } from '../domains/schemas/domain.schema';
import DomainsRepository from '../domains/domains.repository';
import { Finding } from './schemas/finding.schema';
import { FindingStatus } from 'src/utils/status';
import FindingsRepository from './findings.repository';
import { Folder } from '../folders/schemas/folder.schema';
import FoldersRepository from '../folders/folders.repository';
import FoldersService from '../folders/folders.service';
import { SimDoc } from '../../v1/simDocs/schemas/simDoc.schema';
import SimDocsRepository from '../../v1/simDocs/simDocs.repository';
import SimDocsService from '../../v1/simDocs/simDocs.service';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import SimulationMappersService from '../../v3/simulationMapper/simulationMappers.service';
import { SimulationsService } from '../../v1/simulations/simulations.service';
import { Workbook } from 'exceljs';

@Injectable()
export default class FindingsService {
  constructor(
    private readonly findingsRepository: FindingsRepository,
    private readonly simDocsRepository: SimDocsRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly simulationsService: SimulationsService,
    private readonly domainsRepository: DomainsRepository,
    private readonly simDocsService: SimDocsService,
    private readonly foldersService: FoldersService,
    private readonly simulationMappersService: SimulationMappersService,
  ) {}

  public async create(finding: FindingDto): Promise<Finding | null> {
    const visibleId = await this.findingsRepository.findMaxNumber();
    const addedSimulationMappers = finding.addedSimulationMappers || [];
    const removedSimulationMappers = finding.removedSimulationMappers || [];
    await this.updateSimulationMappers(
      addedSimulationMappers,
      removedSimulationMappers,
    );
    return this.findingsRepository.create({
      ...finding,
      visibleId: visibleId + 1,
    });
  }

  public async demoBulkCreate(findings: Finding[]) {
    this.findingsRepository.bulkCreate(findings);
  }

  // public async findWithJoin(
  //   query: MongoQuery<Finding>,
  // ): Promise<Finding[] | null> {
  //   return this.findingsRepository.find(query);
  // }

  public async find(query: MongoQuery<Finding>): Promise<Finding[] | null> {
    try {
      if (query.options?.withJoin) {
        return this.findingsRepository.find(query);
      }
      const skip = query.options?.skip;
      const limit = query.options?.limit;
      const simulationId = query?.options?.fields?.selectedSimulationId;
      const notSelectedSimulationId =
        query?.options?.fields?.notSelectedSimulationId;
      const notSelectedSimDocId = query?.options?.fields?.notSelectedSimDocId;
      const searchString = query?.options?.fields?.searchString;
      if (
        !simulationId &&
        !searchString &&
        !notSelectedSimulationId &&
        !notSelectedSimDocId
      ) {
        return this.findingsRepository.findWithOriginal(query);
      }
      const findings = await this.filtering(
        query,
        simulationId,
        searchString,
        notSelectedSimulationId,
        notSelectedSimDocId,
      );

      return (skip === 0 || skip) && limit
        ? findings.slice(skip, skip + limit)
        : findings;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async findOne(query: MongoQuery<Finding>): Promise<Finding | null> {
    return this.findingsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Finding | null> {
    return this.findingsRepository.findById(id);
  }

  public async getNumberOfElement(query: MongoQuery<Finding>): Promise<number> {
    const simulationId = query?.options?.fields?.selectedSimulationId;
    const searchString = query?.options?.fields?.searchString;
    const notSelectedSimulationId =
      query?.options?.fields?.notSelectedSimulationId;
    const notSelectedSimDocId = query?.options?.fields?.notSelectedSimDocId;
    if (
      !simulationId &&
      !searchString &&
      !notSelectedSimulationId &&
      !notSelectedSimDocId
    )
      return (await this.findingsRepository.findWithOriginal(query)).length;
    const findings = await this.filtering(
      query,
      simulationId,
      searchString,
      notSelectedSimulationId,
      notSelectedSimDocId,
    );
    return findings.length;
  }

  public async filtering(
    query: MongoQuery<Finding>,
    simulationId: string,
    searchString: string,
    notSelectedSimulationId?: string,
    notSelectedSimDocId?: string,
  ) {
    const simDocs = await this.simDocsRepository.find({ filter: {} });
    const folders = await this.foldersRepository.find({ filter: {} });
    const simulations = await this.simulationsService.find({ filter: {} });
    const selectedSimulation =
      simulations.find((_s) => _s._id.toString() === simulationId) || null;
    const domains = await this.domainsRepository.find({ filter: {} });
    const notSelectedSimulationMappers =
      await this.simulationMappersService.find({
        filter: {
          simulationId:
            simulations.find(
              (_simulation) =>
                _simulation._id.toString() === notSelectedSimulationId,
            )?.visibleId || 0,
        },
      });
    const allSimulationMappers = await this.simulationMappersService.find({
      filter: {
        isDeleted: false,
      },
    });
    const findings = await this.findingsRepository.findWithOriginal({
      filter: {
        ...query.filter,
        $or: [
          {
            visibleId: {
              $nin: notSelectedSimulationMappers.map((_sm) => _sm.findingId),
            },
          },
          {
            simDocId: { $ne: notSelectedSimDocId },
          },
        ],
      },
      projection: query.projection,
    });
    return findings.filter((_finding) => {
      if (simulationId) {
        const tmpSimulationMapper = allSimulationMappers.find(
          (_sm) =>
            _sm.simulationId === selectedSimulation?.visibleId &&
            _sm.findingId === _finding.visibleId,
        );
        if (!tmpSimulationMapper) return false;
        // const simDocId = _finding.simDocId;
        // const simDoc = simDocs.find(
        //   (_simDoc) => _simDoc._id.toString() === simDocId.toString(),
        // );
        // if (!simDoc) return false;
        // const folder = folders.find(
        //   (_folder) => _folder._id.toString() === simDoc.folderId.toString(),
        // );
        // if (!folder) return false;
        // const _simulations = simulations.filter((_simulation) => {
        //   return _simulation.folderIds.includes(folder._id.toString());
        // });
        // if (_simulations.length === 0) return false;
        // for (let i = 0; i < _simulations.length; i++) {
        //   if (_simulations[i]._id.toString() === simulationId) return true;
        // }
      }
      const domain = domains.find(
        (_domain) => _domain._id.toString() === _finding.domainId?.toString(),
      );
      const simDoc = simDocs.find(
        (_simDoc) => _simDoc._id.toString() === _finding.simDocId?.toString(),
      );
      const wSimDocs = simDocs.filter((_simDoc) =>
        _finding.simDocIds.includes(_simDoc._id.toString()),
      );
      const getSeverity = () => {
        if (_finding.severity === 0) return 'critical';
        if (_finding.severity === 1) return 'major';
        if (_finding.severity === 2) return 'minor';
        return '';
      };
      if (
        _finding.text.toLowerCase().includes(searchString.toLowerCase()) ||
        domain?.name?.toLowerCase().includes(searchString.toLowerCase()) ||
        _finding?.cfr?.toLowerCase().includes(searchString.toLowerCase()) ||
        _finding?.ich_gcp?.toLowerCase().includes(searchString.toLowerCase()) ||
        _finding?.visibleId?.toString()?.includes(searchString) ||
        simDoc?.title?.toLowerCase().includes(searchString.toLowerCase()) ||
        wSimDocs?.find((_wSimDoc) =>
          _wSimDoc?.title?.toLowerCase().includes(searchString.toLowerCase()),
        ) ||
        getSeverity().includes(searchString.toLowerCase())
      )
        return true;
      return false;
    });
  }

  public async sampleExcelExport() {
    const wb = new Workbook();
    const ws = wb.addWorksheet('Sample');

    ws.addRow([
      'id',
      'finding',
      'simulation_id',
      'main_document_id',
      'compare_with_1',
      'compare_with_2',
      'severity',
      'cfr',
      'ich_gcp',
      'domain',
      'domain_id',
    ]);
    ws.addRow([
      1,
      'Study Coordinator James D. Wolf (JW) dispensed study medication and rescue medication at Visit 3 for Subject LAT, but is not authorized to perform this task on the Delegation of Authority Log.',
      9,
      33,
      87,
      '',
      'Minor',
      '21 CFR 312.60',
      'ICH 4.1.5',
      'Delegation of Authority',
      8,
    ]);
    ws.addRow([
      2,
      'David Williams obtained consent for Subject DGM, but this individual is not listed in Delegation of Authority Log.',
      9,
      33,
      51,
      '',
      'Minor',
      '21 CFR 312.60',
      'ICH 4.1.5',
      'Delegation of Authority',
      8,
    ]);
    ws.addRow([
      3,
      'Jeff Smith, MD signed the ICF for Subject DGM, but this individual is not listed in the Delegation of Authority Log.',
      10,
      118,
      129,
      '',
      'Minor',
      '',
      'ICH 4.1.5',
      'Source Data Verification',
      8,
    ]);
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

  public async excelExport(query: MongoQuery<Finding>) {
    try {
      const simulationId =
        query?.options?.fields?.selectedSimulationId || ('' as string);
      const searchString =
        query?.options?.fields?.searchString || ('' as string);
      const findings = await this.filtering(query, simulationId, searchString);
      const simDocs = await this.simDocsService.find({ filter: {} });
      const domains = await this.domainsRepository.find({ filter: {} });
      const simulations = await this.simulationsService.find({
        filter: { isDeleted: false },
      });
      const simulationMapper = await this.simulationMappersService.find({
        filter: {},
      });
      const simulationsByFinding = {};
      await Promise.all(
        simulations.map(async (_simulation) => {
          const findings = await this.getRelatedFindings(
            _simulation._id.toString(),
          );
          findings.forEach((_finding) => {
            if (simulationsByFinding[_finding._id.toString()]) {
              simulationsByFinding[_finding._id.toString()].push(
                _simulation.visibleId,
              );
            } else {
              simulationsByFinding[_finding._id.toString()] = [
                _simulation.visibleId,
              ];
            }
          });
        }),
      );

      const wb = new Workbook();
      const ws = wb.addWorksheet('Findings');

      ws.addRow([
        'id',
        'finding',
        'simulation_id',
        'main_document_id',
        'compare_with_1',
        'compare_with_2',
        'severity',
        'cfr',
        'ich_gcp',
        'domain',
        'domain_id',
      ]);
      findings.forEach((_finding) => {
        const id = _finding.visibleId;
        const finding = _finding.text;
        const simulation_ids = simulationsByFinding[_finding._id] || [''];
        const main_document_id = simDocs.find(
          (_simDoc) => _simDoc._id.toString() === _finding.simDocId,
        )?.visibleId;
        const compare_with_1 = simDocs.find(
          (_simDoc) =>
            _simDoc._id.toString() ===
            (_finding.simDocIds?.length > 0 ? _finding.simDocIds[0] : ''),
        )?.visibleId;
        const compare_with_2 = simDocs.find(
          (_simDoc) =>
            _simDoc._id.toString() ===
            (_finding.simDocIds?.length > 1 ? _finding.simDocIds[1] : ''),
        )?.visibleId;
        const getSeverity = () => {
          const _severity = _finding.severity;
          if (_severity === 0) return 'Critical';
          if (_severity === 1) return 'Major';
          if (_severity === 2) return 'Minor';
          return '';
        };
        const cfr = _finding.cfr;
        const ich_gcp = _finding.ich_gcp;
        const domain = domains.find(
          (_domain) => _domain._id.toString() === _finding.domainId,
        )?.name;
        const domain_id = domains.find(
          (_domain) => _domain._id.toString() === _finding.domainId,
        )?.visibleId;

        simulation_ids.forEach((simulation_id) => {
          ws.addRow([
            id,
            finding,
            simulation_id,
            main_document_id,
            compare_with_1,
            compare_with_2,
            getSeverity(),
            cfr,
            ich_gcp,
            domain,
            domain_id,
          ]);
        });
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
    } catch (e) {
      console.log(e);
    }
  }

  public async update(body: MongoUpdate<FindingDto>): Promise<Finding | null> {
    const addedSimulationMappers =
      (body.update as any).addedSimulationMappers || [];
    const removedSimulationMappers =
      (body.update as any).removedSimulationMappers || [];
    await this.updateSimulationMappers(
      addedSimulationMappers,
      removedSimulationMappers,
    );
    const prev = await this.find({
      filter: body.filter,
    });
    const findingIds = prev.map((_) => _.visibleId);
    const simulationId = body?.options?.fields?.simulationId;
    const simulationVisibleId = simulationId
      ? (await this.simulationsService.findById(simulationId)).visibleId
      : 0;
    const prevMappers = await this.simulationMappersService.find({
      filter: {
        simulationId: simulationVisibleId,
        findingId: { $in: findingIds },
      },
    });

    if (findingIds?.length > 0 && simulationVisibleId) {
      const promise = findingIds.map(async (findingId) => {
        if (
          !prevMappers.find(
            (_prevMapper) =>
              _prevMapper.findingId === findingId &&
              _prevMapper.simulationId === simulationVisibleId,
          )
        ) {
          await this.simulationMappersService.create({
            simulationId: simulationVisibleId,
            findingId: findingId,
          });
        }
      });
      await Promise.all(promise);
    }

    return this.findingsRepository.update(body);
  }

  public async delete(query: MongoDelete<Finding>): Promise<Finding[] | null> {
    return this.findingsRepository.deleteMany(query);
  }

  public async findBySimDocIds(simDocIds: any[]): Promise<Finding[]> {
    return this.findingsRepository.findWithOriginal({
      filter: {
        simDocId: {
          $in: simDocIds,
        },
      },
    });
  }

  async bulkCreate(findingsArray: FindingsArray) {
    try {
      const findings: FindingDto[] = [];
      const domains: Domain[] = await this.domainsRepository.find({
        filter: { isDeleted: false },
      });
      const simDocs: SimDoc[] = await this.simDocsRepository.find({
        filter: { isDeleted: false },
      });
      // const simulations: Simulation[] = await this.simulationsService.find({
      //   filter: { isDeleted: false },
      // });
      // const folders: Folder[] = await this.foldersService.find({
      //   filter: { isDeleted: false },
      // });
      const getSeverity = (severity: string | null) => {
        if (severity === 'Critical') return 0;
        if (severity === 'Major') return 1;
        if (severity === 'Minor') return 2;
        return null;
      };

      for (const row of findingsArray) {
        const finding: FindingDto = {
          visibleId: -1,
          text: 'empty',
          severity: 0,
          cfr: '',
          ich_gcp: '',
          domainId: '',
          simDocId: '',
          simDocIds: [],
          status: FindingStatus.Active,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActivated: false,
        };
        if (!row.finding) return;
        const domainName = '';
        // let simulationIds = [];
        // finding.visibleId = row.id;
        finding.text = row.finding;
        finding.severity = getSeverity(row.severity);
        finding.cfr = row.cfr;
        finding.ich_gcp = row.ich_gcp;
        const foundDomain = domains.find(
          (_domain) => _domain.visibleId === row.domain_id,
        );
        const domainId = foundDomain?._id?.toString() || '';
        finding.domainId = domainId;
        const simDocId =
          simDocs
            .find(
              (_simDoc) => _simDoc.visibleId === Number(row.main_document_id),
            )
            ?._id?.toString() || '';
        const simDocIds = simDocs
          .filter(
            (_simDoc) =>
              _simDoc.visibleId === Number(row.compare_with_1) ||
              _simDoc.visibleId === Number(row.compare_with_2),
          )
          .map((_simDoc) => _simDoc?._id?.toString() || '');
        finding.simDocId = simDocId;
        finding.simDocIds = simDocIds;

        // const localDomain = domains.find(
        //   (_domain) => _domain._id.toString() === finding.domainId,
        // );
        const findingId = (await this.create(finding)).visibleId;
        row.simulation_id &&
          (await this.simulationMappersService.create({
            simulationId: row.simulation_id,
            findingId,
          }));
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
    // await Promise.all(
    //   findings.map(async (_finding) => {
    //     await this.create(_finding);
    //   }),
    // );
    // this.findingsRepository.bulkCreate(findings);
  }
  async getRelatedSimDocs(simulationId: string) {
    try {
      const { folderIds } = await this.simulationsService.findById(
        simulationId,
      );

      const subFolders = await this.foldersService.findByIds(folderIds);

      const subFolderIds = subFolders?.map((folder) => folder._id) || [];

      const totalFolderIds = [...folderIds, ...subFolderIds];

      const simDocs = await this.simDocsService.findByFolderIds(totalFolderIds);
      const simulationVisibleId = (
        await this.simulationsService.findOne({
          filter: {
            _id: simulationId,
          },
        })
      ).visibleId;

      const simulationMappers = await this.simulationMappersService.find({
        filter: {
          simulationId: simulationVisibleId,
        },
      });
      const findings = await this.find({
        filter: {
          visibleId: {
            $in: [...simulationMappers.map((_sm) => _sm.findingId)],
          },
        },
      });
      return simDocs
        .map((_simDoc) => {
          return {
            ..._simDoc,
            findings: findings.filter((_finding) => {
              return _finding.simDocId === _simDoc._id.toString();
            }),
          };
        })
        .filter((_simDoc) => _simDoc.findings.length !== 0);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async getRelatedFindings(simulationId: string) {
    const simulation = await this.simulationsService.findById(simulationId);

    if (!simulation) return [];

    const { folderIds } = simulation;

    const subFolders = await this.foldersService.findByIds(folderIds);

    const subFolderIds = subFolders?.map((folder) => folder._id) || [];

    const totalFolderIds = [...folderIds, ...subFolderIds];

    const simDocs = await this.simDocsService.findByFolderIds(totalFolderIds);

    const simDocIds = simDocs.map((simDoc) => simDoc._id);

    return await this.findBySimDocIds(simDocIds);
  }

  async updateSimulationMappers(
    addedSimulationMappers: {
      simulationId: number;
      findingId: number;
    }[],
    removedSimulationMappers: { simulationId: number; findingId: number }[],
  ) {
    Promise.all([
      ...addedSimulationMappers.map(async (_addedSimulationMappers) => {
        await this.simulationMappersService.create(_addedSimulationMappers);
      }),
      ...removedSimulationMappers.map(async (_removedSimulationMappers) => {
        await this.simulationMappersService.delete({
          filter: _removedSimulationMappers,
        });
      }),
    ]);
  }
}
