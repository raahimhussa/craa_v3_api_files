import * as moment from 'moment';
import * as tmp from 'tmp';
import * as xlsx from 'xlsx';

import {
  AnswerStatus,
  AssessmentStatus,
  SimulationType,
  UserSimulationStatus,
  UserTrainingStatus,
} from 'src/utils/status';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BusinessCycle,
  ClientUnit,
} from '../../v1/clientUnits/schemas/clientUnit.schema';

import { Answer } from '../../v2/answers/schemas/answer.schema';
import AnswersService from '../../v2/answers/answers.service';
import { AssessmentCycle } from '../../v1/assessmentCycles/assessmentCycle.schema';
import { AssessmentType } from '../../v1/assessmentTypes/schemas/assessmentType.schema';
import AssessmentsService from '../../v2/assessments/assessments.service';
import { ClientUnitsService } from '../../v1/clientUnits/clientUnits.service';
import { Domain } from '../../v2/domains/schemas/domain.schema';
import DomainsService from '../../v2/domains/domains.service';
import { Finding } from '../../v2/findings/schemas/finding.schema';
import FindingsService from '../../v2/findings/findings.service';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import NotesRepository from '../../v2/notes/notes.repository';
import ScoringManagementService from '../ScoringManagement/scoringManagement.service';
import SimDistributionRepository from './simDistribution.repository';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import { User } from '../../v1/users/schemas/users.schema';
import { UserAssessmentCyclesService } from '../../v1/userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import { getFormattedTime } from 'src/utils/utils';

@Injectable()
export default class SimDistributionService {
  constructor(
    private readonly simDistributionRepository: SimDistributionRepository,

    private readonly userSimulationsService: UserSimulationsService,
    private readonly clientUnitService: ClientUnitsService,
    private readonly userAssessmentCyclesService: UserAssessmentCyclesService,
    private readonly domainsService: DomainsService,
    private readonly userTrainingsService: UserTrainingsService,
    private readonly assessmentsService: AssessmentsService,
    private readonly answersService: AnswersService,
    private readonly findingsService: FindingsService,
    private readonly notesRepository: NotesRepository,
  ) {}

  async find(query: MongoQuery<any>) {
    const simDistributions = await this.simDistributionRepository.find(query);
    return simDistributions;
  }

  async count(query: MongoQuery<any>) {
    const simDistributionCount = await this.simDistributionRepository.count(
      query,
    );
    return simDistributionCount;
  }

  public async baselineDistribute(userSimulationId: string) {
    // 전체 메인과 서브 도메인을 전부 찾아서 가져온다.
    const domains = await this.domainsService.find({
      filter: { isDeleted: false },
    });
    // 평가에 딸린 정답을 찾아온다.
    const answers = await this.answersService.find({
      filter: { userSimulationId, isDeleted: false },
    });
    // 평가에 대한 유저 사이클을 가져온다.
    const userAssessmentCycle = await this.userAssessmentCyclesService.findOne({
      filter: { userBaselineId: userSimulationId },
    });

    const findings = await this.findingsService.find({
      filter: {
        _id: {
          $in: answers.map((_answer) => _answer.findingId),
        },
      },
    });

    // 판매 가져온다. (최소점수 계산을 위해서)
    const businessCycle = await this.clientUnitService.readBusinessCycle(
      userAssessmentCycle.clientUnitId,
      userAssessmentCycle.businessUnitId,
      userAssessmentCycle.businessCycleId,
    );

    const baselineResultSummary = await this.getScoreByMainDomain(
      domains,
      answers,
      findings,
      businessCycle,
    );

    // 통과 도메인 필터
    const trainingDomainIds = baselineResultSummary
      .filter((result) => !result.pass) //통과하지 못한 애들은 훈련시켜야함
      .map((result) => result.domainId);

    // 통과된 도메인을 가지고 있으면서 유저AC에 할당되어 있는 UserTrainings을 시작하지 않음으로 할당한다.(해당 상태는 할당이 되었으나 시작되지 않음을 의미)
    // 상태는 원래 명사로 만들어야하는데 시간 남으면 명사로 변경하셔도 되고 그대로 프론트에 뿌리셔도 됩니다. @eziong님이 알아서 변경해주세요.
    await this.userTrainingsService.update({
      filter: {
        _id: {
          $in: userAssessmentCycle.userTrainingIds,
        },
        domainId: {
          $in: trainingDomainIds,
        },
      },
      update: {
        assignedAt: new Date(),
        status: UserTrainingStatus.HasNotStarted,
      },
    });
    await this.userSimulationsService.update({
      filter: {
        _id: userSimulationId,
      },
      update: {
        status: UserSimulationStatus.Distributed,
        distributedAt: new Date(),
      },
    });
    await this.userAssessmentCyclesService.renewSummary({
      filter: {
        userBaselineId: userSimulationId,
      },
    });
    return trainingDomainIds;
  }

  public async followupDistribute(userSimulationId: string) {
    await this.userSimulationsService.update({
      filter: {
        _id: userSimulationId,
      },
      update: {
        status: UserSimulationStatus.Distributed,
        distributedAt: new Date(),
      },
    });
    await this.userAssessmentCyclesService.renewSummary({
      filter: {
        userFollowupIds: userSimulationId,
      },
    });
  }

  public async distributeAll(userAssessmentCycleId: string) {
    const userAssessmentCycle = await this.userAssessmentCyclesService.findById(
      userAssessmentCycleId,
    );
    const userBaselineId = userAssessmentCycle.userBaselineId;
    const userFollowupIds = userAssessmentCycle.userFollowupIds;

    await this.userSimulationsService.update({
      filter: {
        _id: { $in: [userBaselineId, ...userFollowupIds] },
        status: UserSimulationStatus.Published,
      },
      update: {
        status: UserSimulationStatus.Distributed,
        distributedAt: new Date(),
      },
    });
    await this.userAssessmentCyclesService.renewSummary({
      filter: {
        _id: userAssessmentCycleId,
      },
    });
  }

  getScoreByMainDomain(
    domains: Domain[],
    answers: Answer[],
    findings: Finding[],
    businessCycle: BusinessCycle,
  ) {
    const mainDomainScoreResults = domains
      .filter((_domain) => _domain.depth === 0)
      .map((_domain) => ({
        domainId: _domain._id.toString(),
        name: _domain.name,
        correctAnswersCount: 0,
        incorrectAnswersCount: 0,
        allAnswersCount: 0,
        pass: false,
        minScore: 0,
        score: 0,
      }));
    findings.forEach((_finding) => {
      const answer = answers.find(
        (_answer) => _answer.findingId === _finding._id.toString(),
      );
      const domain = domains.find(
        (_domain) => _domain._id.toString() === _finding.domainId,
      );
      const isIdentified = answer ? this.isCorrectAnswer(answer) : false;
      //NOTE - correct === identified
      const scoreByMainDomainResult = mainDomainScoreResults.find(
        (_identifiedScoreByMainDomainResults) =>
          _identifiedScoreByMainDomainResults.domainId ===
            domain._id.toString() ||
          _identifiedScoreByMainDomainResults.domainId === domain.parentId,
      );
      isIdentified
        ? scoreByMainDomainResult.correctAnswersCount++
        : scoreByMainDomainResult.incorrectAnswersCount++;
      scoreByMainDomainResult.allAnswersCount++;
    });
    mainDomainScoreResults.forEach((result) => {
      result.score =
        result.allAnswersCount === 0
          ? 0
          : (result.correctAnswersCount / result.allAnswersCount) * 100;
      result.minScore =
        businessCycle?.settingsByDomainIds.find(
          (_settingsByDomainId) =>
            _settingsByDomainId.domainId === result.domainId,
        )?.minScore || 0;
      result.pass = result.score >= result.minScore;
    });
    return mainDomainScoreResults;
  }

  isCorrectAnswer(answer: Answer) {
    if (!answer) return false;
    if (answer.scoring.adjudicator.answerStatus === AnswerStatus.Correct)
      return true;
    else if (answer.scoring.adjudicator.answerStatus === AnswerStatus.InCorrect)
      return false;
    else {
      return answer.scoring.firstScorer.answerStatus === AnswerStatus.Correct;
    }
  }

  // async getExcel(query: MongoQuery<any>) {
  //   const simDistributions =
  //     await this.simDistributionRepository.findWithoutPagination(query);
  //   const excelData = [] as any[];
  //   const data = simDistributions
  //     .filter((_simDistribution) => {
  //       let f = true;
  //       if (query?.options?.fields?.simulationIds) {
  //         if (
  //           !query.options.fields.simulationIds.includes(
  //             _simDistribution.userBaseline.simulationId.toString(),
  //           )
  //         )
  //           f = false;
  //       }
  //       if (query?.options?.fields?.simStatuses) {
  //         if (
  //           [
  //             UserSimulationStatus.Scoring,
  //             UserSimulationStatus.Adjudicating,
  //             UserSimulationStatus.Review,
  //             UserSimulationStatus.Published,
  //             UserSimulationStatus.Exported,
  //             UserSimulationStatus.Distributed,
  //           ].includes(_simDistribution.userBaseline.status)
  //         ) {
  //           if (
  //             !query.options.fields.simStatuses.includes(
  //               UserSimulationStatus.Complete,
  //             )
  //           ) {
  //             f = false;
  //           }
  //         } else {
  //           if (
  //             !query.options.fields.simStatuses.includes(
  //               _simDistribution.userBaseline.status,
  //             )
  //           ) {
  //             f = false;
  //           }
  //         }
  //       }
  //       if (query?.options?.fields?.resultStages) {
  //         if (
  //           !query.options.fields.resultStages.includes(
  //             _simDistribution.userBaseline.status,
  //           )
  //         )
  //           f = false;
  //       }
  //       return f;
  //     })
  //     .map((simDistribution) => {
  //       const clientUnit = simDistribution.clientUnit as ClientUnit;
  //       const user = simDistribution.user as User;
  //       const userBaseline = simDistribution.userBaseline as UserSimulation;
  //       const userBaselineSimulation = simDistribution.userBaseline
  //         .simulation as Simulation;
  //       const userFollowups = simDistribution.userFollowups as UserSimulation[];
  //       const assessmentType = simDistribution.assessmentType as AssessmentType;
  //       const assessmentCycle =
  //         simDistribution.assessmentCycle as AssessmentCycle;

  //       const simulationType = userBaseline.simulationType;
  //       const client = clientUnit.name;
  //       const lastName = user.profile.lastName;
  //       const firstName = user.profile.firstName;
  //       const simulation = userBaselineSimulation.name;
  //       const allocatedTime = userBaseline.testTime;
  //       const timeSpent = userBaseline.usageTime;
  //       const attemptCount = userBaseline.attemptCount;
  //       const lastLogin = user.status.signinAt;
  //       const dateAssigned = userBaseline.assignedAt;
  //       const submittedDate = userBaseline.submittedAt;
  //       const publishedDate = userBaseline.publishedAt;
  //       const simStatus = userBaseline.status;
  //       const resultStage = userBaseline.status;

  //       excelData.push({
  //         simulationType,
  //         client,
  //         lastName,
  //         firstName,
  //         simulation,
  //         allocatedTime: getFormattedTime(allocatedTime),
  //         timeSpent: getFormattedTime(timeSpent),
  //         attemptCount,
  //         lastLogin: lastLogin
  //           ? moment(lastLogin).format('DD-MMM-YYYY hh:mm:ss')
  //           : '',
  //         dateAssigned: dateAssigned
  //           ? moment(dateAssigned).format('DD-MMM-YYYY hh:mm:ss')
  //           : '',
  //         submittedDate: submittedDate
  //           ? moment(submittedDate).format('DD-MMM-YYYY hh:mm:ss')
  //           : '',
  //         publishedDate: publishedDate
  //           ? moment(publishedDate).format('DD-MMM-YYYY hh:mm:ss')
  //           : '',
  //         simStatus: [
  //           UserSimulationStatus.Assigned,
  //           UserSimulationStatus.InProgress,
  //           UserSimulationStatus.Complete,
  //         ].includes(simStatus)
  //           ? simStatus
  //           : '',
  //         resultStage: [
  //           UserSimulationStatus.Scoring,
  //           UserSimulationStatus.Adjudicating,
  //           UserSimulationStatus.Review,
  //           UserSimulationStatus.Published,
  //           UserSimulationStatus.Exported,
  //           UserSimulationStatus.Distributed,
  //         ].includes(resultStage)
  //           ? resultStage
  //           : '',
  //       });

  //       userFollowups.forEach((_userFollowup) => {
  //         const simulationType = _userFollowup.simulationType;
  //         const client = '';
  //         const lastName = '';
  //         const firstName = '';
  //         const simulation = (_userFollowup as any).simulation.name;
  //         const allocatedTime = _userFollowup.testTime;
  //         const timeSpent = _userFollowup.usageTime;
  //         const attemptCount = _userFollowup.attemptCount;
  //         const lastLogin = '';
  //         const dateAssigned = _userFollowup.assignedAt;
  //         const submittedDate = _userFollowup.submittedAt;
  //         const publishedDate = _userFollowup.publishedAt;
  //         const simStatus = _userFollowup.status;
  //         const resultStage = _userFollowup.status;

  //         if (simStatus === UserSimulationStatus.HasNotAssigned) return;
  //         excelData.push({
  //           simulationType,
  //           client,
  //           lastName,
  //           firstName,
  //           simulation,
  //           allocatedTime: getFormattedTime(allocatedTime),
  //           timeSpent: getFormattedTime(timeSpent),
  //           attemptCount,
  //           lastLogin: lastLogin
  //             ? moment(lastLogin).format('DD-MMM-YYYY hh:mm:ss')
  //             : '',
  //           dateAssigned: dateAssigned
  //             ? moment(dateAssigned).format('DD-MMM-YYYY hh:mm:ss')
  //             : '',
  //           submittedDate: submittedDate
  //             ? moment(submittedDate).format('DD-MMM-YYYY hh:mm:ss')
  //             : '',
  //           publishedDate: publishedDate
  //             ? moment(publishedDate).format('DD-MMM-YYYY hh:mm:ss')
  //             : '',
  //           simStatus: [
  //             UserSimulationStatus.HasNotAssigned,
  //             UserSimulationStatus.Assigned,
  //             UserSimulationStatus.InProgress,
  //             UserSimulationStatus.Complete,
  //           ].includes(simStatus)
  //             ? simStatus
  //             : '',
  //           resultStage: [
  //             UserSimulationStatus.Scoring,
  //             UserSimulationStatus.Adjudicating,
  //             UserSimulationStatus.Review,
  //             UserSimulationStatus.Published,
  //             UserSimulationStatus.Exported,
  //             UserSimulationStatus.Distributed,
  //           ].includes(resultStage)
  //             ? resultStage
  //             : '',
  //         });
  //       });
  //     });

  //   const wb = xlsx.utils.book_new();
  //   const ws = xlsx.utils.json_to_sheet(excelData);
  //   xlsx.utils.book_append_sheet(wb, ws, 'userStatus');
  //   const ret = xlsx.writeXLSX(wb, { type: 'binary' });

  //   return ret;
  // }
}
