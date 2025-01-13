import * as moment from 'moment';
import * as tmp from 'tmp';
import * as xlsx from 'xlsx';

import {
  AnswerStatus,
  AssessmentStatus,
  SimulationType,
  UserSimulationStatus,
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
import SimManagementRepository from './simManagement.repository';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import { User } from '../../v1/users/schemas/users.schema';
import { UserAssessmentCyclesService } from '../../v1/userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import { getFormattedTime } from 'src/utils/utils';

@Injectable()
export default class SimManagementService {
  constructor(
    private readonly simManagementRepository: SimManagementRepository,

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
    try {
      const simManagements = await this.simManagementRepository.find(query);
      return simManagements;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async count(query: MongoQuery<any>) {
    return await this.simManagementRepository.count({
      filter: query.filter,
      options: { ...query.options, skip: undefined, limit: undefined },
    });
  }

  async getExcel(query: MongoQuery<any>) {
    const simManagements = await this.simManagementRepository.find(query);
    const excelData = [] as any[];
    const data = simManagements.map((simManagement) => {
      const clientUnit = simManagement.clientUnit as ClientUnit;
      const user = simManagement.user as User;
      const userBaseline = simManagement.userBaseline as UserSimulation;
      const userBaselineSimulation = simManagement.userBaseline
        .simulation as Simulation;
      const userFollowups = simManagement.userFollowups as UserSimulation[];
      const assessmentType = simManagement.assessmentType as AssessmentType;
      const assessmentCycle = simManagement.assessmentCycle as AssessmentCycle;

      const simulationType = userBaseline.simulationType;
      const client = clientUnit.name;
      const lastName = user.profile.lastName;
      const firstName = user.profile.firstName;
      const simulation = userBaselineSimulation.name;
      const allocatedTime = userBaseline.testTime;
      const timeSpent = userBaseline.usageTime;
      const attemptCount = userBaseline.attemptCount;
      const lastLogin = user.status.signinAt;
      const dateAssigned = userBaseline.assignedAt;
      const submittedDate = userBaseline.submittedAt;
      const publishedDate = userBaseline.publishedAt;
      const simStatus = userBaseline.status;
      const resultStage = userBaseline.status;

      excelData.push({
        simulationType,
        client,
        lastName,
        firstName,
        simulation,
        allocatedTime: getFormattedTime(allocatedTime),
        timeSpent: getFormattedTime(timeSpent),
        attemptCount,
        lastLogin: lastLogin
          ? moment(lastLogin).format('DD-MMM-YYYY hh:mm:ss')
          : '',
        dateAssigned: dateAssigned
          ? moment(dateAssigned).format('DD-MMM-YYYY hh:mm:ss')
          : '',
        submittedDate: submittedDate
          ? moment(submittedDate).format('DD-MMM-YYYY hh:mm:ss')
          : '',
        publishedDate: publishedDate
          ? moment(publishedDate).format('DD-MMM-YYYY hh:mm:ss')
          : '',
        simStatus: [
          UserSimulationStatus.Assigned,
          UserSimulationStatus.InProgress,
          'Complete',
        ].includes(simStatus)
          ? simStatus
          : '',
        resultStage: [
          UserSimulationStatus.Scoring,
          UserSimulationStatus.Adjudicating,
          UserSimulationStatus.Reviewed,
          UserSimulationStatus.Published,
          UserSimulationStatus.Exported,
          UserSimulationStatus.Distributed,
        ].includes(resultStage)
          ? resultStage
          : '',
      });

      userFollowups.forEach((_userFollowup) => {
        const simulationType = _userFollowup.simulationType;
        const client = '';
        const lastName = '';
        const firstName = '';
        const simulation = (_userFollowup as any).simulation.name;
        const allocatedTime = _userFollowup.testTime;
        const timeSpent = _userFollowup.usageTime;
        const attemptCount = _userFollowup.attemptCount;
        const lastLogin = '';
        const dateAssigned = _userFollowup.assignedAt;
        const submittedDate = _userFollowup.submittedAt;
        const publishedDate = _userFollowup.publishedAt;
        const simStatus = _userFollowup.status;
        const resultStage = _userFollowup.status;

        if (simStatus === UserSimulationStatus.HasNotAssigned) return;
        excelData.push({
          simulationType,
          client,
          lastName,
          firstName,
          simulation,
          allocatedTime: getFormattedTime(allocatedTime),
          timeSpent: getFormattedTime(timeSpent),
          attemptCount,
          lastLogin: lastLogin
            ? moment(lastLogin).format('DD-MMM-YYYY hh:mm:ss')
            : '',
          dateAssigned: dateAssigned
            ? moment(dateAssigned).format('DD-MMM-YYYY hh:mm:ss')
            : '',
          submittedDate: submittedDate
            ? moment(submittedDate).format('DD-MMM-YYYY hh:mm:ss')
            : '',
          publishedDate: publishedDate
            ? moment(publishedDate).format('DD-MMM-YYYY hh:mm:ss')
            : '',
          simStatus: [
            UserSimulationStatus.HasNotAssigned,
            UserSimulationStatus.Assigned,
            UserSimulationStatus.InProgress,
            'Complete',
          ].includes(simStatus)
            ? simStatus
            : '',
          resultStage: [
            UserSimulationStatus.Scoring,
            UserSimulationStatus.Adjudicating,
            UserSimulationStatus.Reviewed,
            UserSimulationStatus.Published,
            UserSimulationStatus.Exported,
            UserSimulationStatus.Distributed,
          ].includes(resultStage)
            ? resultStage
            : '',
        });
      });
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(excelData);
    xlsx.utils.book_append_sheet(wb, ws, 'userStatus');
    const ret = xlsx.writeXLSX(wb, { type: 'binary' });

    return ret;
  }

  async reopen(
    userSimulationId: string,
    additionalTestTime: number,
    additionalAttemptCount: number,
  ) {
    try {
      const userSimulation = await this.userSimulationsService.findOne({
        filter: { _id: userSimulationId },
      });

      if (userSimulation.simulationType === SimulationType.Baseline) {
        const userAssessmentCycle =
          await this.userAssessmentCyclesService.findOne({
            filter: { userBaselineId: userSimulationId },
          });
        await this.userSimulationsService.update({
          filter: { _id: userSimulationId, isDeleted: false },
          update: {
            $set: { status: UserSimulationStatus.InProgress },
            $inc: {
              reopenCount: 1,
              testTime: additionalTestTime * 60 * 60,
              attemptCount: additionalAttemptCount,
            },
          },
        });
        await this.userSimulationsService.update({
          filter: {
            _id: { $in: userAssessmentCycle.userFollowupIds },
            isDeleted: false,
          },
          update: {
            $set: {
              status: UserSimulationStatus.HasNotAssigned,
            },
            $inc: {
              reopenCount: 1,
              testTime: additionalTestTime * 60 * 60,
              attemptCount: additionalAttemptCount,
            },
          },
        });
        await this.assessmentsService.update({
          filter: {
            userSimulationId: {
              $in: [userSimulationId, ...userAssessmentCycle.userFollowupIds],
            },
            isDeleted: false,
          },
          update: {
            $set: {
              'firstScorer.status': AssessmentStatus.Pending,
              'secondScorer.status': AssessmentStatus.Pending,
              'adjudicator.status': AssessmentStatus.Pending,
              status: AssessmentStatus.Pending,
            },
          },
        });
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userBaselineId: userSimulationId,
          },
        });
      } else if (userSimulation.simulationType === SimulationType.Followup) {
        await this.userSimulationsService.update({
          filter: { _id: userSimulationId, isDeleted: false },
          update: {
            $set: { status: UserSimulationStatus.InProgress },
            $inc: {
              reopenCount: 1,
              testTime: additionalTestTime * 60 * 60,
              attemptCount: additionalAttemptCount,
            },
          },
        });
        await this.assessmentsService.update({
          filter: {
            userSimulationId,
            isDeleted: false,
          },
          update: {
            $set: {
              'firstScorer.status': AssessmentStatus.Pending,
              'secondScorer.status': AssessmentStatus.Pending,
              'adjudicator.status': AssessmentStatus.Pending,
              status: AssessmentStatus.Pending,
            },
          },
        });
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userFollowupIds: userSimulationId,
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async reallocate(
    userSimulationId: string,
    additionalTestTime: number,
    additionalAttemptCount: number,
  ) {
    console.log({
      userSimulationId,
      additionalAttemptCount,
      additionalTestTime,
    });
    try {
      const userSimulation = await this.userSimulationsService.findOne({
        filter: { _id: userSimulationId },
      });
      await this.userSimulationsService.update({
        filter: { _id: userSimulationId, isDeleted: false },
        update: {
          $inc: {
            testTime: additionalTestTime * 60 * 60,
            attemptCount: additionalAttemptCount,
          },
        },
      });
      if (userSimulation.simulationType === SimulationType.Baseline) {
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userBaselineId: userSimulationId,
          },
        });
      }
      if (userSimulation.simulationType === SimulationType.Followup) {
        await this.userAssessmentCyclesService.renewSummary({
          filter: {
            userFollowupIds: userSimulationId,
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
