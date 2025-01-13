import * as moment from 'moment';
import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Result,
  UserSimulation,
} from '../../v2/userSimulations/schemas/userSimulation.schema';
import {
  SimulationType,
  UserSimulationStatus,
  UserTrainingStatus,
} from 'src/utils/status';

import AssessmentTypesService from '../../v1/assessmentTypes/assessmentTypes.service';
import AssessmentsService from '../../v2/assessments/assessments.service';
import { BusinessCycle } from '../../v1/clientUnits/schemas/clientUnit.schema';
import { ClientUnitsService } from '../../v1/clientUnits/clientUnits.service';
import { CountriesService } from '../../v1/countries/countries.service';
import { Country } from '../../v1/countries/schemas/countries.schema';
import DataDumpRepository from './dataDump.repository';
import { Domain } from '../../v2/domains/schemas/domain.schema';
import DomainsRepository from '../../v2/domains/domains.repository';
import FindingsRepository from '../../v2/findings/findings.repository';
import FindingsService from '../../v2/findings/findings.service';
import FoldersService from '../../v2/folders/folders.service';
import SimDocsService from '../../v1/simDocs/simDocs.service';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import SimulationMappersService from '../simulationMapper/simulationMappers.service';
import { SimulationsService } from '../../v1/simulations/simulations.service';
import { UserAssessmentCycle } from '../../v1/userAssessmentCycles/schemas/userAssessmentCycle.schema';
import UserAssessmentCycleSummariesRepository from '../../v1/userAssessmentCycles/userAssessmentCycleSummaries.repository';
import { UserAssessmentCycleSummary } from '../../v1/userAssessmentCycles/schemas/userAssessmentCycleSummary.schema';
import UserAssessmentCyclesRepository from '../../v1/userAssessmentCycles/userAssessmentCycles.repository';
import UserSimulationsRepository from '../../v2/userSimulations/userSimulations.repository';
import { UserTraining } from '../../v2/userTrainings/schemas/userTraining.schema';
import UserTrainingsRepository from '../../v2/userTrainings/userTrainings.repository';
import UsersRepository from '../../v1/users/users.repository';
import { Workbook } from 'exceljs';
import { getFormattedTime } from 'src/utils/utils';
import { getGrade } from 'src/utils/grade';
import mongoose from 'mongoose';

@Injectable()
export default class DataDumpsService {
  constructor(
    private readonly dataDumpRepository: DataDumpRepository,
    private readonly findingsService: FindingsService,
    private readonly usersRepository: UsersRepository,
    private readonly userAssessmentCycleRepository: UserAssessmentCyclesRepository,
    private readonly userAssessmentCycleSummaryRepository: UserAssessmentCycleSummariesRepository,
    private readonly userSimulationsRepository: UserSimulationsRepository,
    private readonly domainsRepository: DomainsRepository,
    private readonly userTrainingsRepository: UserTrainingsRepository,
    private readonly clientUnitsService: ClientUnitsService,
    private readonly countriesService: CountriesService,
    private readonly assessmentTypesService: AssessmentTypesService,
    private readonly simulationsService: SimulationsService,
    private readonly simDocsService: SimDocsService,
    private readonly foldersService: FoldersService,
    private readonly simulationMappersService: SimulationMappersService,
    private readonly assessmentsService: AssessmentsService,
    private readonly userAssessmentCycleSummariesRepository: UserAssessmentCycleSummariesRepository,
  ) {}

  getSimulationAvg = async (simulationId: string, clientUnitId: string) => {
    const userSimulations: UserSimulation[] =
      await this.userSimulationsRepository.findWithoutAggregation({
        filter: { simulationId: simulationId },
        projection: {
          'results.scoreByDomain': 1,
          'user.profile.clientUnitId': 1,
        },
      });
    const arr = [];
    //@ts-ignore
    userSimulations
      ?.filter((el: any) => el.user?.profile?.clientUnitId === clientUnitId)
      ?.map((userSimulation) => {
        if (userSimulation.results !== undefined) {
          let total = 0;
          userSimulation.results?.scoreByDomain?.map((result: any) => {
            total += result.score;
          });
          arr.push(total / userSimulation.results?.scoreByDomain?.length);
        }
      });
    return arr;
  };

  getDomainAvg = async (simulationId: string, clientUnitId: string) => {
    let filter: {};
    if (simulationId === 'Followup') {
      filter = {
        simulationType: simulationId,
      };
    } else {
      filter = {
        simulationId: simulationId,
      };
    }
    const userSimulations: UserSimulation[] =
      await this.userSimulationsRepository.findWithoutAggregation({
        filter: { ...filter },
        projection: {
          'results.scoreByMainDomain': 1,
          'user.profile.clientUnitId': 1,
        },
      });
    const obj = {};
    let total = 0;
    userSimulations
      ?.filter((el: any) => el.user?.profile?.clientUnitId === clientUnitId)
      ?.map((userSimulation) => {
        if (userSimulation.results !== undefined) {
          userSimulation.results.scoreByMainDomain?.map((domain) => {
            if (obj[domain.domainId] === undefined) {
              obj[domain.domainId] = 0;
            }
            obj[domain.domainId] += domain.score;
          });
          total += 1;
        }
      });
    Object.keys(obj).map((key) => {
      obj[key] = obj[key] / total;
    });
    return obj;
  };

  getUserCardData = async (userId: string) => {
    const userAssessmentCycles: UserAssessmentCycleSummary[] =
      await this.userAssessmentCycleSummariesRepository.find({
        filter: { 'userBaseline.userId': userId },
        projection: {
          userBaseline: 1,
          createdAt: 1,
          userTrainings: 1,
          userFollowups: 1,
          user: 1,
        },
      });

    const ret = userAssessmentCycles
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      .map(async (_userAssessmentCycle) => {
        const userBaseline = _userAssessmentCycle.userBaseline;
        const userTrainings = _userAssessmentCycle.userTrainings;
        const userFollowups = _userAssessmentCycle.userFollowups;
        const domains = await this.domainsRepository.find({
          filter: {
            depth: 0,
            followupNumber: { $gt: 0 },
          },
        });
        const user = _userAssessmentCycle.user;
        const byDomains = domains.map((_domain) => {
          const userFollowup = userFollowups.find(
            (_userFollowup) =>
              _userFollowup.domainId === _domain._id.toString(),
          );
          const userTraining = userTrainings.find((_userTraining) => {
            return _userTraining.domainId === _domain._id.toString();
          });
          const userBaselineResultByMainDomain =
            userBaseline?.results?.scoreByMainDomain?.find(
              (_scoreByMainDomain) =>
                _scoreByMainDomain.domainId === _domain._id.toString(),
            );
          const userFollowupResultByMainDomain =
            userFollowup?.results?.scoreByMainDomain?.find(
              (_scoreByMainDomain) =>
                _scoreByMainDomain.domainId === _domain._id.toString(),
            );
          return {
            domain: _domain,
            userTraining,
            userFollowup,
            userBaselineResultByMainDomain,
            userFollowupResultByMainDomain,
          };
        });

        return {
          user,
          userBaseline,
          userTrainings,
          userFollowups,
          domains,
          byDomains,
        };
      });
    return Promise.all(ret);
  };

  getBaselineDataDump = async (
    assessmentCycleId: string,
    assessmentTypeId: string,
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
  ) => {
    try {
      const userAssessmentCycleSummaries: UserAssessmentCycleSummary[] = (
        await this.userAssessmentCycleSummaryRepository.find({
          filter: {
            assessmentCycleId,
            assessmentTypeId,
            clientUnitId,
            businessUnitId,
            businessCycleId,
            'user.role.priority': 6,
            'userBaseline.status': {
              $in: [
                UserSimulationStatus.Distributed,
                // UserSimulationStatus.Exported,
                // UserSimulationStatus.Published,
              ],
            },
            // 'userBaseline.unusualBehavior': { $ne: true },
          },
        })
      ).filter(
        (_uac) =>
          !_uac?.userBaseline?.simulation.name
            .toLowerCase()
            .includes('prehire'),
      );

      // const userBaselineIds = userAssessmentCycles.map(
      //   (_userAssessmentCycle) => _userAssessmentCycle.userBaselineId,
      // );
      const userSimulations = userAssessmentCycleSummaries
        .map(
          (_userAssessmentCycleSummary) =>
            _userAssessmentCycleSummary.userBaseline,
        )
        .filter((_) => _);
      // await this.userSimulationsRepository.find({
      //   filter: {
      //     _id: { $in: userBaselineIds },
      //     status: {
      //       $in: [
      //         UserSimulationStatus.Scoring,
      //         UserSimulationStatus.Adjudicating,
      //         UserSimulationStatus.Published,
      //         UserSimulationStatus.Distributed,
      //         UserSimulationStatus.Reviewed,
      //         UserSimulationStatus.Exported,
      //       ],
      //     },
      //   },
      // });
      const clientUnit = await this.clientUnitsService.readClient(clientUnitId);
      const businessUnit = clientUnit.businessUnits.find(
        (_bu) => _bu._id === businessUnitId,
      );
      const businessCycle = businessUnit.businessCycles.find(
        (_bc) => _bc._id === businessCycleId,
      );
      const domains = await this.domainsRepository.find({
        filter: { isDeleted: false },
      });
      const countries = (await this.countriesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as Country[];
      const scoresBySeverity = this.calculateScoresBySeverity(userSimulations);
      const scoresByDomain = this.calculateScoresByDomain(
        userSimulations,
        domains,
      );
      const scoresByMainDomain = this.calculateScoresByMainDomain(
        userSimulations,
        domains,
      );
      const totalTimesToComplete =
        this.calculateTotalTimesToComplete(userSimulations);
      const identifiedFindings = await this.calculateIdentifiedFindings(
        assessmentTypeId,
        userSimulations,
      );
      const pills = this.calculatePills(userSimulations);
      const notIdentifiedFindingsByUser =
        await this.calculateIdentifiedFindingsByUser(
          assessmentTypeId,
          userSimulations,
          domains,
          '',
          SimulationType.Baseline,
        );
      const vendor = clientUnit.name;
      const bu = businessUnit.name;
      const overallsByUser = await this.baselineCalculateOverallsByUser(
        userAssessmentCycleSummaries,
        businessCycle,
        identifiedFindings,
        domains,
        countries,
        vendor,
        bu,
      );
      const userIds = userSimulations.map(
        (_userSimulation) => _userSimulation.userId,
      );
      const users = await this.usersRepository.find({
        filter: { _id: { $in: userIds } },
        options: { multi: true },
      });

      return {
        scoresBySeverity,
        scoresByDomain,
        scoresByMainDomain,
        totalTimesToComplete,
        pills,
        identifiedFindings,
        notIdentifiedFindingsByUser,
        overallsByUser,
        userIds,
        users,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  getFollowupDataDump = async (
    assessmentCycleId: string,
    assessmentTypeId: string,
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
    domainId: string,
  ) => {
    try {
      const userAssessmentCycleSummaries: UserAssessmentCycleSummary[] = (
        await this.userAssessmentCycleSummaryRepository.find({
          filter: {
            assessmentCycleId,
            assessmentTypeId,
            clientUnitId,
            businessUnitId,
            businessCycleId,
          },
        })
      ).filter(
        (_uac) =>
          _uac?.user?.role?.priority === 6 &&
          // !_uac?.user?.isDeleted &&
          !_uac?.userBaseline?.simulation.name
            .toLowerCase()
            .includes('prehire'),
      );

      const userSimulations = [];
      userAssessmentCycleSummaries.forEach((_userAssessmentCycle) => {
        _userAssessmentCycle.userFollowups.forEach((_userFollowup) => {
          if (
            domainId === _userFollowup.domainId &&
            (_userFollowup.status === UserSimulationStatus.Distributed ||
              _userFollowup.status === UserSimulationStatus.Exported ||
              _userFollowup.status === UserSimulationStatus.Published)
          ) {
            userSimulations.push(_userFollowup);
          }
        });
      });
      const clientUnit = await this.clientUnitsService.readClient(clientUnitId);
      const businessUnit = clientUnit.businessUnits.find(
        (_bu) => _bu._id === businessUnitId,
      );
      const businessCycle = businessUnit.businessCycles.find(
        (_bc) => _bc._id === businessCycleId,
      );
      const domains = await this.domainsRepository.find({
        filter: { isDeleted: false },
      });
      const countries = (await this.countriesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as Country[];
      const scoresBySeverity = this.calculateScoresBySeverity(userSimulations);
      const scoresByDomain = this.calculateScoresByDomain(
        userSimulations,
        domains,
      );
      const scoresByMainDomain = this.calculateScoresByMainDomain(
        userSimulations,
        domains,
      );
      const totalTimesToComplete =
        this.calculateTotalTimesToComplete(userSimulations);
      const pills = this.calculatePills(userSimulations);
      const identifiedFindings = await this.calculateIdentifiedFindings(
        assessmentTypeId,
        userSimulations,
      );
      const notIdentifiedFindingsByUser =
        await this.calculateIdentifiedFindingsByUser(
          assessmentTypeId,
          userSimulations,
          domains,
          domainId,
          SimulationType.Followup,
        );
      const vendor = clientUnit.name;
      const bu = businessUnit.name;
      const overallsByUser = await this.followupCalculateOverallsByUser(
        userAssessmentCycleSummaries,
        businessCycle,
        identifiedFindings,
        domains,
        countries,
        vendor,
        bu,
        domainId,
      );
      const userIds = userSimulations.map(
        (_userSimulation) => _userSimulation.userId,
      );
      const users = await this.usersRepository.find({
        filter: { _id: { $in: userIds } },
        options: { multi: true },
      });
      return {
        scoresBySeverity,
        scoresByDomain,
        scoresByMainDomain,
        totalTimesToComplete,
        pills,
        identifiedFindings,
        notIdentifiedFindingsByUser,
        overallsByUser,
        userIds,
        users,
      };
    } catch (e) {
      console.error({ e });
      throw e;
    }
  };

  calculateScoresBySeverity(userSimulations: UserSimulation[]) {
    const ret: {
      [severity: number]: {
        mean: string;
        high: string;
        low: string;
      };
    } = {};
    const tmp: {
      [severity: number]: {
        mean: number;
        high: number;
        low: number;
      };
    } = {};
    const totalScore: {
      [severity: number]: {
        score: number;
        userCount: number;
      };
    } = {
      0: {
        score: 0,
        userCount: 0,
      },
      1: {
        score: 0,
        userCount: 0,
      },
      2: {
        score: 0,
        userCount: 0,
      },
    };
    const results = userSimulations.map(
      (_userSimulation) => _userSimulation.results,
    );
    results.forEach((result) => {
      result?.identifiedScoreBySeverity.forEach(
        (_identifiedScoreBySeverity) => {
          const severity = _identifiedScoreBySeverity.severity;
          const identifiedFindingsCount =
            _identifiedScoreBySeverity.identifiedFindings.length;
          const notIdentifiedFindingsCount =
            _identifiedScoreBySeverity.notIdentifiedFindings.length;
          const allFindingsCount =
            _identifiedScoreBySeverity.allFindings.length;
          const score = identifiedFindingsCount / allFindingsCount;
          if (allFindingsCount === 0) return;
          if (!tmp[severity]) {
            tmp[severity] = { mean: score, high: score, low: score };
          } else {
            if (score > tmp[severity].high) tmp[severity].high = score;
            if (score < tmp[severity].low) tmp[severity].low = score;
          }
          totalScore[severity].score += score;
          totalScore[severity].userCount += 1;
        },
      );
    });
    Object.keys(totalScore).forEach((key) => {
      const severity = Number(key);
      const mean = totalScore[severity].score / totalScore[severity].userCount;
      if (tmp[severity]) {
        ret[severity] = { high: '', low: '', mean: '' };
        ret[severity].high = `${Math.round(tmp[severity].high * 100)} %`;
        ret[severity].low = `${Math.round(tmp[severity].low * 100)} %`;
        ret[severity].mean = `${Math.round(mean * 100)} %`;
      }
    });
    return ret;
  }
  calculateScoresByDomain(
    userSimulations: UserSimulation[],
    domains: Domain[],
  ) {
    const ret: { [domainId: string]: string } = {};
    const totalIdentified: {
      [domainId: string]: {
        identifiedCount: number;
        totalIdentifiedCount: number;
      };
    } = {};
    const results = userSimulations.map(
      (_userSimulation) => _userSimulation.results,
    );
    results.forEach((result) => {
      result?.identifiedScoreByDomain?.forEach((_identifiedScoreByDomain) => {
        const _domainId = _identifiedScoreByDomain.domainId;
        const identifiedFindingsCount =
          _identifiedScoreByDomain.identifiedFindings.filter(
            (_f) => _f.status === 'Active',
          ).length;
        const notIdentifiedFindingsCount =
          _identifiedScoreByDomain.notIdentifiedFindings.filter(
            (_f) => _f.status === 'Active',
          ).length;
        const allFindingsCount = _identifiedScoreByDomain.allFindings.filter(
          (_f) => _f.status === 'Active',
        ).length;

        if (!totalIdentified[_domainId]) {
          totalIdentified[_domainId] = {
            identifiedCount: identifiedFindingsCount,
            totalIdentifiedCount: allFindingsCount,
          };
        } else {
          totalIdentified[_domainId].identifiedCount += identifiedFindingsCount;
          totalIdentified[_domainId].totalIdentifiedCount += allFindingsCount;
        }
      });
    });
    Object.keys(totalIdentified).forEach((key) => {
      if (totalIdentified[key].totalIdentifiedCount === 0) {
        ret[key] = '-';
      } else {
        ret[key] = `${Math.round(
          (totalIdentified[key].identifiedCount * 100) /
            totalIdentified[key].totalIdentifiedCount,
        )} %`;
      }
    });
    const rows = [] as any;
    const scoresByMainDomain = ret;
    Object.keys(scoresByMainDomain).map((key, index) => {
      const row = {} as any;
      row.domainName =
        domains.find((_domain) => _domain._id.toString() === key)?.name ||
        'undefined';
      row.identifiedPercent = scoresByMainDomain[key];
      rows.push(row);
    });
    return rows;
  }
  calculateScoresByMainDomain(
    userSimulations: UserSimulation[],
    domains: Domain[],
  ) {
    const ret: { [domainId: string]: string } = {};
    const totalIdentified: {
      [domainId: string]: {
        identifiedCount: number;
        totalIdentifiedCount: number;
      };
    } = {};
    domains
      .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
      .forEach((_domain) => {
        const form = {
          identifiedCount: 0,
          totalIdentifiedCount: 0,
        };
        totalIdentified[_domain._id.toString()] = form;
      });

    userSimulations.forEach((_userSimulation) => {
      const result = _userSimulation.results;
      result?.identifiedScoreByMainDomain?.forEach(
        (_identifiedScoreByMainDomain, index) => {
          const _domainId = _identifiedScoreByMainDomain.domainId;
          const identifiedFindingsCount =
            _identifiedScoreByMainDomain.identifiedFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;
          const notIdentifiedFindingsCount =
            _identifiedScoreByMainDomain.notIdentifiedFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;
          const allFindingsCount =
            _identifiedScoreByMainDomain.allFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;

          if (!totalIdentified?.[_domainId]) {
            // totalIdentified[domainId] = {
            //   identifiedCount: identifiedFindingsCount,
            //   totalIdentifiedCount: allFindingsCount,
            // };
            return;
          } else {
            totalIdentified[_domainId].identifiedCount +=
              identifiedFindingsCount;
            totalIdentified[_domainId].totalIdentifiedCount += allFindingsCount;
          }
        },
      );
    });
    Object.keys(totalIdentified).forEach((key) => {
      if (totalIdentified[key].totalIdentifiedCount === 0) {
        ret[key] = '-';
      } else {
        ret[key] = `${Math.round(
          (totalIdentified[key].identifiedCount * 100) /
            totalIdentified[key].totalIdentifiedCount,
        )} %`;
      }
    });
    const rows = [] as any;
    const scoresByMainDomain = ret;
    Object.keys(scoresByMainDomain).map((key, index) => {
      const row = {} as any;
      row.domainId =
        domains
          .find((_domain) => _domain._id.toString() === key)
          ?._id.toString() || '000000000000000000000000';
      row.domainName =
        domains.find((_domain) => _domain._id.toString() === key)?.name ||
        'undefined';
      row.identifiedPercent = scoresByMainDomain[key];
      // ret.isCompleted = _userFollowup.status === UserSimulationStatus.Assigned ||
      // _userFollowup.status === UserSimulationStatus.InProgress,
      rows.push(row);
    });
    return rows;
  }
  _calculateScoresByMainDomain(
    userSimulations: UserSimulation[],
    domains: Domain[],
  ) {
    const rows = [] as any;

    const results = userSimulations.map(
      (_userSimulation) => _userSimulation.results,
    );
    results.forEach((result) => {
      const ret: { [domainId: string]: string } = {};
      const totalIdentified: {
        [domainId: string]: {
          identifiedCount: number;
          totalIdentifiedCount: number;
        };
      } = {};
      domains
        .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
        .forEach((_domain) => {
          const form = {
            identifiedCount: 0,
            totalIdentifiedCount: 0,
          };
          totalIdentified[_domain._id.toString()] = form;
        });
      result?.identifiedScoreByMainDomain?.forEach(
        (_identifiedScoreByMainDomain, index) => {
          const domainId = _identifiedScoreByMainDomain.domainId;
          const identifiedFindingsCount =
            _identifiedScoreByMainDomain.identifiedFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;
          const notIdentifiedFindingsCount =
            _identifiedScoreByMainDomain.notIdentifiedFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;
          const allFindingsCount =
            _identifiedScoreByMainDomain.allFindings.filter(
              (_f) => _f.status === 'Active',
            ).length;

          if (!totalIdentified[domainId]) {
            // totalIdentified[domainId] = {
            //   identifiedCount: identifiedFindingsCount,
            //   totalIdentifiedCount: allFindingsCount,
            // };
            return;
          } else {
            totalIdentified[domainId].identifiedCount +=
              identifiedFindingsCount;
            totalIdentified[domainId].totalIdentifiedCount += allFindingsCount;
          }
        },
      );
      Object.keys(totalIdentified).forEach((key) => {
        if (totalIdentified[key].totalIdentifiedCount === 0) {
          ret[key] = '-';
        } else {
          ret[key] = `${Math.round(
            (totalIdentified[key].identifiedCount * 100) /
              totalIdentified[key].totalIdentifiedCount,
          )} %`;
        }
      });
      const scoresByMainDomain = ret;
      Object.keys(scoresByMainDomain).map((key, index) => {
        const row = {} as any;
        row.domainName =
          domains.find((_domain) => _domain._id.toString() === key)?.name ||
          'undefined';
        row.identifiedPercent = scoresByMainDomain[key];
        rows.push(row);
      });
    });

    return rows;
  }
  calculateTotalTimesToComplete(userSimulations: UserSimulation[]) {
    let totalTime = 0;
    let count = 0;
    let high = null;
    let low = null;
    userSimulations.forEach((_userSimulation) => {
      if (_userSimulation.usageTime === 0) return;
      totalTime += _userSimulation.usageTime;
      count += 1;
      if (high === null) high = _userSimulation.usageTime;
      else if (_userSimulation.usageTime > high)
        high = _userSimulation.usageTime;

      if (low === null) low = _userSimulation.usageTime;
      else if (_userSimulation.usageTime < low) low = _userSimulation.usageTime;
    });
    return {
      high: getFormattedTime(high),
      low: getFormattedTime(low),
      mean: getFormattedTime(count === 0 ? 0 : totalTime / count),
    };
  }

  calculatePills(userSimulations: UserSimulation[]) {
    const studyMedication: {
      documentId: number;
      documentName: string;
      numberOfPillsPrescribed: number;
      numberOfPillsTakenBySubject: number;
      percentCompliance: number;
      total: number;
    }[] = [];
    const rescueMedication: {
      documentId: number;
      documentName: string;
      numberOfPillsTakenBySubject: number;
      total: number;
    }[] = [];
    userSimulations.forEach((_userSimulation, index) => {
      if (index === 0) {
        _userSimulation.results.studyMedication.forEach((_studyMedication) => {
          const ret = {
            documentId: _studyMedication.documentId,
            documentName: _studyMedication.documentName,
            numberOfPillsPrescribed: 0,
            numberOfPillsTakenBySubject: 0,
            percentCompliance: 0,
            total: 0,
          };
          studyMedication.push(ret);
        });
        _userSimulation.results.rescueMedication.forEach(
          (_rescueMedication) => {
            const ret = {
              documentId: _rescueMedication.documentId,
              documentName: _rescueMedication.documentName,
              numberOfPillsTakenBySubject: 0,
              percentCompliance: 0,
              total: 0,
            };
            rescueMedication.push(ret);
          },
        );
      }

      _userSimulation?.results?.studyMedication?.reduce((_acc, _cur, i) => {
        const correct =
          _cur?.numberOfPillsTakenBySubject?.correctAnswer + '' ===
          _cur?.numberOfPillsTakenBySubject?.input + '';
        if (correct) {
          studyMedication[i].numberOfPillsTakenBySubject += 1;
        }
        return correct ? _acc + 1 : _acc;
      }, 0) || 0;

      _userSimulation?.results?.studyMedication?.reduce((_acc, _cur, i) => {
        const correct =
          _cur?.numberOfPillsPrescribed?.correctAnswer + '' ===
          _cur?.numberOfPillsPrescribed?.input + '';
        if (correct) {
          studyMedication[i].numberOfPillsPrescribed += 1;
        }
        return correct ? _acc + 1 : _acc;
      }, 0) || 0;

      _userSimulation?.results?.studyMedication?.reduce((_acc, _cur, i) => {
        const correct =
          _cur?.percent?.correctAnswer + '' === _cur?.percent?.input + '';
        if (correct) {
          studyMedication[i].percentCompliance += 1;
        }
        studyMedication[i].total += 1;
        return correct ? _acc + 1 : _acc;
      }, 0) || 0;

      _userSimulation?.results?.rescueMedication?.reduce((_acc, _cur, i) => {
        const correct =
          _cur?.numberOfPillsTakenBySubject?.correctAnswer + '' ===
          _cur?.numberOfPillsTakenBySubject?.input + '';
        if (correct) {
          rescueMedication[i].numberOfPillsTakenBySubject += 1;
        }
        rescueMedication[i].total += 1;
        return correct ? _acc + 1 : _acc;
      }, 0) || 0;
    });
    const ret = studyMedication.map((_, i) => {
      return {
        documentId: studyMedication[i].documentId,
        documentName: studyMedication[i].documentName,
        numberOfPillsTakenBySubject: Math.round(
          (studyMedication[i].numberOfPillsTakenBySubject * 100) /
            studyMedication[i].total,
        ),
        numberOfPillsPrescribed: Math.round(
          (studyMedication[i].numberOfPillsPrescribed * 100) /
            studyMedication[i].total,
        ),
        percentCompliance: Math.round(
          (studyMedication[i].percentCompliance * 100) /
            studyMedication[i].total,
        ),
        rescueMedication: Math.round(
          (rescueMedication[i].numberOfPillsTakenBySubject * 100) /
            rescueMedication[i].total,
        ),
      };
    });
    return ret;
  }
  // calculatePills(results: Result[]){}
  async calculateIdentifiedFindings(
    assessmentTypeId: string,
    userSimulations: UserSimulation[],
  ) {
    const ret: {
      [findingId: string]: {
        findingId: string;
        userIds: string[];
      };
    } = {};
    const findings = await this.findingsService.find({
      filter: { status: 'Active' },
    });
    const simulations = await this.simulationsService.find({ filter: {} });
    const simulationMappers = await this.simulationMappersService.find({
      filter: {},
    });
    const allFindings = [];
    userSimulations.forEach(async (_userSimulation) => {
      const _findings = simulationMappers
        .filter((_sm) => {
          return (
            _sm.simulationId ===
            simulations.find(
              (_simulation) =>
                _simulation?._id?.toString() === _userSimulation.simulationId,
            )?.visibleId
          );
        })
        .map((_sm) => {
          return findings.find(
            (_finding) => _sm.findingId === _finding.visibleId,
          );
        });

      _findings.forEach((_finding) => _finding && allFindings.push(_finding));
    });
    allFindings.forEach((_finding) => {
      ret[_finding._id.toString()] = {
        findingId: _finding._id.toString(),
        userIds: [],
      };
    });
    userSimulations.forEach((_userSimulation) => {
      const identifiedFindings =
        _userSimulation?.results?.identifiedFindings || [];
      const userId = _userSimulation.userId;
      identifiedFindings?.forEach((_identifiedFinding) => {
        ret[_identifiedFinding._id.toString()]?.userIds?.push(userId);
      });
    });
    return ret;
  }
  async calculateIdentifiedFindingsByUser(
    assessmentTypeId: string,
    userSimulations: UserSimulation[],
    domains: Domain[],
    domainId: string,
    simulationType: SimulationType,
  ) {
    const ret: {
      [findingId: string]: {
        findingId: string;
        userIds: string[];
      };
    } = {};
    const assessmentType = await this.assessmentTypesService.findById(
      assessmentTypeId,
    );
    const simulationFilter = {
      filter: {} as any,
      options: { multi: true },
    };
    if (simulationType === SimulationType.Baseline) {
      simulationFilter.filter._id = assessmentType.baseline.simulationId;
    } else {
      simulationFilter.filter._id = {
        $in: assessmentType.followups
          .filter((_followup) => _followup.domain._id === domainId)
          .map((_followup) => _followup.simulationId),
      };
    }
    const simulations = (await this.simulationsService.find({
      ...simulationFilter,
    })) as Simulation[];

    const folderIds = [];
    // simulations.forEach((_simulation) => {
    //   _simulation.folderIds.forEach((_folderId) => {
    //     folderIds.push(_folderId);
    //   });
    // });
    // const subFolders = await this.foldersService.findByIds(folderIds);

    // const subFolderIds = subFolders?.map((folder) => folder._id) || [];

    // const totalFolderIds = [...folderIds, ...subFolderIds];

    // const simDocs = await this.simDocsService.findByFolderIds(totalFolderIds);

    // const simDocIds = simDocs.map((simDoc) => simDoc._id);

    // const findings = await this.findingsService.findBySimDocIds(simDocIds);

    const simulationVisibleIds = simulations.map((_s) => _s.visibleId);

    const simulationMappers = await this.simulationMappersService.find({
      filter: {
        simulationId: { $in: simulationVisibleIds },
      },
    });

    const findings = await this.findingsService.find({
      filter: {
        visibleId: { $in: [...simulationMappers.map((_sm) => _sm.findingId)] },
        status: 'Active',
      },
    });

    findings.forEach((_finding) => {
      ret[_finding._id.toString()] = {
        findingId: _finding._id.toString(),
        userIds: [],
      };
    });
    userSimulations.forEach((_userSimulation) => {
      const identifiedFindings =
        _userSimulation?.results?.identifiedFindings || [];
      const notIdentifiedFindings =
        _userSimulation?.results?.notIdentifiedFindings || [];
      const userId = _userSimulation.userId;
      notIdentifiedFindings?.forEach((_notIdentifiedFinding) => {
        ret[_notIdentifiedFinding._id.toString()]?.userIds.push(userId);
      });
    });
    const notIdentifiedFindings = ret;
    const userIds: string[] = userSimulations.map(
      (_userSimulation) => _userSimulation.userId,
    );
    // Object.values(notIdentifiedFindings).forEach((_notIdentifiedFinding) => {
    //   _notIdentifiedFinding.userIds.forEach((_userId) => userIds.push(_userId));
    // });
    const users = await this.usersRepository.find({
      filter: { _id: { $in: Array.from(new Set(userIds)) }, isDeleted: false },
    });
    const rows = [];
    const severities = {
      0: 'Critical',
      1: 'Major',
      2: 'Minor',
    };
    Object.keys(notIdentifiedFindings).forEach((key) => {
      const finding = findings.find((_finding) => {
        return _finding._id.toString() === notIdentifiedFindings[key].findingId;
      });
      if (!finding) return;
      const severity = finding.severity as 0 | 1 | 2;
      const row = {} as any;
      row.findingVisibleId = finding.visibleId;
      row.findingText = finding.text;
      row.severity = severities[severity];
      row.domainName =
        domains.find((_domain) => _domain._id.toString() === finding.domainId)
          ?.name || 'undefined';
      row.users = users.map((user) => {
        const isNotIdentified = notIdentifiedFindings[key].userIds.includes(
          user._id.toString(),
        );
        return isNotIdentified
          ? { userId: user._id.toString(), identified: false }
          : { userId: user._id.toString(), identified: true };
      });
      row.identifiedCount =
        userSimulations.length - notIdentifiedFindings[key].userIds.length;
      row.identifiedPercent =
        userSimulations.length === 0
          ? '0'
          : `${Math.round(
              ((userSimulations.length -
                notIdentifiedFindings[key].userIds.length) /
                userSimulations.length) *
                100,
            )} %`;
      rows.push(row);
    });
    return rows;
  }
  async baselineCalculateOverallsByUser(
    userAssessmentCycleSummaries: UserAssessmentCycleSummary[],
    businessCycle: BusinessCycle,
    identifiedFindings: {
      [domainId: string]: {
        findingId: string;
        userIds: string[];
      };
    },
    domains: Domain[],
    countries: Country[],
    vendor: string,
    bu: string,
  ) {
    const ret = {} as any;
    const userBaselines = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userBaseline,
    ) as UserSimulation[];
    const userTrainings = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userTrainings,
    ) as UserTraining[][];
    const userFollowups = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userFollowups,
    ) as UserSimulation[][];
    userBaselines.forEach((_userSimulation, index) => {
      const userAssessmentCycleSummary = userAssessmentCycleSummaries.find(
        (_uacs) => _uacs.userBaseline._id === _userSimulation._id,
      );
      if (!_userSimulation.results) return;
      const _userFollowups = userFollowups[index];
      const _userTrainings = userTrainings[index];
      const userId = _userSimulation.userId;
      const identifiedScoreByDomain =
        _userSimulation.results.identifiedScoreByDomain;
      const domainTotal = identifiedScoreByDomain
        .filter(
          (_identifiedScoreByDomain) =>
            domains.find(
              (_domain) =>
                _domain._id.toString() === _identifiedScoreByDomain.domainId,
            ).visibleId < 16,
        )
        .reduce(
          (acc, cur) => {
            return [
              acc[0] + cur.identifiedFindings.length,
              acc[1] + cur.allFindings.length,
            ];
          },
          [0, 0],
        ); // calculate as %
      // const domainTotalByFollowups = _userFollowups.map((_userFollowup) => {
      //   const identifiedScoreByDomain =
      //     _userFollowup?.results?.identifiedScoreByDomain || [];
      //   return {
      //     isComplete: !(
      //       _userFollowup.status === UserSimulationStatus.Assigned ||
      //       _userFollowup.status === UserSimulationStatus.InProgress
      //     ),
      //     domainId: _userFollowup.domainId,
      //     domainTotals: identifiedScoreByDomain.reduce(
      //       (acc, cur) => {
      //         return [
      //           acc[0] +
      //             cur.identifiedFindings.filter((_f) => _f.status === 'Active')
      //               .length,
      //           acc[1] +
      //             cur.allFindings.filter((_f) => _f.status === 'Active').length,
      //         ];
      //       },
      //       [0, 0],
      //     ),
      //   };
      // });
      const userTrainingQuizScore = _userTrainings.map((_userTraining) => {
        return {
          isComplete: !(
            _userTraining.status === UserTrainingStatus.HasNotStarted ||
            _userTraining.status === UserTrainingStatus.InProgress
          ),
          domainId: _userTraining.domainId,
          score: _userTraining.summary.quizScore,
        };
      });
      const criticalIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 0,
        );
      const majorIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 1,
        );
      const minorIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 2,
        );
      const time = 0;
      const numberOfPillsTakenBySubject = 0;
      const numberOfPillsShouldHaveBeenTakenBySubject = 0;
      const percentCompliance = 0;
      const rescueMedication = 0;
      const numberOfMonitoringNotes = 0;
      const distributedAt = _userSimulation.distributedAt;
      const reviewedSimulationResults = new Date();
      const identifiedScoreByMainDomain =
        _userSimulation.results.identifiedScoreByMainDomain;
      const mainDomains = domains.filter((_domain) =>
        [1, 2, 6, 8, 11].includes(_domain.visibleId),
      );
      const numberOfTrainingModuleAssigned =
        _userSimulation.results.scoreByMainDomain.filter((_score) =>
          mainDomains.find(
            (_domain) =>
              _domain._id.toString() === _score.domainId && !_score.pass,
          ),
        ).length;
      // followup
      const trainingModuleRemaining =
        numberOfTrainingModuleAssigned -
        _userTrainings.filter(
          (_userTraining) =>
            !(
              _userTraining.status === UserTrainingStatus.HasNotStarted ||
              _userTraining.status === UserTrainingStatus.InProgress
            ),
        ).length;
      const followupSimRemaining =
        numberOfTrainingModuleAssigned -
        _userFollowups.filter(
          (_userFollowup) =>
            _userFollowup?.status === UserSimulationStatus.Exported ||
            _userFollowup?.status === UserSimulationStatus.Published ||
            _userFollowup?.status === UserSimulationStatus.Distributed ||
            _userFollowup?.status === UserSimulationStatus.Reviewed,
        ).length;
      const allModuleCompleted =
        trainingModuleRemaining > 0 && followupSimRemaining > 0 ? true : false;
      const unusualBehavior = userAssessmentCycleSummary?.collaborated
        ? 'TRUE'
        : 'FALSE';
      const minimumEffort = userAssessmentCycleSummary?.minimumEffort
        ? 'TRUE'
        : 'FALSE';
      const grade = getGrade(
        _userSimulation,
        _userTrainings,
        _userFollowups,
        businessCycle,
      );
      ret[userId] = {
        userBaseline: _userSimulation,
        userFollowups: _userFollowups,
        identifiedScoreByDomain,
        domainTotal,
        criticalIdentified,
        majorIdentified,
        minorIdentified,
        time,
        numberOfPillsTakenBySubject,
        numberOfPillsShouldHaveBeenTakenBySubject,
        percentCompliance,
        rescueMedication,
        numberOfMonitoringNotes,
        distributedAt,
        reviewedSimulationResults,
        identifiedScoreByMainDomain,
        numberOfTrainingModuleAssigned,
        trainingModuleRemaining,
        followupSimRemaining,
        allModuleCompleted,
        unusualBehavior,
        minimumEffort,
        grade,
        // domainTotalByFollowups,
        userTrainingQuizScore,
      };
    });
    const overallsByUser = ret;
    // const userIds: string[] = [];
    // Object.values(identifiedFindings).forEach((_identifiedFindings) => {
    //   _identifiedFindings.userIds.forEach((_userId) => userIds.push(_userId));
    // });
    const users = await this.usersRepository.find({
      filter: {
        // _id: { $in: Array.from(new Set(userIds)) },
        isDeleted: false,
      },
    });
    const rows = [] as any;
    Object.keys(overallsByUser).map((key) => {
      const row = {} as any;
      const overallByUser = overallsByUser[key];
      const user = users.find((_user) => _user._id.toString() === key);
      row.userName = `${user?.profile?.firstName || ''} ${
        user?.profile?.lastName || ''
      }`;
      row.isUserActivated = user?.isActivated ? 'active' : 'inactive';
      row.id = '-';
      row.userTitle = user?.profile.title ? user.profile.title : '';
      row.countryName = countries.find(
        (_country) => _country._id.toString() === user?.profile?.countryId,
      )?.name;
      row.vendor = vendor;
      row.bu = bu;
      row.region = '';
      row.exp = user?.profile.experience ? user.profile.experience : '';
      row.clinicalExp = user?.profile.clinicalExperience
        ? user.profile.clinicalExperience
        : '';
      row.intDev = '';
      row.type = '';
      row.degree = '';
      row.certification = '';
      row.manager = '';
      row.scoreByDomain = overallByUser.identifiedScoreByDomain
        .filter(
          (_identifiedScoreByDomain) =>
            _identifiedScoreByDomain?.allFindings?.length > 0,
        )
        .map((_identifiedScoreByDomain) =>
          Math.round(
            (_identifiedScoreByDomain.identifiedFindings.length * 100) /
              _identifiedScoreByDomain.allFindings.length,
          ),
        );
      row.domainTotal =
        overallByUser.domainTotal[1] === 0
          ? 0
          : Math.round(
              (overallByUser.domainTotal[0] * 100) /
                overallByUser.domainTotal[1],
            ) + ' %';
      row.criticalIdentified =
        overallByUser.criticalIdentified.allFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.criticalIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.criticalIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.majorIdentified =
        overallByUser.majorIdentified.allFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.majorIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.majorIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.minorIdentified =
        overallByUser.minorIdentified.identifiedFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.minorIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.minorIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.time = overallByUser.time;
      row.numberOfPillsTaken = overallByUser.numberOfPillsTakenBySubject;
      row.numberOfPillsShouldTaken =
        overallByUser.numberOfPillsShouldHaveBeenTakenBySubject;
      row.compliancePercent = overallByUser.percentCompliance;
      row.rescueMedication = overallByUser.rescueMedication;
      row.numberOfMonitoringNotes = overallByUser.numberOfMonitoringNotes;
      row.distributedDate = moment(overallByUser.distributedAt).format(
        'YYYY/MMM/DD - hh:mm',
      );
      row.reviewedBaselineResult = overallByUser.reviewedBaselineResults;
      row.baselineScoreByDomain = this.calculateScoresByMainDomain(
        overallByUser.userBaseline ? [overallByUser.userBaseline] : [],
        domains,
      ).map((_row, index) => {
        const mainDomains = domains
          .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
          .sort((a, b) => a.seq - b.seq);
        const minScore = Number(
          businessCycle.settingsByDomainIds.find((setting) => {
            return setting.domainId === mainDomains[index]?._id.toString();
          })?.minScore,
        );
        const score =
          Number(_row.identifiedPercent.replace(/[^0-9]/g, '')) / 10;
        return {
          text: Math.round(score),
          assigned: true,
          passed: score < minScore ? false : true,
        };
      });
      row.numberOfTrainingModuleAssigned =
        overallByUser.numberOfTrainingModuleAssigned;
      row.followupScoreByDomain = this.calculateScoresByMainDomain(
        overallByUser.userFollowups,
        domains,
      ).map((_row, index) => {
        const userFollowup = overallByUser.userFollowups.find(
          (_userFollowup) => _userFollowup.domainId === _row.domainId,
        );
        const isCompleted =
          userFollowup?.status === UserSimulationStatus.Exported ||
          userFollowup?.status === UserSimulationStatus.Published ||
          userFollowup?.status === UserSimulationStatus.Distributed ||
          userFollowup?.status === UserSimulationStatus.Reviewed;
        const mainDomains = domains
          .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
          .sort((a, b) => a.seq - b.seq);
        const minScore = businessCycle.settingsByDomainIds.find(
          (setting) => setting.domainId === mainDomains[index]?._id.toString(),
        )?.minScore;
        const score =
          Number(_row.identifiedPercent.replace(/[^0-9]/g, '')) / 10;
        return {
          text: row.baselineScoreByDomain[index].passed
            ? row.baselineScoreByDomain[index].text
            : Math.round(score),
          isCompleted,
          assigned: row.baselineScoreByDomain[index].passed ? false : true,
          passed: score < minScore ? false : true,
        };
      });
      row.difference = Array(5)
        .fill(null)
        .map((_, index) => {
          const baselineScore =
            Number(row.baselineScoreByDomain[index].text) / 10;
          const followupScore =
            Number(row.followupScoreByDomain[index].text) / 10;
          if (row.baselineScoreByDomain[index].passed) {
            return {
              text: '-',
              passed: row.baselineScoreByDomain[index].passed,
            };
          }
          if (row.followupScoreByDomain[index].text === '-') {
            return {
              text: '-',
              passed: row.followupScoreByDomain[index].passed,
            };
          }
          return {
            text: Math.round(followupScore - baselineScore),
            passed: row.followupScoreByDomain[index].passed,
          };
        });
      row.quizScore = domains
        .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
        .map((_domain, index) => {
          const score = overallByUser.userTrainingQuizScore.find(
            (_userTrainingScore) =>
              _userTrainingScore.domainId === _domain._id.toString(),
          )?.score;
          if (
            !overallByUser.userTrainingQuizScore.find(
              (_userTrainingScore) =>
                _userTrainingScore.domainId === _domain._id.toString(),
            )?.isComplete
          ) {
            return {
              text: '-',
              assigned: row.baselineScoreByDomain[index].passed ? false : true,
            };
          }
          if (typeof score !== 'number') {
            return {
              text: '-',
              assigned: row.baselineScoreByDomain[index].passed ? false : true,
            };
          }
          return {
            text: score,
            assigned: row.baselineScoreByDomain[index].passed ? false : true,
          };
        });
      row.trainingModulesRemaining = overallByUser.trainingModuleRemaining;
      row.followupSimulationRemaining = overallByUser.followupSimRemaining;
      row.isAllModulesCompleted = overallByUser.allModuleCompleted
        ? 'TRUE'
        : 'FALSE';
      row.unusualBehavior = overallByUser.unusualBehavior ? 'TRUE' : 'FALSE';
      row.minimumEffort = overallByUser.minimumEffort;
      row.grade = overallByUser.grade;

      rows.push(row);
    });
    let headers = [
      'Name',
      'Status',
      'ID',
      'Title',
      'Country',
      'Vendor',
      'BU',
      'Region',
      'Exp',
      'Clinical Exp',
      'IntDev',
      'Type',
      'Degree',
      'Certification',
      'Manager',
    ];
    const firstUserId = Object.keys(overallsByUser)?.[0];
    overallsByUser[firstUserId]?.identifiedScoreByDomain
      ?.filter(
        (_identifiedScoreByDomain) =>
          _identifiedScoreByDomain?.allFindings?.length > 0,
      )
      ?.map(
        (_identifiedScoreByDomain) =>
          domains.find(
            (_domain) =>
              _domain._id.toString() === _identifiedScoreByDomain.domainId,
          ).name,
      )
      ?.forEach((domainName) => headers.push(domainName));
    headers = [
      ...headers,
      'Domain Total',
      'Critical % Identified',
      'Major % Identified',
      'Minor % Identified',
      'Time',
      'Number of pills taken by subject',
      'Number of pills that should have been taken by subject',
      'Percent (%) Compliance',
      'Rescue Medication',
      'Number of Monitoring Notes',
      'Date Distributed',
      'Reviewed Baseline Results',
    ];
    domains
      .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
      .forEach((_domain) => headers.push(`${_domain.name}`));
    headers.push('Number of Training Modules Assigned');
    domains
      .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
      .forEach((_domain) => headers.push(`Following - ${_domain.name}`));
    domains
      .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
      .forEach((_domain) => headers.push(`Difference - ${_domain.name}`));
    domains
      .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
      .forEach((_domain) => headers.push(`Quiz - ${_domain.name}`));
    headers = [
      ...headers,
      'Training Modules Remaining',
      'Followup Sim Remaining',
      'All Modules Completed?',
      'Unusual Behavior',
      'Minimum Effort',
      'Grade',
    ];
    return { headers, rows };
  }
  async followupCalculateOverallsByUser(
    userAssessmentCycleSummaries: UserAssessmentCycleSummary[],
    businessCycle: BusinessCycle,
    identifiedFindings: {
      [domainId: string]: {
        findingId: string;
        userIds: string[];
      };
    },
    domains: Domain[],
    countries: Country[],
    vendor: string,
    bu: string,
    domainId?: string,
  ) {
    const ret = {} as any;
    const userBaselines = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userBaseline,
    ) as UserSimulation[];
    const userTrainings = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userTrainings,
    ) as UserTraining[][];
    const userFollowups = userAssessmentCycleSummaries.map(
      (_userAssessmentCycle) => (_userAssessmentCycle as any).userFollowups,
    ) as UserSimulation[][];
    let userSimulations = [];
    if (domainId) {
      userFollowups.forEach((_userFollowups) => {
        const userFollowup = _userFollowups.find(
          (_userFollowup) => _userFollowup.domainId === domainId,
        );
        if (userFollowup) {
          userSimulations.push(userFollowup);
        }
      });
    } else {
      userSimulations = userBaselines;
    }
    userBaselines.forEach((localUserBaseline, index) => {
      const _userSimulation = domainId
        ? userFollowups[index].find(
            (_userFollowup) => _userFollowup.domainId === domainId,
          )
        : localUserBaseline;
      if (!_userSimulation?.results) return;
      const _userFollowups = userFollowups[index];
      const _userTrainings = userTrainings[index];
      const userId = _userSimulation.userId;
      const identifiedScoreByDomain =
        _userSimulation.results.identifiedScoreByDomain;
      const domainTotal = identifiedScoreByDomain
        .filter(
          (_identifiedScoreByDomain) =>
            domains.find(
              (_domain) =>
                _domain._id.toString() === _identifiedScoreByDomain.domainId,
            ).visibleId < 16,
        )
        .reduce(
          (acc, cur) => {
            return [
              acc[0] + cur.identifiedFindings.length,
              acc[1] + cur.allFindings.length,
            ];
          },
          [0, 0],
        ); // calculate as %
      // const domainTotalByFollowups = _userFollowups.map((_userFollowup) => {
      //   const identifiedScoreByDomain =
      //     _userFollowup?.results?.identifiedScoreByDomain || [];
      //   return {
      //     isComplete: !(
      //       _userFollowup.status === UserSimulationStatus.Assigned ||
      //       _userFollowup.status === UserSimulationStatus.InProgress
      //     ),
      //     domainId: _userFollowup.domainId,
      //     domainTotals: identifiedScoreByDomain.reduce(
      //       (acc, cur) => {
      //         return [
      //           acc[0] +
      //             cur.identifiedFindings.filter((_f) => _f.status === 'Active')
      //               .length,
      //           acc[1] +
      //             cur.allFindings.filter((_f) => _f.status === 'Active').length,
      //         ];
      //       },
      //       [0, 0],
      //     ),
      //   };
      // });
      const studyMedicationNumberOfPillsTakenBySubjectCorrect =
        _userSimulation?.results?.studyMedication?.reduce((_acc, _cur) => {
          const correct =
            _cur?.numberOfPillsTakenBySubject?.correctAnswer + '' ===
            _cur?.numberOfPillsTakenBySubject?.input + '';
          return correct ? _acc + 1 : _acc;
        }, 0) || 0;

      const studyMedicationNumberOfPillsPrescribedCorrect =
        _userSimulation?.results?.studyMedication?.reduce((_acc, _cur) => {
          const correct =
            _cur?.numberOfPillsPrescribed?.correctAnswer + '' ===
            _cur?.numberOfPillsPrescribed?.input + '';
          return correct ? _acc + 1 : _acc;
        }, 0) || 0;
      const percentComplianceCorrect =
        _userSimulation?.results?.studyMedication?.reduce((_acc, _cur) => {
          const correct =
            _cur?.percent?.correctAnswer + '' === _cur?.percent?.input + '';
          return correct ? _acc + 1 : _acc;
        }, 0) || 0;
      const studyMedicationTotal =
        _userSimulation.results.studyMedication.length;

      const rescueMedicationNumberOfPillsTakenBySubjectCorrect =
        _userSimulation?.results?.rescueMedication?.reduce((_acc, _cur) => {
          const correct =
            _cur?.numberOfPillsTakenBySubject?.correctAnswer + '' ===
            _cur?.numberOfPillsTakenBySubject?.input + '';
          return correct ? _acc + 1 : _acc;
        }, 0) || 0;
      const rescueMedicationTotal =
        _userSimulation.results.rescueMedication.length;

      const numberOfPillsPrescribedCorrect =
        studyMedicationNumberOfPillsPrescribedCorrect;
      const numberOfPillsTakenBySubjectCorrect =
        studyMedicationNumberOfPillsTakenBySubjectCorrect;
      const userTrainingQuizScore = _userTrainings.map((_userTraining) => {
        return {
          isComplete: !(
            _userTraining.status === UserTrainingStatus.HasNotStarted ||
            _userTraining.status === UserTrainingStatus.InProgress
          ),
          domainId: _userTraining.domainId,
          score: _userTraining.summary.quizScore,
        };
      });
      const criticalIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 0,
        );
      const majorIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 1,
        );
      const minorIdentified =
        _userSimulation.results.identifiedScoreBySeverity.find(
          (_identifiedScoreBySeverity) =>
            _identifiedScoreBySeverity.severity === 2,
        );
      const time = 0;
      const numberOfPillsTakenBySubject =
        studyMedicationTotal === 0
          ? 0
          : numberOfPillsTakenBySubjectCorrect / studyMedicationTotal;
      const numberOfPillsShouldHaveBeenTakenBySubject =
        studyMedicationTotal === 0
          ? 0
          : numberOfPillsPrescribedCorrect / studyMedicationTotal;
      const percentCompliance =
        studyMedicationTotal === 0
          ? 0
          : percentComplianceCorrect / studyMedicationTotal;
      const rescueMedication =
        rescueMedicationTotal === 0
          ? 0
          : rescueMedicationNumberOfPillsTakenBySubjectCorrect /
            rescueMedicationTotal;
      const numberOfMonitoringNotes = 0;
      const distributedAt = _userSimulation.distributedAt;
      const reviewedSimulationResults = new Date();
      const identifiedScoreByMainDomain =
        _userSimulation.results.identifiedScoreByMainDomain;
      const numberOfTrainingModuleAssigned =
        _userSimulation.results.scoreByMainDomain.filter(
          (_score) => !_score.pass && _score.name !== 'IRB/IEC Reporting',
        ).length;
      // followup
      const trainingModuleRemaining =
        numberOfTrainingModuleAssigned -
        _userTrainings.filter(
          (_userTraining) =>
            !(
              _userTraining.status === UserTrainingStatus.HasNotStarted ||
              _userTraining.status === UserTrainingStatus.InProgress
            ),
        ).length;
      const followupSimRemaining =
        numberOfTrainingModuleAssigned -
        _userFollowups.filter(
          (_userFollowup) =>
            _userFollowup?.status === UserSimulationStatus.Exported ||
            _userFollowup?.status === UserSimulationStatus.Published ||
            _userFollowup?.status === UserSimulationStatus.Distributed ||
            _userFollowup?.status === UserSimulationStatus.Reviewed,
        ).length;
      const allModuleCompleted =
        trainingModuleRemaining > 0 && followupSimRemaining > 0 ? true : false;
      const unusualBehavior = _userSimulation?.unusualBehavior
        ? 'TRUE'
        : 'FALSE';
      const minimumEffort = _userSimulation?.minimumEffort ? 'TRUE' : 'FALSE';
      const grade = getGrade(
        _userSimulation,
        _userTrainings,
        _userFollowups,
        businessCycle,
      );
      ret[userId] = {
        userBaseline: _userSimulation,
        userFollowups: _userFollowups,
        identifiedScoreByDomain,
        domainTotal,
        criticalIdentified,
        majorIdentified,
        minorIdentified,
        time,
        numberOfPillsTakenBySubject,
        numberOfPillsShouldHaveBeenTakenBySubject,
        percentCompliance,
        rescueMedication,
        numberOfMonitoringNotes,
        distributedAt,
        reviewedSimulationResults,
        identifiedScoreByMainDomain,
        numberOfTrainingModuleAssigned,
        trainingModuleRemaining,
        followupSimRemaining,
        allModuleCompleted,
        unusualBehavior,
        minimumEffort,
        grade,
        // domainTotalByFollowups,
        userTrainingQuizScore,
      };
    });
    const overallsByUser = ret;
    // const userIds: string[] = [];
    // Object.values(identifiedFindings).forEach((_identifiedFindings) => {
    //   _identifiedFindings.userIds.forEach((_userId) => userIds.push(_userId));
    // });
    const users = await this.usersRepository.find({
      filter: {
        // _id: { $in: Array.from(new Set(userIds)) },
        isDeleted: false,
      },
    });
    const rows = [] as any;
    Object.keys(overallsByUser).map((key) => {
      const row = {} as any;
      const overallByUser = overallsByUser[key];
      const user = users.find((_user) => _user._id.toString() === key);
      row.userName = `${user?.profile?.firstName || ''} ${
        user?.profile?.lastName || ''
      }`;
      row.isUserActivated = user?.isActivated ? 'active' : 'inactive';
      row.id = '-';
      row.userTitle = user?.profile.title ? user.profile.title : '';
      row.countryName = countries.find(
        (_country) => _country._id.toString() === user?.profile?.countryId,
      )?.name;
      row.vendor = vendor;
      row.bu = bu;
      row.region = '';
      row.exp = user?.profile.experience ? user.profile.experience : '';
      row.clinicalExp = user?.profile.clinicalExperience
        ? user.profile.clinicalExperience
        : '';
      row.intDev = '';
      row.type = '';
      row.degree = '';
      row.certification = '';
      row.manager = '';
      row.scoreByDomain = overallByUser.identifiedScoreByDomain
        .filter(
          (_identifiedScoreByDomain) =>
            _identifiedScoreByDomain?.allFindings?.length > 0,
        )
        .map((_identifiedScoreByDomain) =>
          Math.round(
            (_identifiedScoreByDomain.identifiedFindings.length * 100) /
              _identifiedScoreByDomain.allFindings.length,
          ),
        );
      row.domainTotal =
        overallByUser.domainTotal[1] === 0
          ? 0
          : Math.round(
              (overallByUser.domainTotal[0] * 100) /
                overallByUser.domainTotal[1],
            ) + ' %';
      row.criticalIdentified =
        overallByUser.criticalIdentified.allFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.criticalIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.criticalIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.majorIdentified =
        overallByUser.majorIdentified.allFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.majorIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.majorIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.minorIdentified =
        overallByUser.minorIdentified.identifiedFindings.filter(
          (_f) => _f.status === 'Active',
        ).length === 0
          ? 0
          : Math.round(
              (overallByUser.minorIdentified.identifiedFindings.filter(
                (_f) => _f.status === 'Active',
              ).length *
                100) /
                overallByUser.minorIdentified.allFindings.filter(
                  (_f) => _f.status === 'Active',
                ).length,
            ) + ' %';
      row.time = overallByUser.time;
      row.numberOfPillsTaken = Math.round(
        overallByUser.numberOfPillsTakenBySubject * 100,
      );
      row.numberOfPillsShouldTaken = Math.round(
        overallByUser.numberOfPillsShouldHaveBeenTakenBySubject * 100,
      );
      row.compliancePercent = (overallByUser.percentCompliance * 100).toFixed(
        1,
      );
      row.rescueMedication = Math.round(overallByUser.rescueMedication * 100);
      row.numberOfMonitoringNotes = overallByUser.numberOfMonitoringNotes;
      row.distributedDate = moment(overallByUser.distributedAt).format(
        'YYYY/MMM/DD - hh:mm',
      );
      row.reviewedBaselineResult = overallByUser.reviewedBaselineResults;
      row.baselineScoreByDomain = this.calculateScoresByDomain(
        [overallByUser.userBaseline],
        domains,
      ).map((_row, index) => {
        const mainDomains = domains
          .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
          .sort((a, b) => a.seq - b.seq);
        const minScore = domainId
          ? 67
          : Number(
              businessCycle.settingsByDomainIds.find((setting) => {
                return setting.domainId === mainDomains[index]?._id.toString();
              })?.minScore,
            );
        const score =
          Number(_row.identifiedPercent.replace(/[^0-9]/g, '')) / 10;
        return {
          text: Math.round(score),
          assigned: true,
          passed: score < minScore ? false : true,
        };
      });
      row.numberOfTrainingModuleAssigned =
        overallByUser.numberOfTrainingModuleAssigned;
      row.followupScoreByDomain = this.calculateScoresByDomain(
        [overallByUser.userBaseline],
        domains,
      ).map((_row, index) => {
        const userFollowup = overallByUser.userFollowups.find(
          (_userFollowup) => _userFollowup.domainId === _row.domainId,
        );
        const isCompleted =
          userFollowup?.status === UserSimulationStatus.Exported ||
          userFollowup?.status === UserSimulationStatus.Published ||
          userFollowup?.status === UserSimulationStatus.Distributed ||
          userFollowup?.status === UserSimulationStatus.Reviewed;
        const mainDomains = domains
          .filter((_domain) => [1, 2, 6, 8, 11].includes(_domain.visibleId))
          .sort((a, b) => a.seq - b.seq);
        const minScore = domainId
          ? 67
          : Number(
              businessCycle.settingsByDomainIds.find((setting) => {
                return setting.domainId === mainDomains[index]?._id.toString();
              })?.minScore,
            );
        const score =
          Number(_row.identifiedPercent.replace(/[^0-9]/g, '')) / 10;
        return {
          text: row.baselineScoreByDomain[index].passed
            ? row.baselineScoreByDomain[index].text
            : Math.round(score),
          isCompleted,
          assigned: row.baselineScoreByDomain[index].passed ? false : true,
          passed: score < minScore ? false : true,
        };
      });
      row.difference = row.followupScoreByDomain.map((_, index) => {
        const baselineScore =
          Number(row.baselineScoreByDomain[index].text) / 10;
        const followupScore =
          Number(row.followupScoreByDomain[index].text) / 10;
        if (domainId) {
          return {
            text: '-',
            passed: true,
          };
        }
        if (row.baselineScoreByDomain[index].passed) {
          return {
            text: '-',
            passed: row.baselineScoreByDomain[index].passed,
          };
        }
        if (row.followupScoreByDomain[index].text === '-') {
          return {
            text: '-',
            passed: row.followupScoreByDomain[index].passed,
          };
        }
        return {
          text: Math.round(followupScore - baselineScore),
          passed: row.followupScoreByDomain[index].passed,
        };
      });
      row.quizScore = overallByUser.userBaseline.results.scoreByDomain.map(
        (_scoreByMainDomain, index) => {
          const score = overallByUser.userTrainingQuizScore.find(
            (_userTrainingScore) =>
              _userTrainingScore.domainId === _scoreByMainDomain.domainId,
          )?.score;
          const isComplete = !!overallByUser.userTrainingQuizScore.find(
            (_userTrainingScore) =>
              _userTrainingScore.domainId === _scoreByMainDomain.domainId,
          )?.isComplete;
          if (typeof score !== 'number') {
            return {
              text: '-',
              assigned: row.baselineScoreByDomain[index].passed ? false : true,
              isComplete,
            };
          }
          return {
            text: score,
            assigned: row.baselineScoreByDomain[index].passed ? false : true,
            isComplete,
          };
        },
      );
      row.trainingModulesRemaining = domainId
        ? ''
        : overallByUser.trainingModuleRemaining;
      row.followupSimulationRemaining = domainId
        ? ''
        : overallByUser.followupSimRemaining;
      row.isAllModulesCompleted = overallByUser.allModuleCompleted
        ? 'TRUE'
        : 'FALSE';
      row.unusualBehavior = overallByUser.unusualBehavior ? 'TRUE' : 'FALSE';
      row.minimumEffort = overallByUser.minimumEffort;
      row.grade = overallByUser.grade;

      rows.push(row);
    });
    let headers = [
      'Name',
      'Status',
      'ID',
      'Title',
      'Country',
      'Vendor',
      'BU',
      'Region',
      'Exp',
      'Clinical Exp',
      'IntDev',
      'Type',
      'Degree',
      'Certification',
      'Manager',
    ];
    const firstUserId = Object.keys(overallsByUser)?.[0];
    overallsByUser[firstUserId].userBaseline.results.scoreByDomain.forEach(
      (_scoreByDomain) => headers.push(`${_scoreByDomain.name}`),
    );
    headers = [
      ...headers,
      'Domain Total',
      'Critical % Identified',
      'Major % Identified',
      'Minor % Identified',
      'Time',
      'Number of pills taken by subject',
      'Number of pills that should have been taken by subject',
      'Percent (%) Compliance',
      'Rescue Medication',
      'Number of Monitoring Notes',
      'Date Distributed',
      'Reviewed Baseline Results',
    ];
    overallsByUser[firstUserId].userBaseline.results.scoreByDomain.forEach(
      (_scoreByDomain) => headers.push(`${_scoreByDomain.name}`),
    );
    headers.push('Number of Training Modules Assigned');
    overallsByUser[firstUserId].userBaseline.results.scoreByDomain.forEach(
      (_scoreByDomain) => headers.push(`Following - ${_scoreByDomain.name}`),
    );
    overallsByUser[firstUserId].userBaseline.results.scoreByDomain.forEach(
      (_scoreByDomain) => headers.push(`Difference - ${_scoreByDomain.name}`),
    );
    overallsByUser[firstUserId].userBaseline.results.scoreByDomain.forEach(
      (_scoreByDomain) => headers.push(`Quiz - ${_scoreByDomain.name}`),
    );
    headers = [
      ...headers,
      'Training Modules Remaining',
      'Followup Sim Remaining',
      'All Modules Completed?',
      'Unusual Behavior',
      'Minimum Effort',
      'Grade',
    ];
    return { headers, rows };
  }

  async getButrExcel(checkedItems: string[]) {
    const _checkItems = Array.from(new Set(checkedItems));
    const ret = [];
    await Promise.all(
      _checkItems.map(async (_checkItem) => {
        const [
          clientUnitId,
          businessUnitId,
          businessCycleId,
          assessmentCycleId,
          assessmentTypeId,
        ] = _checkItem.split('-');
        const businessCycle = await this.clientUnitsService.readBusinessCycle(
          clientUnitId,
          businessUnitId,
          businessCycleId,
        );
        const userAssessmentCycles = (
          await this.userAssessmentCycleRepository.find({
            filter: {
              clientUnitId,
              businessUnitId,
              businessCycleId,
              assessmentCycleId,
              assessmentTypeId,
            },
          })
        ).filter((_uac) => _uac?.user?.role?.priority === 6);
        userAssessmentCycles.forEach((_userAssessmentCycle) => {
          const row = {} as any;
          row.lastName = _userAssessmentCycle.user.profile.lastName;
          row.firstName = _userAssessmentCycle.user.profile.firstName;
          row.email = _userAssessmentCycle.user.email;
          row.title = _userAssessmentCycle.user.profile.title;
          row.vendor = 'vender';
          row.country = _userAssessmentCycle.user.profile.countryId;
          row.baselineSimulation =
            _userAssessmentCycle.userBaseline.simulationId;
          row.lastLogin = _userAssessmentCycle.user.status.logoutAt;
          row.trainingModules = '';
          row.trainingModulesRemaining =
            _userAssessmentCycle.userTrainings.filter(
              (_userTraining) =>
                _userTraining.status !== UserTrainingStatus.HasNotAssigned,
            ).length -
            _userAssessmentCycle.userTrainings.filter(
              (_userTraining) =>
                _userTraining.status === UserTrainingStatus.Complete,
            ).length;
          row.training1 = _userAssessmentCycle?.userTrainings?.[0]?.completedAt
            ? moment(
                _userAssessmentCycle?.userTrainings?.[0]?.completedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.training2 = _userAssessmentCycle?.userTrainings?.[1]?.completedAt
            ? moment(
                _userAssessmentCycle?.userTrainings?.[1]?.completedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.training3 = _userAssessmentCycle?.userTrainings?.[2]?.completedAt
            ? moment(
                _userAssessmentCycle?.userTrainings?.[2]?.completedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.training4 = _userAssessmentCycle?.userTrainings?.[3]?.completedAt
            ? moment(
                _userAssessmentCycle?.userTrainings?.[3]?.completedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.training5 = _userAssessmentCycle?.userTrainings?.[4]?.completedAt
            ? moment(
                _userAssessmentCycle?.userTrainings?.[4]?.completedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.followupSimulationsAssigned = '';
          row.followupSimRemaining =
            _userAssessmentCycle.userFollowups.filter(
              (_userFollowup) =>
                _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
            ).length -
            _userAssessmentCycle.userFollowups.filter(
              (_userFollowup) =>
                _userFollowup.status === UserSimulationStatus.Scoring ||
                _userFollowup.status === UserSimulationStatus.Adjudicating ||
                _userFollowup.status === UserSimulationStatus.Published ||
                _userFollowup.status === UserSimulationStatus.Distributed ||
                _userFollowup.status === UserSimulationStatus.Reviewed ||
                _userFollowup.status === UserSimulationStatus.Exported,
            ).length;
          row.followup1 = _userAssessmentCycle?.userFollowups?.[0]
            ?.distributedAt
            ? moment(
                _userAssessmentCycle.userFollowups[0].distributedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.followup2 = _userAssessmentCycle?.userFollowups?.[1]
            ?.distributedAt
            ? moment(
                _userAssessmentCycle.userFollowups[1].distributedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.followup3 = _userAssessmentCycle?.userFollowups?.[2]
            ?.distributedAt
            ? moment(
                _userAssessmentCycle.userFollowups[2].distributedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.followup4 = _userAssessmentCycle?.userFollowups?.[3]
            ?.distributedAt
            ? moment(
                _userAssessmentCycle.userFollowups[3].distributedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.followup5 = _userAssessmentCycle?.userFollowups?.[4]
            ?.distributedAt
            ? moment(
                _userAssessmentCycle.userFollowups[4].distributedAt,
              ).format('DD-MMM-YYYY')
            : '';
          row.allModulesCompleted =
            row.trainingModulesRemaining === 0 && row.followupSimRemaining === 0
              ? 'TRUE'
              : 'FALSE';
          row.finalScore = getGrade(
            _userAssessmentCycle.userBaseline,
            _userAssessmentCycle.userTrainings,
            _userAssessmentCycle.userFollowups,
            businessCycle,
          );
          row.dateCompleted = '';
          row.unusualBehavior = '';
          row.minimumEffort = '';
          ret.push(row);
        });
      }),
    );
    return ret;
  }

  async getBaselineDataDumpExcel(
    assessmentCycleId: string,
    assessmentTypeId: string,
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
  ) {
    const {
      scoresBySeverity,
      scoresByDomain,
      scoresByMainDomain,
      totalTimesToComplete,
      identifiedFindings,
      notIdentifiedFindingsByUser,
      overallsByUser,
      userIds,
    } = await this.getBaselineDataDump(
      assessmentCycleId,
      assessmentTypeId,
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
    const users = await this.usersRepository.find({
      filter: { _id: { $in: userIds } },
    });
    const businessCycle = await this.clientUnitsService.readBusinessCycle(
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
    const domains = await this.domainsRepository.find({
      filter: { isDeleted: false },
    });
    const wb = new Workbook();
    const ws = wb.addWorksheet('Overview');
    const ws2 = wb.addWorksheet('Findings');
    const ws3 = wb.addWorksheet('User Status');

    const title = ws.addRow(['CRA ASSESSMENTS']);
    ws.mergeCells(`A1:H1`);
    title.getCell(1).font = {
      size: 25,
    };
    title.height = 35;
    ws.addRow(' ');

    // severity
    const severities = {
      '0': 'Critical',
      '1': 'Major',
      '2': 'Minor',
    };
    const header1 = ws.addRow(['Severity', 'Mean', 'High', 'Low']);
    header1.font = {
      size: 12,
      bold: true,
    };
    header1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };
    Object.keys(scoresBySeverity).map((key) => {
      ws.addRow([
        severities[key],
        scoresBySeverity[key].mean,
        scoresBySeverity[key].high,
        scoresBySeverity[key].low,
      ]);
    });
    ws.addRow(' ');

    // score by domain
    const header2 = ws.addRow(['Domain', 'Mean % Identified']);
    header2.font = {
      size: 12,
      bold: true,
    };
    header2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };
    scoresByMainDomain.forEach((_scoreByMainDomain) => {
      ws.addRow([
        _scoreByMainDomain.domainName,
        _scoreByMainDomain.identifiedPercent,
      ]);
    });
    ws.addRow(' ');

    // total time to complete
    const header3 = ws.addRow(['', 'Mean', 'High', 'Low']);
    header3.font = {
      size: 12,
      bold: true,
    };
    header3.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };
    ws.addRow([
      'Total Time to Complete',
      totalTimesToComplete.mean,
      totalTimesToComplete.high,
      totalTimesToComplete.low,
    ]);
    ws.addRow(' ');

    // study medication
    const header4 = ws.addRow([
      'Description',
      'Subject JHM Study Med Returned - Visit 3',
      'Subject JHM Study Med Returned - Visit 4',
      '	Subject JHM Study Med Returned - Visit 13-ET',
      'Total',
    ]);
    header4.font = {
      size: 12,
      bold: true,
    };
    header4.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };
    ws.addRow(' ');

    // findings
    const header5 = ws2.addRow([
      'Finding Id',
      'Finding',
      'Severity',
      'Domain',
      ...users.map((_user) =>
        _user.profile?.firstName && _user.profile?.lastName
          ? `${_user.profile.firstName} ${_user.profile.lastName}`
          : 'unknown',
      ),
      'Count Identified',
      '% Identified',
    ]);
    header5.font = {
      size: 12,
      bold: true,
    };
    header5.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };

    notIdentifiedFindingsByUser.forEach((_notIdentifiedFindingsByUser) => {
      const findingRow = ws2.addRow([
        _notIdentifiedFindingsByUser.findingVisibleId,
        _notIdentifiedFindingsByUser.findingText,
        _notIdentifiedFindingsByUser.severity,
        _notIdentifiedFindingsByUser.domainName,
        ..._notIdentifiedFindingsByUser.users.map((_) =>
          _.identified ? 'Identified' : 'Not Identified',
        ),
        _notIdentifiedFindingsByUser.identifiedCount,
        _notIdentifiedFindingsByUser.identifiedPercent,
      ]);
      for (let i = 4; i < 4 + _notIdentifiedFindingsByUser.users.length; i++) {
        findingRow.getCell(i + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: _notIdentifiedFindingsByUser.users[i - 4].identified
              ? '4caf50'
              : 'ffeb3b',
          },
        };
        findingRow.getCell(i + 1).font = {
          bold: true,
        };
      }
    });

    // overall
    const header6 = ws3.addRow([
      'Name',
      'Status',
      'ID',
      'Title',
      'Country',
      'Vendor',
      'BU',
      'Region',
      'Exp',
      'Clinical Exp',
      'IntDev',
      'Type',
      'Degree',
      'Certification',
      'Manager',
      'Domain Total',
      'Critical % Identified',
      'Major % Identified',
      '	Minor % Identified',
      'Time',
      'Number of pills taken by subject',
      'Number of pills that should have been taken by subject',
      'Percent (%) Compliance',
      'Rescue Medication',
      'Number of Monitoring Notes',
      'Date Distributed',
      'Reviewed Baseline Results',
      `${domains.find((_domain) => _domain.visibleId === 1)?.name}`,
      `${domains.find((_domain) => _domain.visibleId === 2)?.name}`,
      `${domains.find((_domain) => _domain.visibleId === 6)?.name}`,
      `${domains.find((_domain) => _domain.visibleId === 8)?.name}`,
      `${domains.find((_domain) => _domain.visibleId === 11)?.name}`,
      'Number of Training Modules Assigned',
      `Following - ${domains.find((_domain) => _domain.visibleId === 1)?.name}`,
      `Following - ${domains.find((_domain) => _domain.visibleId === 2)?.name}`,
      `Following - ${domains.find((_domain) => _domain.visibleId === 6)?.name}`,
      `Following - ${domains.find((_domain) => _domain.visibleId === 8)?.name}`,
      `Following - ${
        domains.find((_domain) => _domain.visibleId === 11)?.name
      }`,
      `Difference - ${
        domains.find((_domain) => _domain.visibleId === 1)?.name
      }`,
      `Difference - ${
        domains.find((_domain) => _domain.visibleId === 2)?.name
      }`,
      `Difference - ${
        domains.find((_domain) => _domain.visibleId === 6)?.name
      }`,
      `Difference - ${
        domains.find((_domain) => _domain.visibleId === 8)?.name
      }`,
      `Difference - ${
        domains.find((_domain) => _domain.visibleId === 11)?.name
      }`,
      `Quiz - ${domains.find((_domain) => _domain.visibleId === 1)?.name}`,
      `Quiz - ${domains.find((_domain) => _domain.visibleId === 2)?.name}`,
      `Quiz - ${domains.find((_domain) => _domain.visibleId === 6)?.name}`,
      `Quiz - ${domains.find((_domain) => _domain.visibleId === 8)?.name}`,
      `Quiz - ${domains.find((_domain) => _domain.visibleId === 11)?.name}`,
      'Training Modules Remaining',
      'Followup Sim Remaining',
      'All Modules Completed?',
      '	Unusual Behavior',
      'Minimum Effort',
      'Grade',
    ]);
    header6.font = {
      size: 12,
      bold: true,
    };
    header6.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'cccccc',
      },
    };

    overallsByUser.rows.forEach((_overallByUser) => {
      const overallRow = ws3.addRow([
        _overallByUser.userName,
        _overallByUser.isUserActivated,
        _overallByUser.id,
        _overallByUser.userTitle,
        _overallByUser.countryName,
        _overallByUser.vendor,
        _overallByUser.bu,
        _overallByUser.region,
        _overallByUser.exp,
        _overallByUser.clinicalExp,
        _overallByUser.intDev,
        _overallByUser.type,
        _overallByUser.degree,
        _overallByUser.certification,
        _overallByUser.manager,
        _overallByUser.domainTotal,
        _overallByUser.criticalIdentified,
        _overallByUser.majorIdentified,
        _overallByUser.minorIdentified,
        _overallByUser.time,
        _overallByUser.numberOfPillsTaken,
        _overallByUser.numberOfPillsShouldTaken,
        _overallByUser.compliancePercent,
        _overallByUser.rescueMedication,
        _overallByUser.numberOfMonitoringNotes,
        _overallByUser.distributedDate,
        _overallByUser.reviewedBaselineResult,
        ..._overallByUser.baselineScoreByDomain.map((_) => _.text), //
        _overallByUser.numberOfTrainingModuleAssigned,
        ..._overallByUser.followupScoreByDomain.map((_) => _.text), //
        ..._overallByUser.difference.map((_) => _.text), //
        ..._overallByUser.quizScore.map((_) => _.text), //
        _overallByUser.trainingModulesRemaining,
        _overallByUser.followupSimulationRemaining,
        _overallByUser.isAllModulesCompleted,
        _overallByUser.unusualBehavior,
        _overallByUser.minimumEffort,
        _overallByUser.grade,
      ]);
      const baselineScoreByDomainStart = 27;
      const baselineScoreByDomainEnd =
        baselineScoreByDomainStart +
        _overallByUser.baselineScoreByDomain.length;

      const followupScoreByDomainStart = baselineScoreByDomainEnd + 1;
      const followupScoreByDomainEnd =
        followupScoreByDomainStart +
        _overallByUser.followupScoreByDomain.length;

      const differenceStart = followupScoreByDomainEnd;
      const differenceEnd = differenceStart + _overallByUser.difference.length;

      const quizScoreStart = differenceEnd;
      const quizScoreEnd = quizScoreStart + _overallByUser.quizScore.length;
      for (
        let i = baselineScoreByDomainStart;
        i < baselineScoreByDomainEnd;
        i++
      ) {
        const currentIndex = i - baselineScoreByDomainStart;
        const assigned =
          _overallByUser.baselineScoreByDomain[currentIndex].assigned;
        const passed =
          _overallByUser.baselineScoreByDomain[currentIndex].passed;

        overallRow.getCell(i + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: assigned ? (passed ? '54a54d' : 'fc0d1b') : undefined,
          },
        };
      }
      for (
        let i = followupScoreByDomainStart;
        i < followupScoreByDomainEnd;
        i++
      ) {
        const currentIndex = i - followupScoreByDomainStart;
        const assigned =
          _overallByUser.followupScoreByDomain[currentIndex].assigned;
        const passed =
          _overallByUser.followupScoreByDomain[currentIndex].passed;
        const text = _overallByUser.followupScoreByDomain[currentIndex].text;

        overallRow.getCell(i + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb:
              text === '-'
                ? 'ffff00'
                : assigned
                ? passed
                  ? '54a54d'
                  : 'fc0d1b'
                : 'e9f3d4',
          },
        };
      }
      for (let i = differenceStart; i < differenceEnd; i++) {
        const currentIndex = i - differenceStart;
        const passed = _overallByUser.difference[currentIndex].passed;
        const text = _overallByUser.difference[currentIndex].text;

        overallRow.getCell(i + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: text === '-' ? 'dbdcd9' : passed ? '54a54d' : 'fc0d1b',
          },
        };
      }
      for (let i = quizScoreStart; i < quizScoreEnd; i++) {
        const currentIndex = i - quizScoreStart;
        const assigned = _overallByUser.quizScore[currentIndex].assigned;
        overallRow.getCell(i + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: assigned ? 'e2e8f9' : undefined,
          },
        };
      }
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

  async getFollowupDataDumpExcel(
    assessmentCycleId: string,
    assessmentTypeId: string,
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
    domainId: string,
  ) {}
}
