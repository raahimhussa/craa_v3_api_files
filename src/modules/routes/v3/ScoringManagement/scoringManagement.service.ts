import {
  AnswerStatus,
  AssessmentStatus,
  SimulationType,
  UserSimulationStatus,
  UserTrainingStatus,
} from 'src/utils/status';
import {
  MonitoringNotesDto,
  PreviewInfoDto,
  ProcessIssuesDto,
  ResultSummaryDto,
  ScoreByDomainDto,
  ScoreBySeverityDto,
  UnidentifiedFindingsDto,
} from './preview.dto';

import { Answer } from '../../v2/answers/schemas/answer.schema';
import AnswersService from '../../v2/answers/answers.service';
import AssessmentsService from '../../v2/assessments/assessments.service';
import { BusinessCycle } from '../../v1/clientUnits/schemas/clientUnit.schema';
import { ClientUnitsService } from '../../v1/clientUnits/clientUnits.service';
import { Domain } from '../../v2/domains/schemas/domain.schema';
import DomainsService from '../../v2/domains/domains.service';
import { Finding } from '../../v2/findings/schemas/finding.schema';
import FindingsService from '../../v2/findings/findings.service';
import { Injectable } from '@nestjs/common';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';
import ScoringManagementRepository from './scoringManagement.repository';
import { UserAssessmentCyclesService } from '../../v1/userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';

@Injectable()
export default class ScoringManagementService {
  constructor(
    private readonly scoringManagementRepository: ScoringManagementRepository,

    private readonly userSimulationsService: UserSimulationsService,
    private readonly clientUnitService: ClientUnitsService,
    private readonly userAssessmentCyclesService: UserAssessmentCyclesService,
    private readonly domainsService: DomainsService,
    private readonly userTrainingsService: UserTrainingsService,
    private readonly assessmentsService: AssessmentsService,
    private readonly answersService: AnswersService,
    private readonly findingsService: FindingsService,
  ) {}

  async find(query: MongoQuery<any>) {
    try {
      const assessments = await this.scoringManagementRepository.find(query);
      const ret = assessments.map(async (_assessment) => {
        const userSimulation = _assessment.userSimulation as UserSimulation;
        if (!userSimulation) return null;
        const getFilter = () => {
          if (userSimulation.simulationType === SimulationType.Baseline) {
            return {
              userBaselineId: userSimulation._id.toString(),
              isDeleted: false,
            };
          } else if (
            userSimulation.simulationType === SimulationType.Followup
          ) {
            return {
              userFollowupIds: userSimulation._id.toString(),
              isDeleted: false,
            };
          }
          return {
            isDeleted: false,
          };
        };
        const userAssessmentCycle =
          await this.userAssessmentCyclesService.findOne({
            filter: getFilter(),
          });
        const userBaselineId = userAssessmentCycle?.userBaselineId;
        const userFollowupIds = userAssessmentCycle?.userFollowupIds;
        const simulationIds = userBaselineId
          ? [userBaselineId, ...userFollowupIds]
          : [];
        const relatedAssessments = await this.assessmentsService.find({
          filter: {
            userSimulationId: { $in: simulationIds },
            isDeleted: false,
          },
        });
        const relatedSimulations = await this.userSimulationsService.find({
          filter: {
            _id: { $in: simulationIds },
            isDeleted: false,
          },
        });
        return {
          ..._assessment,
          relatedAssessments,
          relatedSimulations,
        };
      });
      const data = await Promise.all(ret);
      return data.filter((_) => _);
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async count(query: MongoQuery<any>) {
    return this.scoringManagementRepository.count(query);
  }

  async getFollowupResults(userSimulationId: string) {
    const domains = await this.getDomains();
    // 평가에 딸린 정답을 찾아온다.
    const answers = await this.getAnswerByUserSimulationId(userSimulationId);
    // 평가에 대한 유저 사이클을 가져온다.
    const userAssessmentCycle = await this.userAssessmentCyclesService.findOne({
      filter: { userFollowupIds: { $in: userSimulationId } },
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

    const scoreByDomain = this.getScoreByDomain(
      domains,
      answers,
      findings,
      businessCycle,
    );
    const scoreByMainDomain = this.getScoreByMainDomain(
      domains,
      answers,
      findings,
      businessCycle,
    );
    const identifiedScoreBySeverity = this.getIdentifiedScoreBySeverity(
      answers,
      findings,
    );
    const identifiedScoreByDomain = this.getIdentifiedScoreByDomain(
      domains,
      answers,
      findings,
    );
    const identifiedScoreByMainDomain = this.getIdentifiedScoreByMainDomain(
      domains,
      answers,
      findings,
    );
    const identifiedAnswers = this.getIdentifiedAnswers(answers);
    const notIdentifiedAnswers = this.getNotIdentifiedAnswers(answers);
    const identifiedFindings = this.getIdentifiedFindings(answers, findings);
    const notIdentifiedFindings = findings.filter(
      (_finding) =>
        !identifiedFindings.find(
          (_idfs) => _idfs?._id?.toString() === _finding?._id?.toString(),
        ),
    );

    return {
      scoreByDomain,
      scoreByMainDomain,
      identifiedScoreBySeverity,
      identifiedScoreByDomain,
      identifiedScoreByMainDomain,
      identifiedAnswers,
      notIdentifiedAnswers,
      identifiedFindings,
      notIdentifiedFindings,
    };
  }

  public async followupPreview(userSimulationId: string) {
    const {
      scoreByDomain,
      scoreByMainDomain,
      identifiedScoreBySeverity,
      identifiedScoreByDomain,
      identifiedScoreByMainDomain,
      identifiedAnswers,
      notIdentifiedAnswers,
      identifiedFindings,
      notIdentifiedFindings,
    } = await this.getFollowupResults(userSimulationId);

    const updatedUserSimulation = await this.userSimulationsService.update({
      filter: { _id: userSimulationId },
      update: {
        $set: {
          results: {
            scoreByDomain,
            scoreByMainDomain,
            identifiedScoreBySeverity,
            identifiedScoreByDomain,
            identifiedScoreByMainDomain,
            identifiedAnswers,
            notIdentifiedAnswers,
            identifiedFindings,
            notIdentifiedFindings,
          },
        },
      },
    });
    await this.userAssessmentCyclesService.renewSummary({
      filter: {
        userFollowupIds: userSimulationId,
      },
    });

    return updatedUserSimulation;
  }

  async getBaselineResults(userSimulationId: string) {
    // 평가에 딸린 정답을 찾아온다.
    const answers = await this.getAnswerByUserSimulationId(userSimulationId);
    // 평가에 대한 유저 사이클을 가져온다.
    const userAssessmentCycle = await this.userAssessmentCyclesService.findOne({
      filter: { userBaselineId: userSimulationId },
    });

    const _resultSummary =
      await this.scoringManagementRepository.getBaselineResultSummary(
        userAssessmentCycle._id.toString(),
      );
    const domains = await this.getDomains();
    const businessCycle = await this.clientUnitService.readBusinessCycle(
      _resultSummary.clientUnitId,
      _resultSummary.businessUnitId,
      _resultSummary.businessCycleId,
    );
    const findings = await this.findingsService.find({
      filter: {
        _id: {
          $in: answers.map((_answer) => _answer.findingId),
        },
      },
    });
    const scoreByDomain = this.getScoreByDomain(
      domains,
      answers,
      findings,
      businessCycle,
    );
    const scoreByMainDomain = this.getScoreByMainDomain(
      domains,
      answers,
      findings,
      businessCycle,
    );
    const identifiedScoreBySeverity = this.getIdentifiedScoreBySeverity(
      answers,
      findings,
    );
    const identifiedScoreByDomain = this.getIdentifiedScoreByDomain(
      domains,
      answers,
      findings,
    );
    const identifiedScoreByMainDomain = this.getIdentifiedScoreByMainDomain(
      domains,
      answers,
      findings,
    );
    const identifiedAnswers = this.getIdentifiedAnswers(answers);
    const notIdentifiedAnswers = this.getNotIdentifiedAnswers(answers);
    const identifiedFindings = this.getIdentifiedFindings(answers, findings);
    const notIdentifiedFindings = findings.filter(
      (_finding) =>
        !identifiedFindings.find(
          (_idfs) => _idfs?._id?.toString() === _finding?._id?.toString(),
        ),
    );

    return {
      scoreByDomain,
      scoreByMainDomain,
      identifiedScoreBySeverity,
      identifiedScoreByDomain,
      identifiedScoreByMainDomain,
      identifiedAnswers,
      notIdentifiedAnswers,
      identifiedFindings,
      notIdentifiedFindings,
    };
  }

  public async baselinePreview(userSimulationId: string) {
    try {
      const {
        scoreByDomain,
        scoreByMainDomain,
        identifiedScoreBySeverity,
        identifiedScoreByDomain,
        identifiedScoreByMainDomain,
        identifiedAnswers,
        notIdentifiedAnswers,
        identifiedFindings,
        notIdentifiedFindings,
      } = await this.getBaselineResults(userSimulationId);

      const updatedUserSimulation = await this.userSimulationsService.update({
        filter: { _id: userSimulationId },
        update: {
          $set: {
            results: {
              scoreByDomain,
              scoreByMainDomain,
              identifiedScoreBySeverity,
              identifiedScoreByDomain,
              identifiedScoreByMainDomain,
              identifiedAnswers,
              notIdentifiedAnswers,
              identifiedFindings,
              notIdentifiedFindings,
            },
          },
        },
      });
      await this.userAssessmentCyclesService.renewSummary({
        filter: {
          userBaselineId: userSimulationId,
        },
      });
      return updatedUserSimulation;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async scoring(assessmentId: string, scorerType: string) {
    try {
      if (scorerType === 'adjudicator') {
        await this.assessmentsService.update({
          filter: {
            _id: assessmentId,
          },
          update: {
            $set: {
              //FIXME - scoring management를 assessment가 아니라 userSimulation 단위로 바꿔야함
              [`${scorerType}.status`]: AssessmentStatus.Complete,
              status: AssessmentStatus.InProgress,
            },
          },
        });
      } else {
        await this.assessmentsService.update({
          filter: {
            _id: assessmentId,
          },
          update: {
            $set: { [`${scorerType}.status`]: AssessmentStatus.Complete },
          },
        });
      }

      // const assessment = await this.assessmentsService.findById(assessmentId);
      // if (
      //   assessment.firstScorer.status !== AssessmentStatus.Complete ||
      //   assessment.secondScorer.status !== AssessmentStatus.Complete
      // ) {
      //   await this.userSimulationResultsService.update({
      //     filter: {
      //       _id: assessment.userSimulationId,
      //     },
      //     update: {
      //       $set: { status: UserSimulationStatus.Scoring },
      //     },
      //   });
      // } else if (assessment.adjudicator.status !== AssessmentStatus.Complete) {
      //   await this.userSimulationResultsService.update({
      //     filter: {
      //       _id: assessment.userSimulationId,
      //     },
      //     update: {
      //       $set: { status: UserSimulationStatus.Adjudicating },
      //     },
      //   });
      // } else {
      //   await this.userSimulationResultsService.update({
      //     filter: {
      //       _id: assessment.userSimulationId,
      //     },
      //     update: {
      //       $set: { status: UserSimulationStatus.Review },
      //     },
      //   });
      // }
    } catch (e) {
      throw e;
    }
  }

  public async publish(userSimulationId: string) {
    // 계산된 결과값을 assessment에 업데이트
    try {
      const userSimulation = await this.userSimulationsService.findOne({
        filter: { _id: userSimulationId },
      });
      if (!userSimulation) return;
      if (userSimulation.simulationType === SimulationType.Baseline) {
        const {
          scoreByDomain,
          scoreByMainDomain,
          identifiedScoreBySeverity,
          identifiedScoreByDomain,
          identifiedScoreByMainDomain,
          identifiedAnswers,
          notIdentifiedAnswers,
          identifiedFindings,
        } = await this.getBaselineResults(userSimulationId);
        await this.userSimulationsService.update({
          filter: { _id: userSimulationId },
          update: {
            $set: {
              status: UserSimulationStatus.Published,
              results: {
                scoreByDomain,
                scoreByMainDomain,
                identifiedScoreBySeverity,
                identifiedScoreByDomain,
                identifiedScoreByMainDomain,
                identifiedAnswers,
                notIdentifiedAnswers,
                identifiedFindings,
              },
              publishedAt: new Date(),
            },
          },
        });
        await this.assessmentsService.update({
          filter: { userSimulationId },
          update: {
            $set: {
              status: AssessmentStatus.Complete,
            },
          },
        });
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userBaselineId: userSimulationId,
          },
        });
        await this.userAssessmentCyclesService;
        return true;
      }
      if (userSimulation.simulationType === SimulationType.Followup) {
        const {
          scoreByDomain,
          scoreByMainDomain,
          identifiedScoreBySeverity,
          identifiedScoreByDomain,
          identifiedScoreByMainDomain,
          identifiedAnswers,
          notIdentifiedAnswers,
          identifiedFindings,
        } = await this.getFollowupResults(userSimulationId);
        await this.userSimulationsService.update({
          filter: { _id: userSimulationId },
          update: {
            $set: {
              status: UserSimulationStatus.Published,
              results: {
                scoreByDomain,
                scoreByMainDomain,
                identifiedScoreBySeverity,
                identifiedScoreByDomain,
                identifiedScoreByMainDomain,
                identifiedAnswers,
                notIdentifiedAnswers,
                identifiedFindings,
              },
              publishedAt: new Date(),
            },
          },
        });
        await this.assessmentsService.update({
          filter: { userSimulationId },
          update: {
            $set: {
              status: AssessmentStatus.Complete,
            },
          },
        });
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userFollowupIds: userSimulationId,
          },
        });
        return true;
      }
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async retract(userSimulationId: string) {
    try {
      //NOTE - retract: change userSimulation.status publish or distributed to completed + assessment.status to inprogress
      await this.userSimulationsService.update({
        filter: { _id: userSimulationId },
        update: {
          $set: {
            status: UserSimulationStatus.Scoring,
          },
        },
      });
      await this.assessmentsService.update({
        filter: { userSimulationId },
        update: {
          $set: {
            status: AssessmentStatus.InProgress,
          },
        },
      });
      await this.userAssessmentCyclesService.renewSummary({
        filter: {
          $or: [
            { userFollowupIds: userSimulationId },
            { userBaselineId: userSimulationId },
          ],
        },
      });
    } catch (e) {
      throw e;
    }
  }

  getScoreByDomain(
    domains: Domain[],
    answers: Answer[],
    findings: Finding[],
    businessCycle: BusinessCycle,
  ) {
    const domainScoreResults = domains.map((_domain) => ({
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
      const scoreByDomainResult = domainScoreResults.find(
        (_identifiedScoreByDomainResults) =>
          _identifiedScoreByDomainResults.domainId === domain._id.toString(),
      );
      isIdentified
        ? scoreByDomainResult.correctAnswersCount++
        : scoreByDomainResult.incorrectAnswersCount++;
      scoreByDomainResult.allAnswersCount++;
    });
    domainScoreResults.forEach((result) => {
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
    return domainScoreResults;
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

  getIdentifiedScoreByDomain(
    domains: Domain[],
    answers: Answer[],
    findings: Finding[],
  ) {
    const identifiedScoreByDomainResults = domains.map((_domain) => ({
      domainId: _domain._id.toString(),
      identifiedFindings: [],
      notIdentifiedFindings: [],
      allFindings: [],
    }));
    findings.forEach((_finding) => {
      const answer = answers.find(
        (_answer) => _answer.findingId === _finding._id.toString(),
      );
      const domain = domains.find(
        (_domain) => _domain._id.toString() === _finding.domainId,
      );
      //NOTE - correct === identified
      const isIdentified = answer ? this.isCorrectAnswer(answer) : false;
      const identifiedScoreByDomainResult = identifiedScoreByDomainResults.find(
        (_identifiedScoreByDomainResult) =>
          _identifiedScoreByDomainResult.domainId === domain._id.toString(),
      );
      isIdentified
        ? identifiedScoreByDomainResult?.identifiedFindings.push(
            _finding._id.toString(),
          )
        : identifiedScoreByDomainResult?.notIdentifiedFindings.push(
            _finding._id.toString(),
          );
      identifiedScoreByDomainResult?.allFindings.push(_finding._id.toString());
    });
    return identifiedScoreByDomainResults;
  }

  getIdentifiedScoreByMainDomain(
    domains: Domain[],
    answers: Answer[],
    findings: Finding[],
  ) {
    const identifiedScoreByMainDomainResults = domains
      .filter((_domain) => _domain.depth === 0)
      .map((_domain) => ({
        domainId: _domain._id.toString(),
        identifiedFindings: [],
        notIdentifiedFindings: [],
        allFindings: [],
      }));
    findings.forEach((_finding) => {
      const answer = answers.find(
        (_answer) => _answer.findingId === _finding._id.toString(),
      );
      const domain = domains.find(
        (_domain) => _domain._id.toString() === _finding.domainId,
      );
      //NOTE - correct === identified
      const isIdentified = answer ? this.isCorrectAnswer(answer) : false;
      const identifiedScoreByMainDomainResult =
        identifiedScoreByMainDomainResults.find(
          (_identifiedScoreByMainDomainResults) =>
            _identifiedScoreByMainDomainResults.domainId ===
              domain._id.toString() ||
            _identifiedScoreByMainDomainResults.domainId === domain.parentId,
        );
      isIdentified
        ? identifiedScoreByMainDomainResult?.identifiedFindings.push(
            _finding._id.toString(),
          )
        : identifiedScoreByMainDomainResult?.notIdentifiedFindings.push(
            _finding._id.toString(),
          );
      identifiedScoreByMainDomainResult?.allFindings.push(
        _finding._id.toString(),
      );
    });
    return identifiedScoreByMainDomainResults;
  }

  getIdentifiedScoreBySeverity(answers: Answer[], findings: Finding[]) {
    const identifiedScoreBySeverityResults = Array(3)
      .fill(null)
      .map((_, index) => ({
        severity: index,
        identifiedFindings: [],
        notIdentifiedFindings: [],
        allFindings: [],
      }));
    findings.forEach((_finding) => {
      const answer = answers.find(
        (_answer) => _answer.findingId === _finding._id.toString(),
      );
      //NOTE - correct === identified
      const isIdentified = answer ? this.isCorrectAnswer(answer) : false;
      isIdentified
        ? identifiedScoreBySeverityResults[
            _finding.severity
          ]?.identifiedFindings.push(_finding._id.toString())
        : identifiedScoreBySeverityResults[
            _finding.severity
          ]?.notIdentifiedFindings.push(_finding._id.toString());
      identifiedScoreBySeverityResults[_finding.severity]?.allFindings.push(
        _finding._id.toString(),
      );
    });
    return identifiedScoreBySeverityResults;
  }

  getIdentifiedAnswers(answers: Answer[]) {
    return answers.filter((_answer) => this.isCorrectAnswer(_answer));
  }
  getNotIdentifiedAnswers(answers: Answer[]) {
    return answers.filter((_answer) => !this.isCorrectAnswer(_answer));
  }

  getIdentifiedFindings(answers: Answer[], findings: Finding[]) {
    return findings.filter((_finding) => {
      const answer = answers.find(
        (_answer) => _answer.findingId === _finding._id.toString(),
      );
      return this.isCorrectAnswer(answer);
    });
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

  async getAnswerByUserSimulationId(userSimulationId: string) {
    return this.answersService.find({ filter: { userSimulationId } });
  }

  async getFindingById(findingId: string) {
    return this.findingsService.findOne({ filter: { _id: findingId } });
  }

  async getDomains() {
    return this.domainsService.find({ filter: {} });
  }
}
