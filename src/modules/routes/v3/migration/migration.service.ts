import * as moment from 'moment';
import * as tmp from 'tmp';

import {
  AnswerStatus,
  AssessmentCycleType,
  AssessmentStatus,
  GradeType,
  SimulationType,
  UserSimulationStatus,
  UserTrainingStatus,
} from 'src/utils/status';
import {
  AssessmentCycle,
  Tutorials,
} from '../../v1/assessmentCycles/assessmentCycle.schema';
import {
  AssessmentType,
  AssessmentTypeSimulation,
  AssessmentTypeTraining,
} from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import {
  Authority,
  OTP,
  Profile,
  UserProfileStatus,
  UserStatus,
} from '../../v1/users/interfaces/user.interface';
import {
  BusinessUnit,
  ClientUnit,
} from '../../v1/clientUnits/schemas/clientUnit.schema';
import {
  Page,
  Pages,
  Training,
} from '../../v2/trainings/schemas/training.schema';
import {
  PageProgress,
  PageProgresses,
  UserTraining,
  UserTrainingSummary,
} from '../../v2/userTrainings/schemas/userTraining.schema';
import {
  RescueMedication,
  Result,
  StudyMedication,
  UserSimulation,
} from '../../v2/userSimulations/schemas/userSimulation.schema';

import { Answer } from '../../v2/answers/schemas/answer.schema';
import AnswerDto from '../../v2/answers/dto/answer.dto';
import AnswersService from '../../v2/answers/answers.service';
import { AssessmentCyclesService } from '../../v1/assessmentCycles/assessmentCycles.service';
import AssessmentTypeDto from '../../v1/assessmentTypes/dto/assessmentType.dto';
import AssessmentTypesService from '../../v1/assessmentTypes/assessmentTypes.service';
import AssessmentsService from '../../v2/assessments/assessments.service';
import { BusinessCycle } from 'src/modules/routes/v1/clientUnits/schemas/clientUnit.schema';
import { ClientUnitsService } from '../../v1/clientUnits/clientUnits.service';
import { ComplianceNote } from '../../v2/notes/schemas/note.schema';
import ConnectFindingGroupsService from '../connectFindingGroup/connectFindingGroups.service';
import { CountriesService } from '../../v1/countries/countries.service';
import { Country } from '../../v1/countries/schemas/countries.schema';
import CreateAssessmentDto from '../../v2/assessments/dto/createAssessment.dto';
import CreateFolderDto from '../../v2/folders/dto/folder.dto';
import CreateSimDocDto from '../../v1/simDocs/dto/simDoc.dto';
import CreateSimulationDto from '../../v1/simulations/dto/createSimulation.dto';
import CreateUserAssessmentCycleSummaryDto from '../../v1/userAssessmentCycles/dto/userAssessmentCycleSummary.dto';
import { DocumentType } from 'src/utils/status';
import DomainsRepository from '../../v2/domains/domains.repository';
import { Finding } from '../../v2/findings/schemas/finding.schema';
import FindingGroupsService from '../findingGroup/findingGroups.service';
import FindingsService from '../../v2/findings/findings.service';
import FoldersService from '../../v2/folders/folders.service';
import { Injectable } from '@nestjs/common';
import { KeyConcept } from '../../v2/keyConcepts/schemas/keyConcept.schema';
import KeyConceptsService from '../../v2/keyConcepts/keyConcepts.service';
import Migration2Repository from './migration2.repository';
import MigrationRepository from './migration.repository';
import NotesService from '../../v2/notes/notes.service';
import { Role } from '../../v1/roles/schemas/roles.schema';
import { RolesService } from '../../v1/roles/roles.service';
import SettingsService from '../../v2/settings/settings.service';
import { SimDoc } from '../../v1/simDocs/schemas/simDoc.schema';
import SimDocsService from '../../v1/simDocs/simDocs.service';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import { SimulationMapper } from '../simulationMapper/schemas/simulationMapper.schema';
import SimulationMappersService from '../simulationMapper/simulationMappers.service';
import { SimulationsService } from '../../v1/simulations/simulations.service';
import TrainingsRepository from '../../v2/trainings/training.repository';
import { User } from '../../v1/users/schemas/users.schema';
import { UserAssessmentCycle } from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import UserAssessmentCycleSummariesRepository from '../../v1/userAssessmentCycles/userAssessmentCycleSummaries.repository';
import { UserAssessmentCycleSummary } from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';
import UserAssessmentCyclesRepository from '../../v1/userAssessmentCycles/userAssessmentCycles.repository';
import UserSimulationsRepository from '../../v2/userSimulations/userSimulations.repository';
import UserTrainingsRepository from '../../v2/userTrainings/userTrainings.repository';
import UsersRepository from '../../v1/users/users.repository';
import { Viewport } from '../../v2/viewports/schemas/viewport.schema';
import { getSecondsFromFormattedTime } from 'src/utils/utils';
import mongoose from 'mongoose';

@Injectable()
export default class MigrationsService {
  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly findingsService: FindingsService,
    private readonly usersRepository: UsersRepository,
    private readonly userAssessmentCycleRepository: UserAssessmentCyclesRepository,
    private readonly userAssessmentCycleSummaryRepository: UserAssessmentCycleSummariesRepository,
    private readonly userSimulationsRepository: UserSimulationsRepository,
    private readonly domainsRepository: DomainsRepository,
    private readonly trainingsRepository: TrainingsRepository,
    private readonly userTrainingsRepository: UserTrainingsRepository,
    private readonly clientUnitsService: ClientUnitsService,
    private readonly countriesService: CountriesService,
    private readonly assessmentCyclesService: AssessmentCyclesService,
    private readonly assessmentTypesService: AssessmentTypesService,
    private readonly simulationsService: SimulationsService,
    private readonly simDocsService: SimDocsService,
    private readonly foldersService: FoldersService,
    private readonly simulationMappersService: SimulationMappersService,
    private readonly rolesService: RolesService,
    private readonly keyConceptService: KeyConceptsService,
    private readonly settingsService: SettingsService,
    private readonly findingGroupService: FindingGroupsService,
    private readonly connectFindingGroupService: ConnectFindingGroupsService,
    private readonly notesService: NotesService,
    private readonly answersService: AnswersService,

    private readonly migration1Repository: MigrationRepository,
    private readonly migration2Repository: Migration2Repository,
  ) {}

  async test(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo client migration');
    const data = (await migrationRepository.getAllClients()) || [];
    console.info('finish: collect client from demo');
    return data;
  }

  async deleteAll() {
    console.info('start');
    await this.deleteMigrateAssessments();
    await this.deleteMigrateAssessmentCycles();
    await this.deleteMigrateAssessmentTypes();
    await this.deleteMigrateClientUnits();
    await this.deleteMigrateFindings();
    await this.deleteMigrateSimulationMappers();
    await this.deleteMigrateSimulations();
    await this.deleteMigrateTrainings();
    await this.deleteMigrateUserAssessmentCycleSummaries();
    await this.deleteMigrateUserAssessmentCycles();
    await this.deleteMigrateUserSimulations();
    await this.deleteMigrateUserTrainings();
    await this.deleteMigrateUsers();
    await this.deleteMigrateKeyConcepts();
    await this.deleteMigrateFindingGroup();
    await this.deleteMigrateSimDocs();
    await this.deleteMigrateFolders();
    await this.deleteMigrateNotes();
    await this.deleteMigrateAnswers();
    console.info('end');
  }

  async deleteMigrateAssessments() {
    return this.assessmentsService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateUsers() {
    return this.usersRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateFindings() {
    return this.findingsService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateSimulations() {
    return this.simulationsService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateClientUnits() {
    return this.clientUnitsService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateSimulationMappers() {
    return this.simulationMappersService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateUserSimulations() {
    return this.userSimulationsRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateTrainings() {
    return this.trainingsRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateAssessmentCycles() {
    return this.assessmentCyclesService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateAssessmentTypes() {
    return this.assessmentTypesService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateUserTrainings() {
    return this.userTrainingsRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateUserAssessmentCycles() {
    return this.userAssessmentCycleRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateUserAssessmentCycleSummaries() {
    return this.userAssessmentCycleSummaryRepository.deleteMany({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateKeyConcepts() {
    return this.keyConceptService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateFindingGroup() {
    await this.findingGroupService.delete({
      filter: {
        isDemo: true,
      },
    });
    return await this.connectFindingGroupService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateSimDocs() {
    return await this.simDocsService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateFolders() {
    return await this.foldersService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateNotes() {
    return await this.notesService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async deleteMigrateAnswers() {
    return await this.answersService.delete({
      filter: {
        isDemo: true,
      },
    });
  }

  async getMigratedCollection() {
    try {
      const _assessment = async () =>
        (await this.assessmentsService.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _simulation = async () =>
        (await this.simulationsService.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _finding = async () =>
        (await this.findingsService.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _simulationMapper = async () =>
        (await this.simulationMappersService.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _userSimulation = async () =>
        (await this.userSimulationsRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _training = async () =>
        (await this.trainingsRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _assessmentType = async () =>
        (await this.assessmentTypesService.find({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _assessmentCycle = async () =>
        (await this.assessmentCyclesService.find({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _clientUnit = async () =>
        (
          await this.clientUnitsService.readAllClient({
            filter: { isDemo: true },
          })
        ).length > 0
          ? true
          : false;
      const _user = async () =>
        (await this.usersRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _userTraining = async () =>
        (await this.userTrainingsRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _userAssessmentCycle = async () =>
        (await this.userAssessmentCycleRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _userAssessmentCycleSummary = async () =>
        (await this.userAssessmentCycleSummaryRepository.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _keyConcept = async () =>
        (await this.keyConceptService.findOne({
          filter: { isDemo: true },
        }))
          ? true
          : false;
      const _findingGroup = async () =>
        (await this.findingGroupService.findOne({ filter: { isDemo: true } }))
          ? true
          : false;
      const _simDoc = async () =>
        (await this.simDocsService.findOne({ filter: { isDemo: true } }))
          ? true
          : false;
      const _folder = async () =>
        (await this.foldersService.findOne({ filter: { isDemo: true } }))
          ? true
          : false;
      const _note = async () =>
        (await this.notesService.findOne({ filter: { isDemo: true } }))
          ? true
          : false;
      const _answer = async () =>
        (await this.answersService.findOne({ filter: { isDemo: true } }))
          ? true
          : false;

      const [
        assessment,
        simulation,
        finding,
        simulationMapper,
        userSimulation,
        training,
        assessmentType,
        assessmentCycle,
        clientUnit,
        user,
        userTraining,
        userAssessmentCycle,
        userAssessmentCycleSummary,
        keyConcept,
        findingGroup,
        simDoc,
        folder,
        note,
        answer,
      ] = await Promise.all([
        _assessment(),
        _simulation(),
        _finding(),
        _simulationMapper(),
        _userSimulation(),
        _training(),
        _assessmentType(),
        _assessmentCycle(),
        _clientUnit(),
        _user(),
        _userTraining(),
        _userAssessmentCycle(),
        _userAssessmentCycleSummary(),
        _keyConcept(),
        _findingGroup(),
        _simDoc(),
        _folder(),
        _note(),
        _answer(),
      ]);

      return {
        assessment,
        simulation,
        finding,
        simulationMapper,
        userSimulation,
        training,
        assessmentType,
        assessmentCycle,
        clientUnit,
        user,
        userTraining,
        userAssessmentCycle,
        userAssessmentCycleSummary,
        keyConcept,
        findingGroup,
        simDoc,
        folder,
        note,
        answer,
      };
    } catch (e) {
      console.log({ e });
      throw e;
    }
  }

  async getAllUsers(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    return migrationRepository.getAllUsers();
  }

  async getUserSimulationTest() {
    const options = {
      skip: 0,
      limit: 100,
    };
    console.info(`start: skip: 0, limit: 1000`);
    const data = await this.userSimulationsRepository.find({
      filter: { isDeleted: false },
      options,
    });
    console.info(`finish`);
    return data;
  }

  async getMatchingCounts(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo user migration');
    const demoUsers = await migrationRepository.getAllUsers();
    console.info('finish: collect users from demo');

    console.info('start: demo user migration');
    const demoUserStatus = await migrationRepository.getAllUserStatus();
    console.info('finish: collect users from demo');

    console.info('start: demo user migration');
    const demoUserDemographics =
      await migrationRepository.getAllUsersDemographic();
    console.info('finish: collect users from demo');

    const demoUserIds = demoUsers.map((_du) => _du._id);
    const dupCnt1 = demoUserStatus.filter((_dus) =>
      demoUserIds.includes(_dus.userId),
    ).length;
    const dupCnt2 = demoUserDemographics.filter((_dus) =>
      demoUserIds.includes(_dus.uid),
    ).length;
    console.info(`demoUserStatus count : ${dupCnt1}`);
    console.info(`demoUserDemographic count : ${dupCnt2}`);
    return demoUserDemographics;
  }

  async migrateFolders(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo document folder migration');
    const demoDocumentFolders =
      (await migrationRepository.getAllDocumentFolders()) || [];
    console.info('finish: collect document folder from demo');
    const simulations = await this.simulationsService.find({
      filter: {
        isDemo: true,
      },
    });
    const recreatedFolders: {
      recreatedFolder: CreateFolderDto;
      simulationId?: string;
    }[] = [];
    demoDocumentFolders.forEach((_folder) => {
      const simulationId = simulations
        .find(
          (_simulation) =>
            _simulation.demoId + '' === _folder.simulation_id + '',
        )
        ?._id?.toString();
      const recreatedFolder: CreateFolderDto = {
        name: _folder?.name || '',
        label: _folder?.label || '',
        color: '#000000',
        depth: 0,
        expanded: false,
        isActivated: _folder?.status === 1 ? true : false,
        isDeleted: _folder?.status === 4 ? true : false,
        createdAt: _folder?.created,
        updatedAt: _folder?.modified,
        isDemo: true,
        demoId: _folder?.id || '',
      };
      recreatedFolders.push({
        recreatedFolder,
        simulationId,
      });
    });
    console.info('start: simulation create one by one');
    await Promise.all(
      recreatedFolders.map(
        async ({ recreatedFolder: _recreatedFolder, simulationId }) => {
          const { _id: folderId } = await this.foldersService.create(
            _recreatedFolder,
          );
          if (!_recreatedFolder.isDeleted) {
            await this.simulationsService.update({
              filter: {
                _id: simulationId,
              },
              update: {
                $push: { folderIds: folderId.toString() },
              },
            });
          }
        },
      ),
    );
    console.info(`finish: ${recreatedFolders.length} folders migration`);
  }

  async migrateSimDocs(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: demo document migration');
      const demoDocuments = (await migrationRepository.getAllDocuments()) || [];
      console.info('finish: collect document from demo');
      const folders = await this.foldersService.find({
        filter: { isDemo: true },
      });
      let simDocsCount = await this.simDocsService.finCount({ filter: {} });
      const recreatedSimDocs: CreateSimDocDto[] = [];
      demoDocuments.forEach((_document) => {
        const recreatedSimDoc: CreateSimDocDto = {
          visibleId: simDocsCount++,
          folderId:
            folders
              .find(
                (_folder) => _folder.demoId + '' === _document.folder_id + '',
              )
              ?._id?.toString() || '',
          kind:
            _document?.medication_type === null ||
            _document?.medication_type === 0
              ? DocumentType.Document
              : _document?.medication_type === 1
              ? DocumentType.StudyMedication
              : DocumentType.RescueMedication,
          title: _document?.name || '',
          label: _document?.label || '',
          files: [],
          numberOfPillsToShow: _document?.pills || 0,
          numberOfPillsTakenBySubject: _document?.pills_taken || 0,
          numberOfPillsPrescribed: _document?.pills_prescribed || 0,
          children: [],
          expanded: false,
          isActivated: _document.status === 1 ? true : false,
          isDeleted: _document.status === 4 ? true : false,
          createdAt: _document.created,
          updatedAt: _document.modified,
          seq: _document.document_order,
          isDemo: true,
          demoId: _document.id,
        };
        recreatedSimDocs.push(recreatedSimDoc);
      });
      console.info(`start: simDocs bulk create ${recreatedSimDocs.length}`);
      await this.simDocsService.bulkDemoCreate(recreatedSimDocs);
      console.info(`finish: ${recreatedSimDocs.length} simDocs migration`);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async migrateAssessments(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: demo assessments migration');
      const demoAssessments =
        (await migrationRepository.getAllAssessments()) || [];
      console.info('finish: collect assessments from demo');
      console.info('start: demo sim users summary migration');
      const demoSimUsersSummary =
        await migrationRepository.getAllSimUsersSummary();
      console.info('finish: collect sim users summary from demo');
      console.info('start: demo sim users summary pfizer migration');
      const demoSimUsersSummaryPfizer =
        await migrationRepository.getAllSimUsersSummaryPfizer();
      console.info('finish: collect sim users summary pfizer from demo');
      console.info('start: demo sim users summary abbvie migration');
      const demoSimUsersSummaryAbbvie =
        await migrationRepository.getAllSimUsersSummaryAbbvie();
      console.info('finish: collect sim users summary abbvie from demo');
      console.info('start: demo sim users summary pharm_olam migration');
      const demoSimUsersSummaryPharmOlam =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary pharm_olam from demo');
      console.info('start: demo sim users summary allucent migration');
      const demoSimUsersSummaryAllucent =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary allucent from demo');
      console.info('start: demo sim users summary syneos migration');
      const demoSimUsersSummarySyneos =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary syneos from demo');
      const simUserSummary = [
        ...demoSimUsersSummary,
        ...demoSimUsersSummaryPfizer,
        ...demoSimUsersSummaryAbbvie,
        ...demoSimUsersSummaryPharmOlam,
        ...demoSimUsersSummaryAllucent,
        ...demoSimUsersSummarySyneos,
      ];
      console.info('start: demo users migration');
      const users = await this.usersRepository.find({
        filter: { isDemo: true },
      });
      console.info('finish: collect users from demo');

      const userSimulations =
        await this.userSimulationsRepository.findWithoutAggregation({
          filter: {
            isDemo: true,
          },
          projection: {
            _id: 1,
            demoId: 1,
          },
        });

      const getStatus = (status: string) => {
        if (status === 'Reviewed') {
          return AssessmentStatus.Complete;
        }
        if (status === 'Exported') {
          return AssessmentStatus.Complete;
        }
        if (status === 'Distributed') {
          return AssessmentStatus.Complete;
        }
        if (status === 'Published') {
          return AssessmentStatus.Complete;
        }
        if (status === 'Scoring') {
          return AssessmentStatus.InProgress;
        }
        if (status === 'InProgress') {
          return AssessmentStatus.InProgress;
        }
        return AssessmentStatus.Pending;
      };

      const recreatedAssessments: CreateAssessmentDto[] = [];
      demoAssessments.forEach((_demoAssessment) => {
        const _simUserSummary = simUserSummary.find(
          (_simUserSummary) =>
            _simUserSummary.userId === _demoAssessment.assessee_id &&
            _simUserSummary.simulationId + '' === _demoAssessment.simulation_id,
        );
        const recreatedAssessment: CreateAssessmentDto = {
          userSimulationId:
            userSimulations
              .find(
                (_userSimulation) =>
                  _userSimulation.demoId === _demoAssessment._id,
              )
              ?._id?.toString() || '000000000000000000000000',
          status: getStatus(_simUserSummary?.resultStage),
          firstScorer: {
            _id:
              users
                .find(
                  (_user) => _user.demoId === _simUserSummary?.scorer1Id || '',
                )
                ?._id?.toString() || '000000000000000000000000',
            status:
              _simUserSummary?.scorer1Status === 'Scored'
                ? AssessmentStatus.Complete
                : AssessmentStatus.Pending,
            scoringTime: getSecondsFromFormattedTime(
              _demoAssessment?.timer || '',
            ),
          },
          secondScorer: {
            _id:
              users
                .find(
                  (_user) => _user.demoId === _simUserSummary?.scorer2Id || '',
                )
                ?._id?.toString() || '000000000000000000000000',
            status:
              _simUserSummary?.scorer2Status === 'Scored'
                ? AssessmentStatus.Complete
                : AssessmentStatus.Pending,
            scoringTime: 0,
          },
          adjudicator: {
            _id:
              users
                .find(
                  (_user) =>
                    _user.demoId === _simUserSummary?.adjudicatorId || '',
                )
                ?._id?.toString() || '000000000000000000000000',
            status:
              _simUserSummary?.adjudicatorStatus === 'Adjudicated'
                ? AssessmentStatus.Complete
                : AssessmentStatus.Pending,
          },
          isExpedited: false,
          isDeleted: _demoAssessment?.status === 4 ? true : false,
          createdAt: _demoAssessment.createdAt,
          updatedAt: _demoAssessment.modifiedAt,
          publishedAt: _simUserSummary?.publishedAt,
          distributedAt: _simUserSummary?.distributedAt,
          isDemo: true,
          demoId: _demoAssessment._id,
        };
        recreatedAssessments.push(recreatedAssessment);
      });
      console.info('start: assessment create one by one');
      await this.assessmentsService.bulkDemoCreate(recreatedAssessments);
      console.info(
        `finish: ${recreatedAssessments.length} simulations migration`,
      );
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateAnswers(version = '1') {
    try {
      console.info('start fetch basic resources');
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      const simulations = (
        await this.simulationsService.find({
          filter: {
            isDemo: true,
          },
          projection: {
            _id: 1,
            visibleId: 1,
            demoId: 1,
          },
        })
      ).sort((a, b) => (a.demoId - b.demoId > 0 ? 1 : -1));
      console.info('findings');
      const findings = await this.findingsService.find({
        filter: { isDemo: true },
        projection: { _id: 1, visibleId: 1, demoId: 1 },
      });
      console.info('simulationMappers');
      const simulationMappers = await this.simulationMappersService.find({
        filter: { isDemo: true },
        projection: { _id: 1, simulationId: 1, findingId: 1 },
      });
      console.info('notes');
      const notes = await this.notesService.find({
        filter: {
          isDemo: true,
        },
        projection: { _id: 1, MNID: 1, 'viewport.simulationId': 1 },
      });
      console.info('assessments');
      const assessments = await this.assessmentsService.findWithoutAggregation({
        filter: {
          isDemo: true,
        },
        projection: {
          status: 0,
          isExpedited: 0,
          isDeleted: 0,
          createdAt: 0,
          updatedAt: 0,
          publishedAt: 0,
          distributedAt: 0,
        },
      });
      console.info('userSimulations');
      const userSimulations =
        await this.userSimulationsRepository.findWithoutAggregation({
          filter: {
            isDemo: true,
          },
          projection: {
            _id: 1,
            demoId: 1,
            simulationId: 1,
          },
        });
      console.info('finish fetch basic resources');
      // demoSimulationId is number not mongoose ID
      const bySimulation = async (simulation: Simulation) => {
        const localNotes = notes.filter(
          (_note) => _note.viewport.simulationId === simulation._id.toString(),
        );
        const demoSimulationId = simulation.demoId + '';
        const _userSimulations = userSimulations.filter(
          (_us) => _us.simulationId.toString() === simulation._id.toString(),
        );
        const _findings = simulationMappers
          .filter((_sm) => _sm.simulationId === simulation.visibleId)
          .map((_sm) =>
            findings.find((_finding) => _finding.visibleId === _sm.findingId),
          )
          .filter((_) => _);
        const scoringBehaviors =
          await migrationRepository.getScoringBehaviorsBySimulation(
            demoSimulationId,
          );
        const recreatedAnswers = [];
        console.info(`start with simulationNumber:${demoSimulationId}`);
        _userSimulations.forEach((_us) => {
          const _scoringBehavior = scoringBehaviors.find(
            (_sb) => _sb.assessment_id === _us.demoId,
          );
          const assessment = assessments.find((_assessment) => {
            return (
              _assessment.userSimulationId.toString() === _us._id.toString()
            );
          });
          if (!assessment) return;
          _findings.forEach((_f) => {
            const findingId = _f._id.toString();
            const userSimulationId = _us._id.toString();
            const recreatedAnswer: Answer = {
              userSimulationId,
              findingId,
              scoring: {
                firstScorer: {
                  scorerId: assessment.firstScorer._id,
                  noteId: _scoringBehavior?.assessor1
                    ? localNotes
                        .find(
                          (_note) =>
                            _note.MNID === _scoringBehavior.assessor1?.mnid,
                        )
                        ?._id?.toString() || ''
                    : null,
                  answerStatus: _scoringBehavior?.assessor1
                    ? _scoringBehavior.assessor1.identified
                      ? AnswerStatus.Correct
                      : AnswerStatus.InCorrect
                    : AnswerStatus.NotScored,
                  updatedAt: new Date(),
                },
                secondScorer: {
                  scorerId: assessment.secondScorer._id,
                  noteId: _scoringBehavior?.assessor2
                    ? localNotes
                        .find(
                          (_note) =>
                            _note.MNID === _scoringBehavior.assessor2?.mnid,
                        )
                        ?._id?.toString() || ''
                    : null,
                  answerStatus: _scoringBehavior?.adjudicator
                    ? _scoringBehavior.adjudicator.identified
                      ? AnswerStatus.Correct
                      : AnswerStatus.InCorrect
                    : AnswerStatus.NotScored,
                  updatedAt: new Date(),
                },
                adjudicator: {
                  scorerId: assessment.adjudicator._id,
                  noteId: _scoringBehavior?.adjudicator
                    ? localNotes
                        .find(
                          (_note) =>
                            _note.MNID === _scoringBehavior.adjudicator?.mnid,
                        )
                        ?._id?.toString() || ''
                    : null,
                  answerStatus: _scoringBehavior?.assessor2
                    ? _scoringBehavior.assessor2.identified
                      ? AnswerStatus.Correct
                      : AnswerStatus.InCorrect
                    : AnswerStatus.NotScored,
                  updatedAt: new Date(),
                },
              },
              isDeleted: false,
              createdAt: assessment.createdAt,
              updatedAt: assessment.updatedAt,
              isDemo: true,
              demoId: _scoringBehavior?._id ? _scoringBehavior._id : '',
            };
            recreatedAnswers.push(recreatedAnswer);
          });
        });
        console.info(`start bulk create ${recreatedAnswers.length} answers`);
        await this.answersService.bulkCreate(recreatedAnswers);
        console.info(`finish create simulationNumber ${demoSimulationId}`);
      };
      for (const simulation of simulations) {
        await bySimulation(simulation);
      }
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateMonitoringNotes(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: migrate monitoring notes');
      const simulations = (
        await this.simulationsService.find({
          filter: {
            isDemo: true,
          },
        })
      ).sort((a, b) => (a.demoId > b.demoId ? 1 : -1));
      const users = await this.usersRepository.findWithoutAggregation({
        filter: {
          isDemo: true,
        },
        projection: {
          _id: 1,
          demoId: 1,
        },
      });
      const simDocs = await this.simDocsService.find({
        filter: {
          isDemo: true,
        },
      });

      const migrationBySimulation = async (simulation: Simulation) => {
        const demoSimulationId = simulation.demoId + '';
        console.info(
          `start call monitoring notes simulation:${demoSimulationId}`,
        );
        const demoMonitoringNotes =
          await migrationRepository.getMonitoringNotesBySimulation(
            demoSimulationId,
          );
        const userSimulations = simulation
          ? await this.userSimulationsRepository.findWithoutAggregation({
              filter: {
                isDemo: true,
                simulationId: simulation?._id?.toString() || '',
              },
              projection: {
                simulationId: 1,
                userId: 1,
              },
            })
          : [];
        console.info(`found notes: ${demoMonitoringNotes?.length}`);
        const recreatedNotes = [];
        demoMonitoringNotes.forEach((_demoMonitoringNote) => {
          const user = users.find(
            (_user) => _user.demoId === _demoMonitoringNote.creator,
          );
          const viewport: Viewport = {
            _id: undefined,
            index: _demoMonitoringNote.viewport,
            userId: user?._id?.toString() || '',
            active: false,
            isMounted: false,
            simulationId: simulation?._id?.toString() || '',
            simulationType: SimulationType.None,
            userSimulationId: userSimulations
              .find(
                (_userSimulation) =>
                  _userSimulation.simulationId ===
                    simulation?._id?.toString() &&
                  _userSimulation.userId === (user?._id?.toString() || ''),
              )
              ?._id?.toString(),
            simDoc: simDocs.find(
              (_simDoc) =>
                _simDoc.demoId + '' ===
                _demoMonitoringNote.document.document_id + '',
            ),
            viewedSimDocIds: [],
            isDeleted: _demoMonitoringNote.status === 4,
            createdAt: _demoMonitoringNote.createdAt,
            updatedAt: _demoMonitoringNote.modifiedAt,
          };
          const recreatedNote = {
            viewport,
            MNID: _demoMonitoringNote.key,
            seq: _demoMonitoringNote.order,
            text: _demoMonitoringNote.content,
            type: 'monitoring',
            userId: user?._id?.toString() || '',
            page: _demoMonitoringNote.page,
            isViewed: false,
            isDeleted: _demoMonitoringNote === 4,
            createdAt: _demoMonitoringNote.createdAt,
            updatedAt: _demoMonitoringNote.modifiedAt,
            isDemo: true,
            demoId: _demoMonitoringNote._id,
          };
          if (
            !recreatedNote.userId ||
            !recreatedNote.viewport.userSimulationId ||
            !recreatedNote.MNID
          )
            return;
          recreatedNotes.push(recreatedNote);
        });
        await this.notesService.bulkCreate(recreatedNotes);
        console.info(`${recreatedNotes.length} notes created`);
      };
      for (const _simulation of simulations) {
        await migrationBySimulation(_simulation);
      }
      console.info('finish: migrate monitoring note');
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateComplianceNotes(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: migrate compliance notes');
      const simulations = (
        await this.simulationsService.find({
          filter: {
            isDemo: true,
          },
        })
      ).sort((a, b) => (a.demoId > b.demoId ? 1 : -1));
      const users = await this.usersRepository.find({
        filter: {
          isDemo: true,
        },
      });
      const simDocs = await this.simDocsService.find({
        filter: {
          isDemo: true,
        },
      });

      const migrationBySimulation = async (
        demoSimulationId: string,
        simulation: Simulation,
      ) => {
        console.info(
          `start call compliance notes simulation:${demoSimulationId}`,
        );
        const demoComplianceNotes =
          await migrationRepository.getComplianceNotesBySimulation(
            demoSimulationId,
          );

        const userSimulations = simulation
          ? await this.userSimulationsRepository.findWithoutAggregation({
              filter: {
                isDemo: true,
                simulationId: simulation?._id?.toString() || '',
              },
              projection: {
                simulationId: 1,
                userId: 1,
              },
            })
          : [];
        const recreatedNotes = demoComplianceNotes
          .map((_demoComplianceNote) => {
            const user = users.find(
              (_user) => _user.demoId === _demoComplianceNote.creator,
            );
            const viewport: Viewport = {
              _id: undefined,
              index: _demoComplianceNote.viewport || -1,
              userId: user?._id?.toString() || '',
              active: _demoComplianceNote.status === 1,
              isMounted: false,
              simulationId: simulation?._id?.toString() || '',
              simulationType: SimulationType.None,
              userSimulationId: userSimulations
                .find(
                  (_userSimulation) =>
                    _userSimulation.simulationId ===
                      simulation?._id?.toString() &&
                    _userSimulation.userId === (user?._id?.toString() || ''),
                )
                ?._id?.toString(),
              simDoc: simDocs.find(
                (_simDoc) =>
                  _simDoc.demoId + '' ===
                  _demoComplianceNote.document.document_id + '',
              ),
              viewedSimDocIds: [],
              isDeleted: _demoComplianceNote.status === 4,
              createdAt: _demoComplianceNote.createdAt,
              updatedAt: _demoComplianceNote.modifiedAt,
            };
            const complianceNote: ComplianceNote = {
              taken: Number(_demoComplianceNote.pills_taken),
              shouldTaken: Number(_demoComplianceNote.pills_prescribed),
              percent: Number(_demoComplianceNote.pills_percent),
            };
            const recreatedNote = {
              viewport,
              MNID: -1,
              seq: -1,
              text: 'compliance note',
              type: 'compliance',
              userId: user?._id?.toString() || '',
              complianceNote,
              isViewed: false,
              isDeleted: _demoComplianceNote === 4,
              createdAt: _demoComplianceNote.createdAt,
              updatedAt: _demoComplianceNote.modifiedAt,
              isDemo: true,
              demoId: _demoComplianceNote._id,
            };
            return recreatedNote;
          })
          .filter((_note) => _note.userId && _note.viewport.userSimulationId);
        await this.notesService.bulkCreate(recreatedNotes);
        console.info(`${recreatedNotes.length} notes created`);
      };
      for (const _simulation of simulations) {
        const demoSimulationId = _simulation.demoId + '';
        await migrationBySimulation(demoSimulationId, _simulation);
      }
      console.info('finish: migrate compliance note');
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateSimulations(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo client migration');
    const demoClients = (await migrationRepository.getAllClients()) || [];
    console.info('finish: collect client from demo');
    const recreatedSimulations: CreateSimulationDto[] = [];
    demoClients.forEach((_client) => {
      _client?.bus?.forEach((_bus) => {
        _bus?.simulations?.forEach((_simulation) => {
          const recreatedSimulation: CreateSimulationDto = {
            name: _simulation.name,
            label: _simulation.name,
            documents: [],
            demoId: _simulation.id,
            isDemo: true,
          };
          if (
            recreatedSimulations.find(
              (_recreatedSimulation) =>
                _recreatedSimulation.demoId === recreatedSimulation.demoId,
            )
          ) {
            return;
          }
          recreatedSimulations.push(recreatedSimulation);
        });
      });
    });
    console.info('start: simulation create one by one');
    await Promise.all(
      recreatedSimulations.map(async (_recreatedSimulation) => {
        await this.simulationsService.create(_recreatedSimulation);
      }),
    );
    console.info(
      `finish: ${recreatedSimulations.length} simulations migration`,
    );
  }

  async migrateAssessmentCycles(version = '1') {
    /**
     * including clientUnits, assessmentCycles, assessmentTypes, simulations
     * import demo data from clients collection
     * client = clientUnit
     * client.bus = assessmentCycle, assessmentType, clientUnit.businessUnit, clientUnit.businessUnit.businessCycle
     */
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo client migration');
    const demoClients = (await migrationRepository.getAllClients()) || [];
    console.info('finish: collect client from demo');
    const domains = await this.domainsRepository.find({ filter: {} });
    const simulations = await this.simulationsService.find({ filter: {} });
    const trainings = (
      (await this.trainingsRepository.find({
        filter: { order: { $in: [1, 2, 3, 4, 5] } },
      })) || []
    ).map((_training) => {
      const training: AssessmentTypeTraining = {
        _id: _training?._id?.toString(),
        label: _training.title,
        protocolIds: [],
        studyLogIds: [],
        domain: {
          _id:
            domains
              .find(
                (_domain) =>
                  _domain.visibleId ===
                  this.getDomainVisibleId(_training.title),
              )
              ?._id?.toString() || '',
        },
      };
      return training;
    });
    console.info('create assessmentCycles, assessmentTypes');
    const recreatedAssessmentTypes: AssessmentTypeDto[] = [];
    const recreatedAssessmentCycles: AssessmentCycle[] = [];
    demoClients.forEach((_client) => {
      _client?.bus?.forEach((_bus) => {
        const label = (_client.name || '') + ' ' + (_bus.name || '');
        const baselineSimulation = simulations.find(
          (_simulation) => _simulation.demoId === _bus.simulations?.[0]?.id,
        );
        const baseline: AssessmentTypeSimulation = {
          simulationId: baselineSimulation?._id?.toString() || '',
          simulationType: SimulationType.Baseline,
          label: baselineSimulation?.label || '',
          attemptCount: 10,
          domain: {
            _id: '',
            label: '',
          },
          uuid: '',
          testTime: 36000,
          minimumHour: 0,
          deadline: 7,
          protocolIds: [],
          instructionIds: [],
          studyLogIds: [],
          riskManagementIds: [],
        };
        const followups = simulations
          .filter((_simulation) =>
            _bus.simulations?.find(
              (_busSimulation) =>
                _busSimulation.id === _simulation.demoId &&
                _busSimulation?.name?.includes('Followup'),
            ),
          )
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .map((_simulation) => {
            const demoSimulationIndex =
              (_bus.simulations as any[])?.findIndex(
                (_busSimulation) => _busSimulation.id === _simulation.demoId,
              ) || -1;
            const followup: AssessmentTypeSimulation = {
              simulationId: _simulation._id?.toString(),
              simulationType: SimulationType.Followup,
              label: _simulation.label,
              attemptCount: 10,
              domain: {
                _id:
                  domains
                    .find((_domain) => {
                      const _getDomainVisibleId = () => {
                        if (demoSimulationIndex === 1) {
                          return 1;
                        }
                        if (demoSimulationIndex === 2) {
                          return 2;
                        }
                        if (demoSimulationIndex === 3) {
                          return 6;
                        }
                        if (demoSimulationIndex === 4) {
                          return 8;
                        }
                        if (demoSimulationIndex === 5) {
                          return 11;
                        }
                      };
                      return _domain.visibleId === _getDomainVisibleId();
                    })
                    ?._id.toString() || '',
                label: '',
              },
              uuid: '',
              testTime: 36000,
              minimumHour: 0,
              deadline: 7,
              protocolIds: [],
              instructionIds: [],
              studyLogIds: [],
              riskManagementIds: [],
            };
            return followup;
          });
        const recreatedAssessmentTypeId = new mongoose.Types.ObjectId();
        const recreatedAssessmentType: AssessmentType = {
          _id: recreatedAssessmentTypeId,
          label,
          baseline,
          followups,
          trainings,
          isDeleted: false,
          createdAt: _bus.createdAt,
          updatedAt: _bus.modifiedAt,
          demoId: _bus._id,
          isDemo: true,
        };
        const recreatedAssessmentCycle: AssessmentCycle = {
          _id: undefined,
          name: label,
          type: baseline.label.toLowerCase().includes('prehire')
            ? AssessmentCycleType.Prehire
            : AssessmentCycleType.Normal,
          tutorials: {
            baselineUrl: '',
            trainingUrl: '',
            followupUrl: '',
          },
          assessmentTypeIds: [recreatedAssessmentTypeId.toString()],
          bypass: false,
          isDeleted: false,
          createdAt: _bus.createdAt,
          updatedAt: _bus.modifiedAt,
          demoId: _bus._id,
          isDemo: true,
        };
        recreatedAssessmentTypes.push(recreatedAssessmentType);
        recreatedAssessmentCycles.push(recreatedAssessmentCycle);
      });
    });
    console.info('start: bulk create assessment types');
    await this.assessmentTypesService.bulkCreate(recreatedAssessmentTypes);
    console.info('finish: migrate assessment types');
    console.info('start: bulk create assessment cycles');
    await this.assessmentCyclesService.bulkCreate(recreatedAssessmentCycles);
    console.info('finish: migrate assessment cycles');
  }

  async migrateClients(version = '1') {
    /**
     * including clientUnits, assessmentCycles, assessmentTypes, simulations
     * import demo data from clients collection
     * client = clientUnit
     * client.bus = assessmentCycle, assessmentType, clientUnit.businessUnit, clientUnit.businessUnit.businessCycle
     */
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo client migration');
    const demoClients = (await migrationRepository.getAllClients()) || [];
    console.info('finish: collect client from demo');

    const assessmentCycles = (await this.assessmentCyclesService.find({
      filter: {},
      options: { multi: true },
    })) as AssessmentCycle[];
    const domains = await this.domainsRepository.find({
      filter: { visibleId: { $in: [1, 2, 6, 8, 11] } },
    });
    const countries = (await this.countriesService.find({
      filter: {},
      options: { multi: true },
    })) as Country[];
    console.info('create pfizer client');
    const pfizerClientUnitId = new mongoose.Types.ObjectId();
    const pfizerClient: ClientUnit = {
      _id: pfizerClientUnitId,
      name: 'Pfizer',
      vendor: '',
      authCode: '',
      whitelist: [],
      titles: [],
      businessUnits: [],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      demoId: '',
      isDemo: true,
    };
    await this.clientUnitsService.createClient(pfizerClient);
    console.info('create clientUnits');
    const recreatedClientUnits = demoClients
      .filter((_client) => _client.name !== 'Pfizer')
      .map((_client) => {
        const businessUnits: BusinessUnit[] = _client.bus.map((_bus) => {
          const recreatedBusinessCycles: BusinessCycle = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            assessmentCycleId:
              assessmentCycles
                ?.find(
                  (_assessmentCycle) => _assessmentCycle.demoId === _bus._id,
                )
                ?._id?.toString() || '',
            settingsByDomainIds: domains.map((_domain) => ({
              domainId: _domain?._id?.toString() || '',
              minScore: 67,
            })),
            isScreenRecordingOn: false,
            gradeType: GradeType.Basic,
            startDate: _bus.createdAt,
            endDate: _bus.modifiedAt,
          };
          const recreatedBusinessUnit: BusinessUnit = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            name: _bus?.name || '',
            countryIds:
              _bus?.countries4bu?.map((_demoCountry) =>
                countries
                  .find((_country) => _country.code === _demoCountry.code)
                  ?._id?.toString(),
              ) || [],
            adminCountryIds:
              _bus?.countries?.map((_demoCountry) =>
                countries
                  .find((_country) => _country.code === _demoCountry.code)
                  ?._id?.toString(),
              ) || [],
            businessCycles: [recreatedBusinessCycles],
            demoId: _bus._id,
          };
          return recreatedBusinessUnit;
        });
        const recreatedClientUnit: ClientUnit = {
          _id: undefined,
          name: _client.name,
          vendor: _client?.name?.includes('Pfizer')
            ? pfizerClientUnitId.toHexString()
            : '',
          authCode: '',
          whitelist: [],
          titles: [],
          businessUnits,
          isDeleted: false,
          createdAt: _client.createdAt,
          updatedAt: _client.modifiedAt,
          demoId: _client._id,
          isDemo: true,
        };
        return recreatedClientUnit;
      });
    console.info('start: bulk create assessment types');
    await this.clientUnitsService.bulkCreate(recreatedClientUnits);
    console.info('finish: migrate assessment types');
  }

  async migrateUsers(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: demo user migration');
      const demoUsers = await migrationRepository.getAllUsers();
      console.info('finish: collect users from demo');
      console.info('start: demo user summary migration');
      const demoUsersSummary = await migrationRepository.getAllUsersSummary();
      console.info('finish: collect user summaries from demo');
      console.info('start: demo user summary pfizer migration');
      const demoUsersSummaryPfizer =
        await migrationRepository.getAllUsersSummaryPfizer();
      console.info('finish: collect user summaries from demo');
      console.info('start: demo user summary abbvie migration');
      const demoUsersSummaryAbbvie =
        await migrationRepository.getAllUsersSummaryAbbvie();
      console.info('finish: collect user summaries from demo');
      console.info('start: demo user summary pharm olam migration');
      const demoUsersSummaryPharmOlam =
        await migrationRepository.getAllUsersSummaryPharmOlam();
      console.info('finish: collect user summaries from demo');
      console.info('start: demo user summary allucent migration');
      const demoUsersSummaryAllucent =
        await migrationRepository.getAllUsersSummaryPharmOlam();
      console.info('finish: collect user summaries from demo');
      console.info('start: demo user summary syneos migration');
      const demoUsersSummarySyneos =
        await migrationRepository.getAllUsersSummaryPharmOlam();
      console.info('finish: collect user summaries from demo');
      // console.info('start: demo user summary migration');
      // const demoUserStatus = await migrationRepository.getAllUserStatus();
      // console.info('finish: collect user status from demo');
      console.info('start: demo user migration');
      const demoUserDemographics =
        await migrationRepository.getAllUsersDemographic();
      console.info('finish: collect users from demo');
      const roles = (await this.rolesService.find({
        filter: {},
        options: { multi: true },
      })) as Role[];
      const countries = (await this.countriesService.find({
        filter: {},
        options: { multi: true },
      })) as Country[];
      const clientUnits = await this.clientUnitsService.readAllClient({});
      console.info('start: recreate users from demo');
      const recreatedDemoUsers = demoUsers
        .filter((_demoUser) => _demoUser?.profile?.status !== 4)
        .map((_demoUser: any, index) => {
          const authority: Authority = {
            authorizedAll: false,
            whitelist: [1, 2, 3, 4, 5].includes(
              this.getRole(_demoUser?.profile?.role),
            )
              ? _demoUser?.profile?.clients?.map((_client) => {
                  const clientUnit = clientUnits.find(
                    (_clientUnit) => _client._id === _clientUnit.demoId,
                  );
                  const countryPermissions = {};
                  const simPermissions = {};
                  const resultsView = _client?.view_result
                    ? 'Always'
                    : 'After Distribution';
                  let resultsType = '';
                  clientUnit?.businessUnits?.forEach((_bu) => {
                    const demoBU = _client?.bus?.find(
                      (_demoBu) => _demoBu?._id === _bu?.demoId,
                    );
                    if (demoBU?.annotated_result) {
                      resultsType = 'Annotated';
                    } else {
                      resultsType = 'Full';
                    }
                    countryPermissions[_bu._id.toString()] =
                      demoBU?.countries?.map((_demoCountry) =>
                        countries
                          .find(
                            (_country) => _country.code === _demoCountry.code,
                          )
                          ?._id?.toString(),
                      ) || [];
                    simPermissions[_bu._id.toString()] = {
                      prehire: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('prehire'),
                      )?.subChecked
                        ? true
                        : false,
                      baseline: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('baseline'),
                      )?.subChecked
                        ? true
                        : false,
                      followup1: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('followup 1'),
                      )?.subChecked
                        ? true
                        : false,
                      followup2: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('followup 2'),
                      )?.subChecked
                        ? true
                        : false,
                      followup3: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('followup 3'),
                      )?.subChecked
                        ? true
                        : false,
                      followup4: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('followup 4'),
                      )?.subChecked
                        ? true
                        : false,
                      followup5: demoBU?.simulations?.find((_s) =>
                        _s?.name?.toLowerCase()?.includes('followup 5'),
                      )?.subChecked
                        ? true
                        : false,
                    };
                  });
                  return {
                    clientId: clientUnit?._id?.toString(),
                    businessUnits:
                      clientUnit?.businessUnits?.map((_bu) =>
                        _bu?._id?.toString(),
                      ) || [],
                    countryPermissions,
                    simPermissions,
                    resultsView,
                    resultsType,
                  };
                })
              : [],
            publishNotification: _demoUser?.profile?.clients?.[0]
              ?.send_publish_notification
              ? true
              : false,
            distributionNotification: _demoUser?.profile?.clients?.[0]
              ?.send_distribution_notification
              ? true
              : false,
            pfizerAdmin: _demoUser?.profile?.pfizer_vendor_admin,
          };
          const userSummary = [
            ...demoUsersSummary,
            ...demoUsersSummaryPfizer,
            ...demoUsersSummaryAbbvie,
            ...demoUsersSummaryPharmOlam,
            ...demoUsersSummaryAllucent,
            ...demoUsersSummarySyneos,
          ].find(
            (_demoUserSummary: any) =>
              _demoUserSummary?.userId === _demoUser?._id,
          ) as any;
          const userDemoGraphic = demoUserDemographics.find(
            (_demoUserDemographic: any) =>
              _demoUserDemographic?.uid === _demoUser?._id,
          ) as any;
          const profile: Profile = {
            countryId:
              countries.find(
                (_country) => _country.code === userDemoGraphic?.country?.code,
              )?._id || '',
            clientUnitId: clientUnits
              .find(
                (_clientUnit) =>
                  _clientUnit.demoId ===
                  userSummary?.buIds?.[0]?.split('-')?.[0],
              )
              ?._id?.toString(),
            businessUnitId: clientUnits
              .find(
                (_clientUnit) =>
                  _clientUnit.demoId ===
                  userSummary?.buIds?.[0]?.split('-')?.[0],
              )
              ?.businessUnits?.find(
                (_businessUnit) =>
                  _businessUnit.demoId === userSummary?.buIds?.[0],
              )?._id,
            lastName: _demoUser?.profile?.lastname || '',
            firstName: _demoUser?.profile?.firstname || '',
            status: UserProfileStatus.Approval,
            authCode: '',
            initial: userSummary?.initial || '',
            title:
              demoUserDemographics.find(
                (_demoUserDemographic) =>
                  _demoUserDemographic.uid === _demoUser._id,
              )?.title || '',
            experience:
              demoUserDemographics.find(
                (_demoUserDemographic) =>
                  _demoUserDemographic.uid === _demoUser._id,
              )?.experience || '',
            clinicalExperience:
              demoUserDemographics.find(
                (_demoUserDemographic) =>
                  _demoUserDemographic.uid === _demoUser._id,
              )?.clinical_experience || '',
            userType:
              demoUserDemographics.find(
                (_demoUserDemographic) =>
                  _demoUserDemographic.uid === _demoUser._id,
              )?.user_type || '',
          };
          const otp: OTP = {
            otp_ascii: '',
            otp_auth_url: '',
            otp_base32: '',
            otp_hex: '',
          };
          const recreatedDemoUser: User = {
            email: _demoUser?.emails?.[0]?.address
              ? _demoUser.emails[0].address.split('@')[0] + '@hoansoft.com'
              : '',
            emailVerificationLink: '',
            passwordResetToken: '',
            aliasEmails:
              userSummary?.emailAlias &&
              typeof userSummary?.emailAlias === 'string'
                ? [userSummary?.emailAlias]
                : [],
            name: _demoUser?.username || '',
            password: _demoUser?.services?.password?.bcrypt || '',
            roleId:
              roles?.find(
                (_role) =>
                  _role.priority === this.getRole(_demoUser?.profile?.role),
              )?._id || '',
            profile: profile,
            otpData: otp,
            status: new UserStatus(),
            isDeleted: _demoUser.profile?.status === 4 ? true : false,
            isActivated: _demoUser.profile?.status === 1 ? true : false,
            updatedAt: _demoUser?.modifiedAt,
            createdAt: _demoUser?.createdAt,
            emailVerification: _demoUser?.services?.email?.verifiedAt,
            authority,
            demoId: _demoUser?._id || '',
            isDemo: true,
          };
          return recreatedDemoUser;
        })
        .filter((_recreatedDemoUser) => {
          const { email, name, password, roleId } = _recreatedDemoUser;
          if (email && name && password && roleId) {
            return true;
          }
          return false;
        });
      console.info(
        `finish: users from demo users - ${recreatedDemoUsers.length} users`,
      );
      console.info('start: bulk create');
      await this.usersRepository.bulkCreate(recreatedDemoUsers);
      console.info('finish: demo user migration - done');
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateKeyConcepts(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo domain tips migration');
    const demoDomainTips = await migrationRepository.getAllDomainTips();
    console.info('finish: collect domain tips from demo');
    const domains = await this.domainsRepository.find({ filter: {} });
    const recreatedKeyConcepts = [];
    demoDomainTips.forEach((_demoDomainTip) => {
      const domain = domains.find(
        (_domain) => _domain.visibleId === _demoDomainTip.domainId,
      );
      const mainDomainId =
        domain.depth === 0 ? domain._id.toString() : domain.parentId || '';
      if (!mainDomainId) return;
      const recreatedKeyConcept: KeyConcept = {
        _id: undefined,
        domainId: mainDomainId,
        description: _demoDomainTip.content || '',
        isDeleted: false,
        createdAt: _demoDomainTip.cAt,
        updatedAt: _demoDomainTip.cAt,
        isDemo: true,
        demoId: _demoDomainTip._id,
      };
      recreatedKeyConcepts.push(recreatedKeyConcept);
    });
    console.info(
      `finish: keyConcepts from demo domain tips - ${recreatedKeyConcepts.length} keyConcepts`,
    );
    console.info('start: bulk create');
    await this.keyConceptService.bulkCreate(recreatedKeyConcepts);
    console.info('finish: demo keyConcepts migration - done');
  }

  async migrateFindings(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo findings migration');
    const demoFindings = await migrationRepository.getAllFindings();
    console.info('finish: collect findings from demo');
    const domains = await this.domainsRepository.find({ filter: {} });
    const simDocs = await this.simDocsService.find({ filter: {} });
    const keyConcepts = await this.keyConceptService.find({ filter: {} });
    const recreatedFindings = [];
    demoFindings.forEach((_demoFinding) => {
      if (
        !domains
          .find(
            (_domain) =>
              _domain.visibleId ===
              this.getDomainVisibleId(_demoFinding?.category || ''),
          )
          ?._id?.toString()
      )
        return;
      const recreatedFinding: Finding = {
        _id: undefined,
        visibleId: _demoFinding?.id || -1,
        text: _demoFinding?.finding || '',
        severity: this.getSeverity(_demoFinding?.severity || ''),
        seq: 0,
        cfr: _demoFinding?.cfr || '',
        ich_gcp: _demoFinding?.ich_gcp || '',
        simDocId:
          simDocs
            .find(
              (_simDoc) =>
                _simDoc.demoId + '' === _demoFinding?.document_id + '',
            )
            ?._id?.toString() || '',
        domainId:
          domains
            .find(
              (_domain) =>
                _domain.visibleId ===
                this.getDomainVisibleId(_demoFinding?.category || ''),
            )
            ?._id?.toString() || '',
        keyConceptId:
          keyConcepts
            .find((_keyConcept) =>
              _demoFinding?.tips?.includes(_keyConcept.demoId),
            )
            ?._id?.toString() || '',
        simDocIds: simDocs
          .find(
            (_simDoc) =>
              _simDoc.demoId + '' === _demoFinding?.compare_with + '',
          )
          ?._id?.toString()
          ? [
              simDocs
                .find(
                  (_simDoc) =>
                    _simDoc.demoId + '' === _demoFinding?.compare_with + '',
                )
                ._id.toString(),
            ]
          : [],
        status: _demoFinding?.status === 1 ? 'Active' : 'Inactive',
        isDeleted: false,
        createdAt: _demoFinding?.created,
        updatedAt: _demoFinding?.modified,
        demoId: _demoFinding?.id,
        isDemo: true,
        isActivated: _demoFinding?.status === 1 ? true : false,
      };
      recreatedFindings.push(recreatedFinding);
    });
    console.info(
      `finish: users from demo users - ${recreatedFindings.length} findings`,
    );
    console.info('start: bulk create');
    await this.findingsService.demoBulkCreate(recreatedFindings);
    console.info('finish: demo finding migration - done');
  }

  async migrateSimulationMappers(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start');
    console.info('start: demo findings migration');
    const demoFindings = await migrationRepository.getAllFindings();
    console.info('finish: collect findings from demo');
    const findings = await this.findingsService.find({
      filter: { isDemo: true },
    });
    const simulations = await this.simulationsService.find({ filter: {} });
    const _ = require('lodash');
    const findingsBySimulationVisibleId = _.groupBy(
      demoFindings,
      (_demoFinding) => Number(_demoFinding.simulation_id || -1),
    );
    const recreatedSimulationMappers: SimulationMapper[] = [];
    Object.keys(findingsBySimulationVisibleId).map(
      (_demoSimulationVisibleId) => {
        findingsBySimulationVisibleId[_demoSimulationVisibleId].forEach(
          (_demoFinding) => {
            const recreatedSimulationMapper: SimulationMapper = {
              simulationId:
                simulations.find(
                  (_simulation) =>
                    Number(_simulation.demoId || -1) ===
                    Number(_demoSimulationVisibleId),
                )?.visibleId || -1,
              findingId:
                findings.find(
                  (_finding) =>
                    Number(_finding.demoId || -1) === _demoFinding.id,
                )?.visibleId || -1,
              createdAt: undefined,
              updatedAt: undefined,
              isDemo: true,
            };
            recreatedSimulationMappers.push(recreatedSimulationMapper);
          },
        );
      },
    );
    console.info('end');
    console.info('start: bulk create');
    await this.simulationMappersService.bulkCreate(recreatedSimulationMappers);
    console.info('finish: end bulk create');
  }

  async migrateFindingGroups(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    try {
      console.info('start: demo finding group migration');

      console.info('start: collect demo simulation settings');
      const demoSimulationSettings =
        await migrationRepository.getAllSimulationSettings();
      console.info('finish: collect simulation settings');
      console.info('start: collect demo findings selected');
      const demoFindingsSelected =
        await migrationRepository.getAllFindingsSelected();
      console.info('finish: collect findings selected');

      const clientUnits = (await this.clientUnitsService.find({
        filter: { isDemo: true },
        options: { multi: true },
      })) as ClientUnit[];

      const assessmentCycles = (await this.assessmentCyclesService.find({
        filter: { isDemo: true },
        options: { multi: true },
      })) as AssessmentCycle[];

      const assessmentTypes = (await this.assessmentTypesService.find({
        filter: { isDemo: true },
        options: { multi: true },
      })) as AssessmentType[];

      const findings = await this.findingsService.find({
        filter: { isDemo: true },
      });
      const simulations = await this.simulationsService.find({
        filter: { isDemo: true },
      });
      const recreatedFindingGroups = [];

      demoFindingsSelected.forEach((_demoFindingsSelected) => {
        const simulationId = simulations
          .find(
            (_simulation) =>
              _simulation.demoId === _demoFindingsSelected.simulation_id,
          )
          ?._id?.toString();
        if (!simulationId) {
          return;
        }
        const findingIds = _demoFindingsSelected.findings.map(
          (_findingDemoId) =>
            findings
              .find((_finding) => _finding.demoId + '' === _findingDemoId + '')
              ?._id?.toString(),
        );
        const recreatedFindingGroup = {
          _id: new mongoose.Types.ObjectId(),
          simulationId,
          findingIds,
          isDemo: true,
          isActivated: _demoFindingsSelected.status === 1 ? true : false,
          isDeleted: _demoFindingsSelected.status === 4 ? true : false,
          demoId: _demoFindingsSelected?._id || '',
        };
        recreatedFindingGroups.push(recreatedFindingGroup);
      });

      const recreatedConnectFindingGroups = [];
      clientUnits.forEach((_clientUnit) => {
        _clientUnit.businessUnits.forEach((_businessUnit) => {
          _businessUnit.businessCycles.forEach((_businessCycle) => {
            const assessmentCycleId = _businessCycle.assessmentCycleId;
            const _assessmentCycle = assessmentCycles.find(
              (_assessmentCycle) =>
                _assessmentCycle._id.toString() === assessmentCycleId,
            );
            const _assessmentTypes = assessmentTypes.filter((_assessmentType) =>
              (_assessmentCycle?.assessmentTypeIds || []).includes(
                _assessmentType._id.toString(),
              ),
            );
            _assessmentTypes.forEach((_assessmentType) => {
              const simulationIds = [
                _assessmentType?.baseline?.simulationId,
                ..._assessmentType.followups.map(
                  (_followup) => _followup?.simulationId,
                ),
              ];
              const assessmentTypeId = _assessmentType._id.toString();
              simulationIds.forEach((_simulationId) => {
                const simulation = simulations.find(
                  (_simulation) => _simulation._id.toString() === _simulationId,
                );
                const _demoSimulationSetting = demoSimulationSettings.find(
                  (_demoSimulationSetting) => {
                    return (
                      _demoSimulationSetting?.selected_findings_group &&
                      _demoSimulationSetting.client_id === _clientUnit.demoId &&
                      _demoSimulationSetting.bu_id === _businessUnit.demoId &&
                      _demoSimulationSetting.simulation_id + '' ===
                        simulation.demoId + ''
                    );
                  },
                );
                if (!_demoSimulationSetting) return;
                const _findingGroup = recreatedFindingGroups.find(
                  (_recreatedFindingGroup) =>
                    _recreatedFindingGroup.demoId ===
                      _demoSimulationSetting.selected_findings_group &&
                    _recreatedFindingGroup.isActivated &&
                    !_recreatedFindingGroup.isDeleted,
                );
                if (!_findingGroup) return;
                const recreatedConnectFindingGroup = {
                  findingGroupId: _findingGroup._id.toString(),
                  clientUnitId: _clientUnit._id.toString(),
                  businessUnitId: _businessUnit._id.toString(),
                  businessCycleId: _businessCycle._id.toString(),
                  assessmentCycleId: assessmentCycleId,
                  assessmentTypeId: assessmentTypeId,
                  simulationId: _simulationId,
                  isDemo: true,
                };
                recreatedConnectFindingGroups.push(
                  recreatedConnectFindingGroup,
                );
              });
            });
          });
        });
      });

      console.info('start: bulk create 1/2');
      await this.findingGroupService.bulkCreate(recreatedFindingGroups);
      console.info(
        `finish: migrate finding groups - ${recreatedFindingGroups.length}`,
      );
      console.info('start: bulk create 2/2');
      await this.connectFindingGroupService.bulkCreate(
        recreatedConnectFindingGroups,
      );
      console.info(
        `finish: migrate connect finding groups - ${recreatedConnectFindingGroups.length}`,
      );
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateUserSimulations(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    try {
      console.info('start: demo sim users summary migration');
      const demoSimUsersSummary =
        await migrationRepository.getAllSimUsersSummary();
      console.info('finish: collect sim users summary from demo');
      console.info('start: demo sim users summary pfizer migration');
      const demoSimUsersSummaryPfizer =
        await migrationRepository.getAllSimUsersSummaryPfizer();
      console.info('finish: collect sim users summary pfizer from demo');
      console.info('start: demo sim users summary abbvie migration');
      const demoSimUsersSummaryAbbvie =
        await migrationRepository.getAllSimUsersSummaryAbbvie();
      console.info('finish: collect sim users summary abbvie from demo');
      console.info('start: demo sim users summary pharm_olam migration');
      const demoSimUsersSummaryPharmOlam =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary pharm_olam from demo');
      console.info('start: demo sim users summary allucent migration');
      const demoSimUsersSummaryAllucent =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary allucent from demo');
      console.info('start: demo sim users summary syneos migration');
      const demoSimUsersSummarySyneos =
        await migrationRepository.getAllSimUsersSummaryPharmOlam();
      console.info('finish: collect sim users summary syneos from demo');

      console.info('start: demo sim users score summary migration');
      const demoUsersScoreSummary =
        await migrationRepository.getAllUsersScoreSummary();
      console.info('finish: collect sim users score summary from demo');
      console.info('start: demo temp finding log summary migration');
      const demoTempFindingLog =
        await migrationRepository.getAllTempFindingLog();
      console.info('finish: collect sim users score summary from demo');
      // const clientUnits = await this.clientUnitsService.readAllClient({});
      const simulations = await this.simulationsService.find({ filter: {} });
      const users = await this.usersRepository.find({ filter: {} });
      const domains = await this.domainsRepository.find({ filter: {} });
      const findings = await this.findingsService.find({
        filter: { isDeleted: false, status: 'Active' },
      });
      const simulationMappers = await this.simulationMappersService.find({
        filter: {},
      });
      const connectFindingGroups = await this.connectFindingGroupService.find({
        filter: {
          isDemo: true,
        },
      });
      const findingGroups = await this.findingGroupService.find({
        filter: {
          isDemo: true,
        },
      });

      const getUserId = (userId: string) => {
        return users.find((_user) => _user.demoId === userId)?._id?.toString();
      };

      const getSimulationType = (simulationName: string) => {
        return (simulationName || ('' as string))
          ?.toLowerCase()
          ?.startsWith('baseline') ||
          (simulationName || ('' as string))
            ?.toLowerCase()
            ?.startsWith('prehire')
          ? SimulationType.Baseline
          : SimulationType.Followup;
      };

      const getSimulationId = (simulationId: number) => {
        return (
          simulations
            .find((_simulation) => _simulation.demoId === simulationId)
            ?._id?.toString() || ''
        );
      };

      const getDomainByDemoDomainName = (demoDomainName: string) => {
        if (!demoDomainName) return null;
        if (
          demoDomainName.toLowerCase() === 'Protocol Requirement'.toLowerCase() // check
        ) {
          return domains.find((_domain) => _domain.visibleId === 1);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Source Documentation, CRF, Source-to-CRF Review'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 2);
        }
        if (
          demoDomainName.toLowerCase() === 'Source Documentation'.toLowerCase() //check
        ) {
          return domains.find((_domain) => _domain.visibleId === 3);
        }
        if (
          demoDomainName.toLowerCase() === 'Source to EDC/EDC'.toLowerCase()
        ) {
          //check
          return domains.find((_domain) => _domain.visibleId === 4);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Source Documentation/Source to EDC/EDC'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 5);
        }
        if (
          demoDomainName.toLowerCase() ===
          'The Informed Consent Process'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 6);
        }
        if (demoDomainName.toLowerCase() === 'ICF Process'.toLowerCase()) {
          //check
          return domains.find((_domain) => _domain.visibleId === 7);
        }
        if (
          demoDomainName.toLowerCase() ===
          'IRB/IEC Submission Approval'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 8);
        }
        if (
          demoDomainName.toLowerCase() ===
          'IRB Submission/Approval'.toLowerCase() //check
        ) {
          return domains.find((_domain) => _domain.visibleId === 9);
        }
        if (
          demoDomainName.toLowerCase() ===
          'IEC Submission/Approval'.toLowerCase() //check
        ) {
          return domains.find((_domain) => _domain.visibleId === 10);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Potential Fraud, Scientific Misconduct and Delegation of Authority'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 11);
        }
        if (demoDomainName.toLowerCase() === 'Potential Fraud'.toLowerCase()) {
          //check
          return domains.find((_domain) => _domain.visibleId === 12);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Delegation of Authority'.toLowerCase() //check
        ) {
          return domains.find((_domain) => _domain.visibleId === 13);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Delegation of Authority and Training'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 14);
        }
        if (
          demoDomainName.toLowerCase() ===
          'Potential Fraud/Scientific Misconduct'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 15);
        }
        if (
          demoDomainName.toLowerCase() === 'IRB/IEC Reporting'.toLowerCase()
        ) {
          return domains.find((_domain) => _domain.visibleId === 16);
        }
        if (demoDomainName.toLowerCase() === 'EC Reporting'.toLowerCase()) {
          return domains.find((_domain) => _domain.visibleId === 17);
        }
        if (demoDomainName.toLowerCase() === 'IEC Reporting'.toLowerCase()) {
          //check
          return domains.find((_domain) => _domain.visibleId === 18);
        }
        if (demoDomainName.toLowerCase() === 'IRB Reporting'.toLowerCase()) {
          return domains.find((_domain) => _domain.visibleId === 19);
        }
        return null;
      };

      const getDomainId = (simulationName: string) => {
        if (!simulationName) return '';
        if (simulationName.includes('Followup 1')) {
          return (
            domains
              .find((_domain) => _domain.visibleId === 1)
              ?._id?.toString() || ''
          );
        }
        if (simulationName.includes('Followup 2')) {
          return (
            domains
              .find((_domain) => _domain.visibleId === 2)
              ?._id?.toString() || ''
          );
        }
        if (simulationName.includes('Followup 3')) {
          return (
            domains
              .find((_domain) => _domain.visibleId === 6)
              ?._id?.toString() || ''
          );
        }
        if (simulationName.includes('Followup 4')) {
          return (
            domains
              .find((_domain) => _domain.visibleId === 8)
              ?._id?.toString() || ''
          );
        }
        if (simulationName.includes('Followup 5')) {
          return (
            domains
              .find((_domain) => _domain.visibleId === 11)
              ?._id?.toString() || ''
          );
        }
        return '';
      };

      const getTime = (timeFormatString: string) => {
        if (!timeFormatString) return 0;
        const [hours, minutes, seconds] = timeFormatString.split(':');
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
      };

      const getStatus = (status: string, submittedAt?: any) => {
        if (status === 'Reviewed') {
          return UserSimulationStatus.Reviewed;
        }
        if (status === 'Exported') {
          return UserSimulationStatus.Exported;
        }
        if (status === 'Distributed') {
          return UserSimulationStatus.Distributed;
        }
        if (status === 'Published') {
          return UserSimulationStatus.Published;
        }
        if (status === 'Scoring') {
          return UserSimulationStatus.Scoring;
        }
        if (status === 'InProgress') {
          return UserSimulationStatus.InProgress;
        }
        if (!submittedAt) {
          return UserSimulationStatus.Pending;
        }
        return UserSimulationStatus.Assigned;
      };

      const getResults = (
        userScoreSummary: any,
        _totalFindings?: Finding[],
      ): Result => {
        const totalFindings =
          _totalFindings?.length > 0
            ? _totalFindings
            : simulationMappers
                .filter(
                  (_sm) =>
                    _sm.simulationId ===
                      simulations.find(
                        (_simulation) =>
                          _simulation.demoId === userScoreSummary.simulation_id,
                      )?.visibleId &&
                    findings.find(
                      (_finding) => _finding.visibleId === _sm.findingId,
                    ),
                )
                .map((_sm) =>
                  findings.find(
                    (_finding) => _finding.visibleId === _sm.findingId,
                  ),
                )
                .filter((_) => _);
        const scoreByDomain: any[] = [];
        const scoreByMainDomain = domains
          .filter((_domain) => _domain.depth === 0)
          .map((_domain) => ({
            domainId: _domain._id.toString(),
            name: _domain.name,
            correctAnswersCount: 0,
            incorrectAnswersCount: 0,
            allAnswersCount: 0,
            pass: false,
            minScore: 67,
            score: 0,
          }));
        const identifiedScoreBySeverity: any[] = [];
        const identifiedScoreByDomain: any[] = [];
        const identifiedScoreByMainDomain = domains
          .filter((_domain) => _domain.depth === 0)
          .map((_domain) => ({
            domainId: _domain._id.toString(),
            correctAnswersCount: 0,
            incorrectAnswersCount: 0,
            allAnswersCount: 0,
            identifiedFindings: [],
            notIdentifiedFindings: [],
            allFindings: [],
          }));
        const identifiedAnswers: any[] = [];
        const notIdentifiedAnswers: any[] = [];
        const notIdentifiedFindings =
          (
            userScoreSummary?.unidentified_findings?.findings
              ?.map((_finding) => _finding.id)
              ?.filter((_findingId) => {
                return findings.find(
                  (_finding) => Number(_finding.demoId) === _findingId,
                );
              }) || []
          )
            ?.filter((_findingId) => {
              return findings.find(
                (_finding) => Number(_finding.demoId) === _findingId,
              );
            })
            ?.map((_findingId) => {
              return findings.find(
                (_finding) => Number(_finding.demoId) === _findingId,
              ) as Finding;
            }) || [];
        const identifiedFindings: any[] = totalFindings.filter(
          (_finding) =>
            !notIdentifiedFindings.find((_nidf) => _nidf._id === _finding._id),
        );

        Object.keys(userScoreSummary?.domain || []).forEach((_domainName) => {
          const domainId =
            getDomainByDemoDomainName(_domainName)?._id?.toString() || '';
          const name =
            domains.find((_domain) => _domain._id.toString() === domainId)
              ?.name || '';
          const _scoreByDomain = userScoreSummary?.domain?.[_domainName];
          const correctAnswersCount = _scoreByDomain?.identified;
          const incorrectAnswersCount = _scoreByDomain?.not_identified;
          const allAnswersCount = _scoreByDomain?.total;
          const minScore = '67'; //FIXME - need to find min score
          const score = Number(_scoreByDomain?.percent_identified || 0);
          const pass = score > Number(minScore);
          scoreByDomain.push({
            domainId,
            name,
            correctAnswersCount,
            incorrectAnswersCount,
            allAnswersCount,
            pass,
            minScore,
            score,
          });
        });

        Object.keys(userScoreSummary?.severity || []).forEach((_severity) => {
          const getSeverityNum = () => {
            if (_severity === 'Critical') return 0;
            if (_severity === 'Major') return 1;
            if (_severity === 'Minor') return 2;
            return 1;
          };
          const _identifiedFindings = identifiedFindings.filter(
            (_identifiedFinding) => {
              return _identifiedFinding.severity === getSeverityNum();
            },
          );
          const _notIdentifiedFindings = notIdentifiedFindings.filter(
            (_notIdentifiedFinding) => {
              return _notIdentifiedFinding.severity === getSeverityNum();
            },
          );
          const _allFindings = [
            ..._identifiedFindings,
            ..._notIdentifiedFindings,
          ];
          identifiedScoreBySeverity.push({
            severity: getSeverityNum(),
            identifiedFindings: _identifiedFindings,
            notIdentifiedFindings: _notIdentifiedFindings,
            allFindings: _allFindings,
          });
        });
        Object.keys(userScoreSummary?.domain || []).forEach((_domainName) => {
          const domainId =
            getDomainByDemoDomainName(_domainName)?._id?.toString() || '';
          const name =
            domains.find((_domain) => _domain._id.toString() === domainId)
              ?.name || '';
          const _scoreByDomain = userScoreSummary?.domain?.[_domainName];
          const _identifiedFindings = identifiedFindings.filter(
            (_identifiedFinding) => {
              return _identifiedFinding.domainId === domainId;
            },
          );
          const _notIdentifiedFindings = notIdentifiedFindings.filter(
            (_notIdentifiedFinding) => {
              return _notIdentifiedFinding.domainId === domainId;
            },
          );
          const _allFindings = [
            ..._identifiedFindings,
            ..._notIdentifiedFindings,
          ];
          identifiedScoreByDomain.push({
            domainId,
            name,
            identifiedFindings: _identifiedFindings,
            notIdentifiedFindings: _notIdentifiedFindings,
            allFindings: _allFindings,
          });
        });

        scoreByDomain.forEach((_scoreByDomain) => {
          const domain = domains.find(
            (_domain) => _domain._id?.toString() === _scoreByDomain.domainId,
          );
          const domainId = domain?._id.toString();
          const parentDomainId = domain?.parentId;
          scoreByMainDomain.forEach((_scoreByMainDomain) => {
            if (
              _scoreByMainDomain.domainId === domainId ||
              _scoreByMainDomain.domainId === parentDomainId
            ) {
              _scoreByMainDomain.correctAnswersCount +=
                _scoreByDomain.correctAnswersCount;
              _scoreByMainDomain.incorrectAnswersCount +=
                _scoreByDomain.incorrectAnswersCount;
            }
          });
        });
        scoreByMainDomain.forEach((_scoreByMainDomain) => {
          _scoreByMainDomain.score =
            _scoreByMainDomain.correctAnswersCount +
              _scoreByMainDomain.incorrectAnswersCount ===
            0
              ? 0
              : (_scoreByMainDomain.correctAnswersCount /
                  (_scoreByMainDomain.correctAnswersCount +
                    _scoreByMainDomain.incorrectAnswersCount)) *
                100;
          _scoreByMainDomain.pass = _scoreByMainDomain.score > 67;
        });

        identifiedScoreByDomain.forEach((_identifiedScoreByDomain) => {
          const domain = domains.find(
            (_domain) =>
              _domain._id?.toString() === _identifiedScoreByDomain.domainId,
          );
          const domainId = domain?._id.toString();
          const parentDomainId = domain?.parentId;
          identifiedScoreByMainDomain.forEach(
            (_identifiedScoreByMainDomain) => {
              if (
                _identifiedScoreByMainDomain.domainId === domainId ||
                _identifiedScoreByMainDomain.domainId === parentDomainId
              ) {
                _identifiedScoreByMainDomain.correctAnswersCount +=
                  _identifiedScoreByDomain.identifiedFindings.length;
                _identifiedScoreByMainDomain.incorrectAnswersCount +=
                  _identifiedScoreByDomain.notIdentifiedFindings.length;
                _identifiedScoreByMainDomain.allAnswersCount +=
                  _identifiedScoreByDomain.identifiedFindings.length +
                  _identifiedScoreByDomain.notIdentifiedFindings.length;
                _identifiedScoreByMainDomain.identifiedFindings = [
                  ..._identifiedScoreByMainDomain.identifiedFindings,
                  ..._identifiedScoreByDomain.identifiedFindings,
                ];
                _identifiedScoreByMainDomain.notIdentifiedFindings = [
                  ..._identifiedScoreByMainDomain.notIdentifiedFindings,
                  ..._identifiedScoreByDomain.notIdentifiedFindings,
                ];
                _identifiedScoreByMainDomain.allFindings = [
                  ..._identifiedScoreByMainDomain.allFindings,
                  ..._identifiedScoreByDomain.identifiedFindings,
                  ..._identifiedScoreByDomain.notIdentifiedFindings,
                ];
              }
            },
          );
        });
        const studyMedication: StudyMedication[] =
          userScoreSummary?.study_drug?.answers?.map((_answer) => {
            return {
              documentId: _answer.document_id,
              documentName: _answer.document_name,
              numberOfPillsTakenBySubject: {
                input: _answer.u_pills_taken,
                correctAnswer: _answer.d_pills_taken,
              },
              numberOfPillsPrescribed: {
                input: _answer.u_pills_prescribed,
                correctAnswer: _answer.d_pills_prescribed,
              },
              percent: {
                input: _answer.u_pills_percent,
                correctAnswer: _answer.d_pills_percent,
              },
            };
          }) || [];

        const rescueMedication: RescueMedication[] =
          userScoreSummary?.rescue_med?.answers?.map((_answer) => {
            return {
              documentId: _answer.document_id,
              documentName: _answer.document_name,
              numberOfPillsTakenBySubject: {
                input: _answer.u_pills_taken,
                correctAnswer: _answer.d_pills_taken,
              },
            };
          }) || [];

        return {
          scoreByDomain,
          scoreByMainDomain,
          identifiedScoreBySeverity,
          identifiedScoreByDomain,
          identifiedScoreByMainDomain,
          identifiedAnswers,
          identifiedFindings,
          notIdentifiedAnswers,
          notIdentifiedFindings,
          studyMedication,
          rescueMedication,
        };
      };

      const recreatedUserSimulations = [
        ...demoSimUsersSummary,
        ...demoSimUsersSummaryPfizer,
        ...demoSimUsersSummaryAbbvie,
        ...demoSimUsersSummaryPharmOlam,
        ...demoSimUsersSummaryAllucent,
        ...demoSimUsersSummarySyneos,
      ]
        .filter(
          (_demoSimUserSummary) =>
            getUserId(_demoSimUserSummary.userId) &&
            getSimulationId(Number(_demoSimUserSummary.simulationId)),
        )
        .map((_demoSimUserSummary) => {
          const _userScoreSummary = demoUsersScoreSummary.find(
            (_duss) =>
              _duss.assessment_id === _demoSimUserSummary?.assessmentId || '',
          );
          const getUsageTime = () => {
            const _simulationId = _demoSimUserSummary.simulationId;
            const _userId = _demoSimUserSummary.userId;
            const _tempTimerLog = demoTempFindingLog.find(
              (_dtfl) =>
                _dtfl.simulation_id === _simulationId &&
                _dtfl.assessee_id === _userId,
            );
            if (!_tempTimerLog || !_tempTimerLog.pause_time_raw) return 0;
            const totalTime = getSecondsFromFormattedTime(
              (_tempTimerLog?.duration || '') as string,
            );
            const lastPauseTime =
              _tempTimerLog.pause_time_raw.length === 0
                ? 0
                : (_tempTimerLog.pause_time_raw[
                    _tempTimerLog.pause_time_raw.length - 1
                  ] as number);
            return totalTime - lastPauseTime;
          };
          const userId = getUserId(_demoSimUserSummary.userId);
          const simulationId = getSimulationId(
            Number(_demoSimUserSummary.simulationId),
          );
          const user = users.find((_user) => _user._id.toString() === userId);
          const clientUnitId = user?.profile?.clientUnitId || '';
          const businessUnitId = user?.profile?.businessUnitId || '';
          const connectFindingGroup = connectFindingGroups.find(
            (_connectFindingGroup) =>
              _connectFindingGroup.clientUnitId === clientUnitId &&
              _connectFindingGroup.businessUnitId === businessUnitId &&
              _connectFindingGroup.simulationId === simulationId,
          );
          const findingGroup = findingGroups.find(
            (_findingGroup) =>
              _findingGroup._id.toString() ===
                connectFindingGroup?.findingGroupId &&
              _findingGroup.simulationId === simulationId,
          );
          const totalFindings = findingGroup?.findingIds
            ?.map((_findingId) =>
              findings.find(
                (_finding) => _finding._id.toString() === _findingId,
              ),
            )
            ?.filter((_) => _);
          const recreatedUserSimulation: UserSimulation = {
            _id: undefined,
            userId,
            simulationType: getSimulationType(
              _demoSimUserSummary?.simulationName,
            ),
            simulationId,
            domainId: getDomainId(_demoSimUserSummary.simulationName),
            minimumEffort: false,
            unusualBehavior: _userScoreSummary?.collAudit ? true : false,
            results: _userScoreSummary
              ? getResults(_userScoreSummary, totalFindings)
              : null,
            usageTime: Number.isNaN(getUsageTime()) ? 0 : getUsageTime(), //getTime(_demoSimUserSummary?.pauseTime || ''),
            testTime: getTime(_demoSimUserSummary?.duration || ''),
            minimumHour: 0,
            isAgreed: 0,
            deadline: 0,
            status: getStatus(
              _demoSimUserSummary?.resultStage || '',
              _demoSimUserSummary?.submittedAt,
            ),
            instructions: [],
            protocols: [],
            attemptCount: 10,
            studyLogs: [],
            reopenCount: 0,
            isDeleted: _demoSimUserSummary.status === 'Deleted' ? true : false,
            startedAt: _demoSimUserSummary?.oStartedAt,
            assignedAt: _demoSimUserSummary?.createdAt,
            submittedAt: _demoSimUserSummary?.submittedAt,
            publishedAt: _demoSimUserSummary?.publishedAt,
            distributedAt: _demoSimUserSummary?.distributedAt,
            createdAt: _demoSimUserSummary?.createdAt,
            updatedAt: _demoSimUserSummary?.modifiedAt,
            demoId: _demoSimUserSummary.assessmentId,
            isActivated:
              _demoSimUserSummary.status === 'Active.' ? true : false,
            isDemo: true,
          };
          return recreatedUserSimulation;
        });
      console.info('start: bulk create');
      await this.userSimulationsRepository.bulkCreate(recreatedUserSimulations);
      console.info('finish: demo user simulation pfizer migration - done');
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async migrateUserAssessmentCycles(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo assessments migration');
    const demoAssessments = await migrationRepository.getAllAssessments();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary migration');
    const _demoUserStatus = await migrationRepository.getAllUserStatus();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary migration');
    const _demoUserStatusPfizer =
      await migrationRepository.getAllUserStatusPfizer();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary abbvie migration');
    const _demoUserStatusAbbvie =
      await migrationRepository.getAllUserStatusAbbvie();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary pharm olam migration');
    const _demoUserStatusPharmOlam =
      await migrationRepository.getAllUserStatusPharmOlam();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary allucent migration');
    const _demoUserStatusAllucent =
      await migrationRepository.getAllUserStatusPharmOlam();
    console.info('finish: collect users from demo');
    console.info('start: demo sim users summary syneos migration');
    const _demoUserStatusSyneos =
      await migrationRepository.getAllUserStatusPharmOlam();
    console.info('finish: collect users from demo');
    const demoUserStatus = [
      ..._demoUserStatus,
      ..._demoUserStatusPfizer,
      ..._demoUserStatusAbbvie,
      ..._demoUserStatusPharmOlam,
      ..._demoUserStatusAllucent,
      ..._demoUserStatusSyneos,
    ];
    console.info('start: call db data');
    console.info('users');
    const users = await this.usersRepository.find({
      filter: { isDeleted: false },
    });
    // const userIds = users.map((_user) => _user?._id?.toString() || '');
    console.info('clients');
    const clientUnits = await this.clientUnitsService.readAllClient({
      filter: { isDeleted: false },
    });
    console.info('userSimulations');
    const userSimulations =
      await this.userSimulationsRepository.findWithoutAggregation({
        filter: {
          isDeleted: false,
          // isDemo: true,
        },
        projection: {
          _id: 1,
          demoId: 1,
        },
      });
    console.info('userTrainings');
    const userTrainings = await this.userTrainingsRepository.findWithOriginal(
      {
        filter: {
          isDeleted: false,
        },
      },
      '_id userId demoId trainingId domainId',
    );
    console.info('assessmentCycles');
    const assessmentCycles = (await this.assessmentCyclesService.find({
      filter: { isDeleted: false },
      options: { multi: true },
    })) as AssessmentCycle[];
    console.info('assessmentTypes');
    const assessmentTypes = (await this.assessmentTypesService.find({
      filter: { isDeleted: false },
      options: { multi: true },
    })) as AssessmentType[];
    console.info('finish: call db data');
    const _ = require('lodash');
    console.info('start: grouping');
    const assessmentsGroupByUserId = _.groupBy(
      demoAssessments,
      (_demoAssessment) => _demoAssessment.assessee_id,
    );
    console.info('finish: grouping');
    console.info('start: recreate userAssessmentCycle');
    const recreatedUserAssessmentCycles = [];
    Object.keys(assessmentsGroupByUserId)
      .filter((demoUserId) => {
        return users.find((_user) => _user.demoId === demoUserId);
      })
      .forEach((demoUserId) => {
        const assessmentGroup = assessmentsGroupByUserId[demoUserId];
        const assessmentBaselineGroup = assessmentGroup?.filter(
          (_assessment) =>
            _assessment?.simulation?.name
              ?.toLowerCase()
              ?.includes('baseline') ||
            _assessment?.simulation?.name?.toLowerCase()?.includes('prehire'),
        );
        assessmentBaselineGroup.forEach((_baselineAssessment) => {
          const baseline = _baselineAssessment;
          let followups = [];
          // if (assessmentGroup.length === 1) {
          //   baseline = assessmentGroup[0];
          // } else {
          //   baseline = assessmentGroup.find((_assessment) =>
          //     _assessment?.simulation?.name?.startsWith('B'),
          //   );
          //   followups = assessmentGroup.filter(
          //     (_assessment) =>
          //       _assessment?.simulation?.name &&
          //       !_assessment?.simulation?.name?.startsWith('B'),
          //   );
          // }
          if (baseline?.simulation?.name?.toLowerCase()?.includes('baseline')) {
            followups = assessmentGroup.filter(
              (_assessment) =>
                _assessment?.simulation?.name &&
                _assessment?.simulation?.name
                  ?.toLowerCase()
                  ?.includes('followup'),
            );
          }
          const user = users.find(
            (_user) => _user.demoId === baseline?.assessee_id,
          );
          const localDemoUserStatus = demoUserStatus.find(
            (_localDemoUserStatus) =>
              _localDemoUserStatus.userId === demoUserId &&
              _localDemoUserStatus.clientId === baseline?.client_id,
          );
          const recreatedUserAssessmentCycle: UserAssessmentCycle = {
            assessmentCycleId:
              assessmentCycles
                .find(
                  (_assessmentCycle) =>
                    _assessmentCycle.demoId === baseline?.bu_id,
                )
                ?._id?.toString() || '000000000000000000000000',
            assessmentTypeId:
              assessmentTypes
                .find(
                  (_assessmentType) =>
                    _assessmentType.demoId === baseline?.bu_id,
                )
                ?._id?.toString() || '000000000000000000000000',
            clientUnitId:
              clientUnits
                .find(
                  (_clientUnit) => _clientUnit.demoId === baseline?.client_id,
                )
                ?._id?.toString() || '000000000000000000000000',
            businessUnitId:
              clientUnits
                .find(
                  (_clientUnit) => _clientUnit.demoId === baseline?.client_id,
                )
                ?.businessUnits.find(
                  (_businessUnit) => _businessUnit.demoId === baseline?.bu_id,
                )
                ?._id?.toString() || '000000000000000000000000',
            businessCycleId:
              clientUnits
                .find(
                  (_clientUnit) => _clientUnit.demoId === baseline?.client_id,
                )
                ?.businessUnits.find(
                  (_businessUnit) => _businessUnit.demoId === baseline?.bu_id,
                )
                ?.businessCycles?.[0]?._id?.toString() ||
              '000000000000000000000000',
            userBaselineId:
              userSimulations
                .find(
                  (_userSimulation) => _userSimulation.demoId === baseline?._id,
                )
                ?._id?.toString() || '000000000000000000000000',
            userTrainingIds:
              assessmentTypes
                .find(
                  (_assessmentType) =>
                    _assessmentType.demoId === baseline?.bu_id,
                )
                ?.trainings?.filter((_training) =>
                  userTrainings.find((_userTraining) => {
                    return (
                      _training?._id?.toString() === _userTraining.trainingId &&
                      user?._id?.toString() === _userTraining.userId
                    );
                  }),
                )
                ?.map((_training) =>
                  userTrainings
                    .find((_userTraining) => {
                      return (
                        _training?._id?.toString() ===
                          _userTraining.trainingId &&
                        user?._id?.toString() === _userTraining.userId
                      );
                    })
                    ._id.toString(),
                ) || [],
            userFollowupIds: followups
              .map((_followup) =>
                userSimulations.find(
                  (_userSimulation) => _userSimulation.demoId === _followup._id,
                ),
              )
              .filter((_userSimulation) => _userSimulation)
              .map(
                (_userSimulation) =>
                  _userSimulation?._id?.toString() ||
                  '000000000000000000000000',
              ),
            userId:
              users
                .find((_user) => _user.demoId === demoUserId)
                ?._id?.toString() || '000000000000000000000000',
            countryId:
              users
                .find((_user) => _user.demoId === demoUserId)
                ?.profile?.countryId?.toString() || '000000000000000000000000',
            isSimTutorialViewed: false,
            isTrainingTutorialViewed: false,
            isBaselineTour: false,
            isTrainingTour: false,
            isViewportTour: false,
            isTrainingViewTour: false,
            isTrainingMainTour: false,
            verified: localDemoUserStatus?.verifiedByCA ? true : false,
            signedOff: localDemoUserStatus?.signOff?.value ? true : false,
            signedOffDate: localDemoUserStatus?.signOff?.on,
            invoiced: localDemoUserStatus?._invoiced?.value ? true : false,
            invoicedDate: localDemoUserStatus?._invoiced?._on,
            bypass: false,
            grade: localDemoUserStatus?.continuum
              ? localDemoUserStatus.continuum
              : localDemoUserStatus?._grade
              ? localDemoUserStatus._grade
              : '',
            minimumEffort: localDemoUserStatus?._minEffort,
            collaborated: localDemoUserStatus?._collaborated,
            isDeleted: false,
            status: localDemoUserStatus?._status || '',
            completeAt: localDemoUserStatus?._pubAtRaw
              ? localDemoUserStatus?._pubAtRaw
              : undefined,
            createdAt: baseline?.createdAt,
            updatedAt: baseline?.modifiedAt,
            simTutorialDuration: 0,
            trainingTutorialDuration: 0,
            demoId: 'demo',
            isDemo: true,
            // submittedAt: userSimulations.find(
            //   (_userSimulation) => _userSimulation.demoId === baseline?._id,
            // )?.submittedAt,
          };
          recreatedUserAssessmentCycles.push(recreatedUserAssessmentCycle);
        });
      });
    console.info(
      `start: bulk create - ${recreatedUserAssessmentCycles.length}`,
    );
    await this.userAssessmentCycleRepository.bulkCreate(
      recreatedUserAssessmentCycles,
    );
    console.info('finish: userAssessmentCycle migration - done');
  }

  async migrateUserAssessmentCycleSummary(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: migrate userAssessmentCycleSummary');
    console.info('call data');
    console.info('userAssessmentCycle');
    const userAssessmentCycleCount =
      await this.userAssessmentCycleRepository.migrationCount({
        filter: { isDeleted: false, isDemo: true },
      });
    let cursor = 0;
    const promises = [];
    while (cursor < userAssessmentCycleCount) {
      const skip = cursor;
      const limit = 1000;
      const fetch = async (skip: number, limit: number) => {
        const data = await this.userAssessmentCycleRepository.migrationFind({
          filter: { isDeleted: false, isDemo: true },
          options: { skip, limit },
        });
        console.info(`${skip} ~ ${skip + limit}`);
        return data;
      };
      promises.push(async () => await fetch(skip, limit));
      cursor += 1000;
    }
    let count = 0;
    for (const promise of promises) {
      const data = await promise();
      count += data?.length || 0;
      const userAssessmentCycles = [...data];
      console.info('create userAssessmentCycleSummaries data');
      const recreatedUserAssessmentCycleSummaries = userAssessmentCycles.map(
        (_userAssessmentCycle) => {
          const userBaseline = _userAssessmentCycle?.userBaseline || null;
          const userFollowups = _userAssessmentCycle?.userFollowups || [];
          let status = '';
          if (
            userBaseline?.status === UserSimulationStatus.HasNotAssigned ||
            userBaseline?.status === UserSimulationStatus.Assigned ||
            userBaseline?.status === UserSimulationStatus.InProgress
          ) {
            status = 'Pending';
          } else if (
            userBaseline?.status === UserSimulationStatus.Scoring ||
            userBaseline?.status === UserSimulationStatus.Published
          ) {
            status = 'Scoring';
          } else {
            let notPassedCount = 0;
            userBaseline?.results?.scoreByMainDomain?.forEach(
              (_scoreByMainDomain) => {
                if (!_scoreByMainDomain.pass) notPassedCount++;
              },
            );
            if (notPassedCount === 0) {
              status = 'Completed';
            } else {
              status =
                userFollowups.length > 0 &&
                userFollowups.reduce((acc: string, cur: UserSimulation) => {
                  if (
                    cur?.status === UserSimulationStatus.Distributed ||
                    cur?.status === UserSimulationStatus.Exported ||
                    cur?.status === UserSimulationStatus.Reviewed
                  )
                    return acc;
                  return false;
                }, true)
                  ? 'Completed'
                  : 'Scoring';
            }
          }
          const userAssessmentCycleSummary: CreateUserAssessmentCycleSummaryDto =
            {
              ..._userAssessmentCycle,
              userAssessmentCycleId: _userAssessmentCycle?._id?.toString(),
              status,
            };
          return userAssessmentCycleSummary;
        },
      );
      console.info(`bulk create ${count}`);
      await this.userAssessmentCycleSummaryRepository.bulkCreate(
        recreatedUserAssessmentCycleSummaries,
      );
      console.info(`finished ${count}`);
    }
    // const userAssessmentCycles =
    //   await this.userAssessmentCycleRepository.migrationFind({
    //     filter: { isDeleted: false, isDemo: true },
    //   });
  }

  async migrateTrainings(version = '1') {
    const migrationRepository =
      version === '1' ? this.migration1Repository : this.migration2Repository;
    console.info('start: demo training modules migration');
    const demoTrainingModules =
      await migrationRepository.getAllTrainingModules();
    console.info('finish: collect training modules from demo');
    console.info('start: demo training module pages migration');
    const demoTrainingModulePages =
      await migrationRepository.getAllTrainingModulePages();
    console.info('finish: collect training module pages from demo');

    const recreatedTrainings = demoTrainingModules.map(
      (_demoTrainingModule) => {
        const pages: Pages = {};
        const demoPages: Page[] = demoTrainingModulePages
          .filter(
            (_demoTrainingModulePage) =>
              _demoTrainingModulePage.moduleId === _demoTrainingModule._id,
          )
          .map((_demoPage) => {
            const recreatedPage: Page = {
              _id: _demoPage._id || 'undefined',

              title: _demoPage.title || '',

              type: _demoPage?.type || '',

              order: _demoPage?.order || -1,

              duration: _demoPage?.duration || 0,

              isActivated: false,

              quizId: '',

              videoId: '',

              quizes: [],
            };
            return recreatedPage;
          });
        demoPages.forEach((_demoPage) => {
          pages[_demoPage._id] = _demoPage;
        });
        const recreatedTraining: Training = {
          _id: undefined,
          title: _demoTrainingModule?.name || '',
          description: '',
          coverImage: '',
          progressOption: _demoTrainingModule?.progressOption ? true : false,
          order: Number(_demoTrainingModule?.order || -1),
          pages,
          isActivated: false,
          updatedAt: _demoTrainingModule?.modifiedAt,
          createdAt: _demoTrainingModule?.createdAt,
          demoId: _demoTrainingModule._id,
          isDemo: true,
        };

        return recreatedTraining;
      },
    );
    console.info('start: bulk create');
    this.trainingsRepository.bulkCreate(recreatedTrainings);
    console.info('finish: trainings migration - done');
  }

  async migrateUserTrainings(version = '1') {
    try {
      const migrationRepository =
        version === '1' ? this.migration1Repository : this.migration2Repository;
      console.info('start: demo training status summary migration');
      const demoTrainingStatusSummary =
        await migrationRepository.getAllTrainingStatusSummary();
      console.info('finish: collect training status summary from demo');
      console.info('start: demo training module pages migration');
      const demoTrainingModuleScoreSummaries =
        await migrationRepository.getAllTrainingModuleScoreSummary();
      console.info('finish: collect training module pages from demo');
      console.info('start: demo training module migration');
      const demoTrainingModules =
        await migrationRepository.getAllTrainingModules();
      console.info('finish: collect training module from demo');

      const trainings = await this.trainingsRepository.find({ filter: {} });
      const users = await this.usersRepository.find({ filter: {} });
      const domains = await this.domainsRepository.find({ filter: {} });
      // const assessmentCycles = await this.assessmentCyclesService.find({
      //   filter: { isDeleted: false },
      // });
      // const assessmentTypes = await this.assessmentTypesService.find({
      //   filter: { isDeleted: false },
      // });

      const recreatedUserTrainings = demoTrainingStatusSummary
        .filter((_demoTrainingStatusSummary) => {
          const user = users.find(
            (_user) => _user.demoId === _demoTrainingStatusSummary.userId,
          );
          const training = trainings.find(
            (_training) =>
              _training.demoId === _demoTrainingStatusSummary.moduleId,
          );
          return user && training;
        })
        .map((_demoTrainingStatusSummary) => {
          const demoTrainingModuleScoreSummary =
            demoTrainingModuleScoreSummaries.find(
              (_demoTrainingModuleScoreSummary) =>
                _demoTrainingModuleScoreSummary.moduleId ===
                  _demoTrainingStatusSummary.moduleId &&
                _demoTrainingModuleScoreSummary.userId ===
                  _demoTrainingStatusSummary.userId,
            );
          const demoTrainingModule = demoTrainingModules.find(
            (_demoTrainingModule) =>
              _demoTrainingModule._id === _demoTrainingStatusSummary.moduleId,
          );
          const pageProgresses: PageProgresses = {};
          const startedAt = _demoTrainingStatusSummary.startedAt;
          const createdAt = _demoTrainingStatusSummary.createdAt;
          const completedAt =
            _demoTrainingStatusSummary?.completedAt?.length > 0
              ? _demoTrainingStatusSummary.completedAt[
                  _demoTrainingStatusSummary.completedAt.length - 1
                ]
              : undefined;
          const getScreenTime = () => {
            if (!startedAt || !completedAt) return 0;
            return (
              (new Date(completedAt).getTime() -
                new Date(startedAt).getTime()) /
              1000
            );
          };
          const getDomainId = () => {
            const order = demoTrainingModule?.order || '';
            return (
              domains
                .find(
                  (_domain) =>
                    _domain.followupNumber === Number(order || -1) &&
                    !_domain.parentId,
                )
                ?._id?.toString() || ''
            );
          };
          const totalPages = _demoTrainingStatusSummary?.progress?.total
            ? _demoTrainingStatusSummary?.progress?.total
            : _demoTrainingStatusSummary?.progress?.totalPages
            ? _demoTrainingStatusSummary?.progress?.totalPages
            : 0;
          const percent = _demoTrainingStatusSummary?.progress?.percent || 0;
          const finishedPagesCount = (totalPages * percent) / 100;
          Array(totalPages)
            .fill(null)
            .forEach((_, index) => {
              const isCompleted = index < finishedPagesCount;
              const pageProgress: PageProgress = {
                pageId: '',
                status: isCompleted
                  ? UserTrainingStatus.Complete
                  : UserTrainingStatus.HasNotStarted,
                quizAnswers: {},
                videoTime: 0,
                videoWatchingTime: getScreenTime() / totalPages,
                quizScore: 0,
                screenTime: getScreenTime() / totalPages,
                totalScore: 0,
              };
              // if (index === 0) {
              //   pageProgress.videoWatchingTime = getScreenTime() / totalPages;
              // }
              if (index === 0 && demoTrainingModuleScoreSummary) {
                pageProgress.quizScore =
                  demoTrainingModuleScoreSummary?.percent || 0;
                pageProgress.totalScore = 100;
              }
              pageProgresses[index] = pageProgress;
            });
          const userTrainingSummary: UserTrainingSummary = {
            allPages: [],
            completePages: [],
            videoTime: 0,
            videoWatchingTime: getScreenTime(),
            quizScore: pageProgresses?.[0]?.quizScore || 0,
            screenTime: getScreenTime(),
          };
          const recreatedUserTraining: UserTraining = {
            _id: undefined,
            userId:
              users
                .find(
                  (_user) => _user.demoId === _demoTrainingStatusSummary.userId,
                )
                ?._id?.toString() || '',
            assessmentCycleId: '',
            assessmentTypeId: '',
            trainingId:
              trainings
                .find(
                  (_training) =>
                    _training.demoId === _demoTrainingStatusSummary.moduleId,
                )
                ?._id?.toString() || '',
            domainId: getDomainId(),
            usageTime: 0,
            status: !_demoTrainingStatusSummary?.trainingStatus
              ? UserTrainingStatus.HasNotAssigned
              : _demoTrainingStatusSummary.trainingStatus === 'Complete'
              ? UserTrainingStatus.Complete
              : _demoTrainingStatusSummary.trainingStatus === 'Started'
              ? UserTrainingStatus.InProgress
              : UserTrainingStatus.HasNotStarted,
            progresses: pageProgresses,
            summary: userTrainingSummary,
            isDeleted: false,
            startedAt: _demoTrainingStatusSummary.startedAt,
            completedAt,
            assignedAt: _demoTrainingStatusSummary.assignedAt,
            createdAt,
            updatedAt: _demoTrainingStatusSummary.modifiedAt,
            demoId: _demoTrainingStatusSummary?._id?.toString() || '',
            isDemo: true,
          };
          return recreatedUserTraining;
        });

      console.info('start: bulk create');
      this.userTrainingsRepository.bulkCreate(recreatedUserTrainings);
      console.info('finish: user trainings migration - done');
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  getRole(demoRole: string | number) {
    const _demoRole = Number(demoRole);
    switch (_demoRole) {
      case 1: {
        // Sys admin
        return 0;
      }
      case 2: {
        // Admin
        return 2;
      }
      case 3: {
        // Sub admin
        return null;
      }
      case 4: {
        // client admin
        return 4;
      }
      case 5: {
        // client sub admin
        return 5;
      }
      case 6: {
        // sim user
        return 6;
      }
      case 7: {
        // sim scorer
        return 7;
      }
      default: {
        return null;
      }
    }
  }

  getSeverity(severity: string) {
    switch (severity) {
      case 'Critical': {
        return 0;
      }
      case 'Major': {
        return 1;
      }
      case 'Minor': {
        return 2;
      }
      default: {
        return -1;
      }
    }
  }

  getDomainVisibleId(category: string) {
    switch (category.toLowerCase().replace(' ', '')) {
      case 'Protocol Requirement'.toLowerCase().replace(' ', ''): {
        // Sys admin
        return 1;
      }
      case 'Source Documentation, CRF, Source-to-CRF Review'
        .toLowerCase()
        .replace(' ', ''): {
        // Admin
        return 2;
      }
      case 'Source Documentation'.toLowerCase().replace(' ', ''): {
        // Sub admin
        return 3;
      }
      case 'Source to EDC/EDC'.toLowerCase().replace(' ', ''): {
        // client admin
        return 4;
      }
      case 'Source Documentation/Source to EDC/EDC'
        .toLowerCase()
        .replace(' ', ''): {
        // client sub admin
        return 5;
      }
      case 'The Informed Consent Process'.toLowerCase().replace(' ', ''): {
        // sim user
        return 6;
      }
      case 'ICF Process'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 7;
      }
      case 'IRB/IEC Submission Approval'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 8;
      }
      case 'IRB Submission/Approval'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 9;
      }
      case 'IEC Submission/Approval'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 10;
      }
      case 'Potential Fraud, Scientific Misconduct and Delegation of Authority'
        .toLowerCase()
        .replace(' ', ''): {
        // sim scorer
        return 11;
      }
      case 'Potential Fraud'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 12;
      }
      case 'Delegation of Authority'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 13;
      }
      case 'Delegation of Authority and Training'
        .toLowerCase()
        .replace(' ', ''): {
        // sim scorer
        return 14;
      }
      case 'Potential Fraud/Scientific Misconduct'
        .toLowerCase()
        .replace(' ', ''): {
        // sim scorer
        return 15;
      }
      case 'IRB/IEC Reporting'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 16;
      }
      case 'EC Reporting'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 17;
      }
      case 'IEC Reporting'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 18;
      }
      case 'IRB Reporting'.toLowerCase().replace(' ', ''): {
        // sim scorer
        return 19;
      }
      default: {
        return -1;
      }
    }
  }
}
