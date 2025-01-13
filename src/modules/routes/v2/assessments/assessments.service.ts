import { AnswerStatus, AssessmentStatus } from 'src/utils/status';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { NonErrorStatus, Note } from '../notes/schemas/note.schema';

import { Answer } from '../answers/schemas/answer.schema';
import AnswersService from '../answers/answers.service';
import { Assessment } from './schemas/assessment.schema';
import AssessmentDto from './dto/assessment.dto';
import AssessmentsRepository from './assessments.repository';
import CreateAssessmentDao from './dto/createAssessment.dto';
import { Domain } from '../domains/schemas/domain.schema';
import DomainsService from '../domains/domains.service';
import { Finding } from '../findings/schemas/finding.schema';
import FindingsService from '../findings/findings.service';
import FoldersService from '../folders/folders.service';
import NotesService from '../notes/notes.service';
import SettingsService from '../settings/settings.service';
import { SimDoc } from '../../v1/simDocs/schemas/simDoc.schema';
import SimDocsService from '../../v1/simDocs/simDocs.service';
import SimulationMappersService from '../../v3/simulationMapper/simulationMappers.service';
import { SimulationsService } from '../../v1/simulations/simulations.service';
import UserSimulationsService from '../userSimulations/userSimulations.service';
import mongoose from 'mongoose';

@Injectable()
export default class AssessmentsService {
  constructor(
    private readonly answersService: AnswersService,
    private readonly findingsService: FindingsService,
    private readonly simulationsService: SimulationsService,
    private readonly userSimulationService: UserSimulationsService,

    private readonly simDocsService: SimDocsService,
    private readonly foldersService: FoldersService,
    private readonly settingsService: SettingsService,
    private readonly assessmentsRepository: AssessmentsRepository,
    private readonly domainsService: DomainsService,
    private readonly notesService: NotesService,
    private readonly simulationMappersService: SimulationMappersService,
  ) {}

  public async bulkDemoCreate(_assessments: CreateAssessmentDao[]) {
    await this.assessmentsRepository.bulkCreate(_assessments);
  }

  public async create(_assessment: AssessmentDto): Promise<Assessment | null> {
    const setting: any = await this.settingsService.getScorerSetting();
    const assessmentId = new mongoose.Types.ObjectId();
    const assessment = {
      ..._assessment,
      firstScorer: {
        _id: setting.firstScorerId,
        status: AssessmentStatus.Pending,
        scoringTime: 0,
      },
      secondScorer: {
        _id: setting.secondScorerId,
        status: AssessmentStatus.Pending,
        scoringTime: 0,
      },
      adjudicator: {
        _id: setting.adjudicatorId,
        status: AssessmentStatus.Pending,
      },
      publishedAt: null,
      _id: assessmentId,
    };

    const previousAssessment = await this.assessmentsRepository.find({
      filter: {
        userSimulationId: assessment.userSimulationId,
      },
    });

    await this.notesService.createMNID(assessment.userSimulationId);

    if (previousAssessment.length > 0) {
      return previousAssessment[0];
    }

    const newAssessment = await this.assessmentsRepository.create(assessment);

    const userSimulation = await this.userSimulationService.findById(
      newAssessment.userSimulationId,
    );

    const simulationId = userSimulation.simulationId;

    // const { folderIds } = await this.simulationsService.findById(simulationId);

    // const subFolders = await this.foldersService.findByIds(folderIds);

    // const subFolderIds = subFolders?.map((folder) => folder._id) || [];

    // const totalFolderIds = [...folderIds, ...subFolderIds];

    // const simDocs = await this.simDocsService.findByFolderIds(totalFolderIds);

    // const simDocIds = simDocs.map((simDoc) => simDoc._id);

    // const findings = await this.findingsService.findBySimDocIds(simDocIds);

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
    const findings = await this.findingsService.find({
      filter: {
        visibleId: { $in: [...simulationMappers.map((_sm) => _sm.findingId)] },
      },
    });

    if (findings.length === 0) {
      throw new HttpException('findings not found', HttpStatus.NOT_FOUND);
    }

    const answers: Answer[] = findings?.map((finding) => ({
      _id: null,
      findingId: finding._id,
      userSimulationId: _assessment.userSimulationId,
      scoring: {
        firstScorer: {
          scorerId: setting.firstScorerId,
          noteId: null,
          answerStatus: AnswerStatus.NotScored,
          updatedAt: new Date(),
        },
        secondScorer: {
          scorerId: setting.secondScorerId,
          noteId: null,
          answerStatus: AnswerStatus.NotScored,
          updatedAt: new Date(),
        },
        adjudicator: {
          scorerId: setting.adjudicatorId,
          noteId: null,
          answerStatus: AnswerStatus.NotScored,
          updatedAt: new Date(),
        },
      },
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDemo: false,
      demoId: '',
    }));

    await this.answersService.bulkCreate([...answers]);

    return newAssessment;
  }

  public async findWithoutAggregation(
    query: MongoQuery<Assessment>,
  ): Promise<Assessment[] | null> {
    const data = await this.assessmentsRepository.findWithoutAggregation(query);
    return data;
  }

  public async find(
    query: MongoQuery<Assessment>,
  ): Promise<Assessment[] | null> {
    const data = await this.assessmentsRepository.find(query);
    return data;
  }

  public async count(query: MongoQuery<Assessment>) {
    return this.assessmentsRepository.count(query);
  }

  public async findOne(
    query: MongoQuery<Assessment>,
  ): Promise<Assessment | null> {
    return this.assessmentsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Assessment | null> {
    return this.assessmentsRepository.findById(id);
  }

  public async update(
    body: MongoUpdate<Assessment>,
  ): Promise<Assessment | null> {
    return this.assessmentsRepository.update(body);
  }

  public async delete(
    query: MongoDelete<Assessment>,
  ): Promise<Assessment[] | null> {
    return this.assessmentsRepository.deleteMany(query);
  }

  async getFindingById(findingId: string) {
    return this.findingsService.findOne({ filter: { _id: findingId } });
  }

  async getDomains() {
    return this.domainsService.find({ filter: {} });
  }

  async getNeedToBeAdjudicate(assessmentId: string) {
    const assessment = await this.assessmentsRepository.findById(assessmentId);
    const answers = await this.answersService.find({
      filter: {
        userSimulationId: assessment.userSimulationId,
      },
    });
    const notes = await this.notesService.find({
      filter: {
        'viewport.userSimulationId': assessment.userSimulationId,
      },
    });
    let isNeedToBeAdjudicate = false;
    let finishedBoth = true;
    let isAnyNonError = false;
    answers.forEach((_answer) => {
      const firstScorer = _answer.scoring.firstScorer;
      const secondScorer = _answer.scoring.secondScorer;
      if (
        firstScorer.answerStatus === AnswerStatus.NotScored ||
        secondScorer.answerStatus === AnswerStatus.NotScored
      ) {
        finishedBoth = false;
      }
      const correctCondition =
        firstScorer.answerStatus === secondScorer.answerStatus &&
        firstScorer.answerStatus === AnswerStatus.Correct &&
        firstScorer.noteId === secondScorer.noteId;
      const incorrectCondition =
        firstScorer.answerStatus === secondScorer.answerStatus &&
        firstScorer.answerStatus === AnswerStatus.InCorrect;
      if (correctCondition || incorrectCondition) {
        return;
      }
      isNeedToBeAdjudicate = true;
    });
    notes.forEach((_note) => {
      if (_note.nonErrors.length > 0) {
        isAnyNonError = true;
      }
    });
    if (finishedBoth && !isNeedToBeAdjudicate && !isAnyNonError) {
      await this.assessmentsRepository.update({
        filter: {
          _id: assessmentId,
        },
        update: {
          $set: {
            'adjudicator.status': AssessmentStatus.Complete,
          },
        },
      });
    }
  }
}
