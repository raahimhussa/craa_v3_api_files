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
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import { User } from '../../v1/users/schemas/users.schema';
import { UserAssessmentCyclesService } from '../../v1/userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserStatusRepository from './userStatusManagement.repository';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import { getFormattedTime } from 'src/utils/utils';

@Injectable()
export default class UserStatusManagementService {
  constructor(
    private readonly userStatusRepository: UserStatusRepository,

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
    const userStatusManagement = this.userStatusRepository.find(
      this.getQueryWithFilter(query),
    );
    return userStatusManagement;
  }

  async count(query: MongoQuery<any>) {
    const userStatusManagement = await this.userStatusRepository.count(
      this.getQueryWithFilter(query),
    );
    return userStatusManagement;
  }

  async getExcel(query: MongoQuery<any>) {
    // const userStatusManagement = await this.userStatusRepository.findWithoutPagination(
    //   query,
    // );
    return;
  }

  getQueryWithFilter = (query: MongoQuery<any>) => {
    const { filter, options } = query;

    return query;
  };
}
