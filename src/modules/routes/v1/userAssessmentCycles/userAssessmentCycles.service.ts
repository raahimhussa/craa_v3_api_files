import * as moment from 'moment';
import * as xlsx from 'xlsx';

import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SimulationType, UserSimulationStatus } from 'src/utils/status';
import {
  UserAssessmentCycle,
  UserAssessmentCycleDocument,
} from './schemas/userAssessmentCycle.schema';

import AssessmentsService from '../../v2/assessments/assessments.service';
import { ClientUnitsService } from '../clientUnits/clientUnits.service';
import CreateUserAssessmentCycleDto from './dto/userAssessmentCycle.dto';
import CreateUserAssessmentCycleSummaryDto from './dto/userAssessmentCycleSummary.dto';
import DataDumpsService from '../../v3/dataDump/dataDump.service';
import { ModuleRef } from '@nestjs/core';
import { User } from '../users/schemas/users.schema';
import UserAssessmentCycleSummariesRepository from './userAssessmentCycleSummaries.repository';
import UserAssessmentCyclesRepository from './userAssessmentCycles.repository';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import { UserTraining } from '../../v2/userTrainings/schemas/userTraining.schema';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import UsersBusinessService from '../users/business.service';
import UsersRepository from '../users/users.repository';
import { getGrade } from 'src/utils/grade';
import { join } from 'path';

@Injectable()
export class UserAssessmentCyclesService implements OnModuleInit {
  private usersRepository: UsersRepository;

  constructor(
    private readonly clientUnitsService: ClientUnitsService,
    private readonly userAssessmentCyclesRepository: UserAssessmentCyclesRepository,
    private readonly userAssessmentCycleSummariesRepository: UserAssessmentCycleSummariesRepository,
    private readonly userSimulationsService: UserSimulationsService,
    private readonly userTrainingsService: UserTrainingsService,
    // private readonly assessmentsService: AssessmentsService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.usersRepository = this.moduleRef.get(UsersRepository, {
      strict: false,
    });
  }

  async create(createUserAssessmentCycleDto: CreateUserAssessmentCycleDto) {
    const userSimulations = await this.userSimulationsService.find({
      filter: {
        _id: {
          $in: [
            createUserAssessmentCycleDto.userBaselineId,
            ...createUserAssessmentCycleDto.userFollowupIds,
          ],
        },
      },
    });
    const userTrainings = await this.userTrainingsService.find({
      filter: {
        _id: { $in: [...createUserAssessmentCycleDto.userTrainingIds] },
      },
    });
    const user = await this.usersRepository.findOne({
      filter: {
        _id: createUserAssessmentCycleDto.userId,
      },
    });
    // create userAssessmentCycle
    const ret = await this.userAssessmentCyclesRepository.create(
      createUserAssessmentCycleDto,
    );
    // create userAssessmentCycleSummary
    const createUserAssessmentCycleSummaryDto: CreateUserAssessmentCycleSummaryDto =
      {
        ...createUserAssessmentCycleDto,
        userBaseline:
          userSimulations.find(
            (_userSimulation) =>
              _userSimulation.simulationType === SimulationType.Baseline,
          ) || null,
        userFollowups:
          userSimulations.filter(
            (_userSimulation) =>
              _userSimulation.simulationType === SimulationType.Followup,
          ) || [],
        userTrainings,
        user,
        userAssessmentCycleId: ret._id.toString(),
      };
    await this.userAssessmentCycleSummariesRepository.create(
      createUserAssessmentCycleSummaryDto,
    );
    return ret;
  }

  async find(query: FindQuery<UserAssessmentCycleDocument>) {
    try {
      const fields: {
        status: number;
        result: number;
        verified: number;
        invoiced: number;
        minEffort: number;
        signOff: number;
        behavior: number;
      } = query?.options?.fields || {
        status: 0,
        result: 0,
        verified: 0,
        invoiced: 0,
        minEffort: 0,
        signOff: 0,
        behavior: 0,
      };
      let userAssessmentCycles = await this.userAssessmentCyclesRepository.find(
        query,
      );

      //client admin country filtering
      if (
        query.options !== undefined &&
        query.options.authority !== undefined
      ) {
        const { authority } = query.options;

        userAssessmentCycles = userAssessmentCycles.filter(
          (_userAssessmentCycle) => {
            const { clientUnitId, businessUnitId, countryId } =
              _userAssessmentCycle;
            const whitelist = authority.whitelist.find(
              (list) => list.clientId === clientUnitId.toString(),
            );
            if (
              whitelist.countryPermissions[businessUnitId] !== undefined &&
              whitelist.countryPermissions[businessUnitId].length !== 0
            ) {
              if (
                whitelist.countryPermissions[businessUnitId].includes(countryId)
              ) {
                return _userAssessmentCycle;
              }
            } else {
              return _userAssessmentCycle;
            }
          },
        );
      }

      const ret = await Promise.all(
        userAssessmentCycles.map(async (_userAssessmentCycle) => {
          const {
            userBaseline,
            userTrainings,
            userFollowups,
            clientUnitId,
            businessUnitId,
            businessCycleId,
          } = _userAssessmentCycle;
          const businessCycle: any =
            await this.clientUnitsService.readBusinessCycle(
              clientUnitId,
              businessUnitId,
              businessCycleId,
            );
          return {
            ..._userAssessmentCycle,
            grade: getGrade(
              userBaseline,
              userTrainings,
              userFollowups,
              businessCycle,
            ),
          };
        }),
      );
      const _ret = ret.filter((_userAssessmentCycle) => {
        if (
          query?.options?.context === 'invoice' &&
          !_userAssessmentCycle?.userBaseline?.publishedAt
        )
          return false;
        if (query?.options?.comment?.fromValue) {
          if (
            new Date(query.options.comment.fromValue) >
            _userAssessmentCycle?.invoicedDate
          )
            return false;
        }
        if (query?.options?.comment?.toValue) {
          if (
            new Date(query.options.comment.toValue) <
            _userAssessmentCycle?.invoicedDate
          )
            return false;
        }
        // status
        switch (fields.status) {
          case 0: {
            break;
          }
          default: {
            break;
          }
        }
        // result
        switch (fields.result) {
          case 0: {
            break;
          }
          case 1: {
            if (
              _userAssessmentCycle.grade === 'Pass' ||
              _userAssessmentCycle.grade === 'Pass I'
            )
              break;
            else return false;
          }
          case 2: {
            if (_userAssessmentCycle.grade !== 'Pass II') return false;
            break;
          }
          case 3: {
            if (_userAssessmentCycle.grade !== 'Pass with Notice I')
              return false;
            break;
          }
          default: {
            break;
          }
        }
        // verified
        switch (fields.verified) {
          case 0: {
            break;
          }
          case 1: {
            if (_userAssessmentCycle.verified !== true) return false;
            break;
          }
          case 2: {
            if (!!_userAssessmentCycle?.verified) return false;
            break;
          }
          default: {
            break;
          }
        }
        // invoiced
        switch (fields.invoiced) {
          case 0: {
            break;
          }
          case 1: {
            if (_userAssessmentCycle.invoiced !== true) return false;
            if (!_userAssessmentCycle.invoiced) return false;
            break;
          }
          case 2: {
            if (!!_userAssessmentCycle?.invoiced) return false;
            break;
          }
          default: {
            break;
          }
        }
        // minEffort
        switch (fields.minEffort) {
          case 0: {
            break;
          }
          case 1: {
            if (_userAssessmentCycle.minimumEffort !== true) return false;
            break;
          }
          case 2: {
            if (!!_userAssessmentCycle?.minimumEffort) return false;
            break;
          }
          default: {
            break;
          }
        }
        // signOff
        switch (fields.signOff) {
          case 0: {
            break;
          }
          case 1: {
            if (_userAssessmentCycle.signedOff === false) return false;
            break;
          }
          case 2: {
            if (_userAssessmentCycle.signedOff === true) return false;
            break;
          }
          case 3: {
            if (_userAssessmentCycle.signedOff === true) return false;
            if (_userAssessmentCycle.signedOffDate === null) return false;
            break;
          }
          default: {
            break;
          }
        }
        // behavior
        switch (fields.behavior) {
          case 0: {
            break;
          }
          case 1: {
            if (_userAssessmentCycle.unusualBehavior !== true) return false;
            break;
          }
          default: {
            break;
          }
        }
        return true;
      });

      return typeof query?.options?.skip === 'number' &&
        typeof query?.options?.limit === 'number'
        ? _ret.slice(
            query.options.skip,
            query.options.skip + query.options.limit,
          )
        : _ret;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async userStatusManagementExcel(
    query: FindQuery<UserAssessmentCycleDocument>,
  ) {
    const fields: {
      status: number;
      result: number;
      verified: number;
      invoiced: number;
      minEffort: number;
      signOff: number;
      behavior: number;
    } = query?.options?.fields || {
      status: 0,
      result: 0,
      verified: 0,
      invoiced: 0,
      minEffort: 0,
      signOff: 0,
      behavior: 0,
    };
    const userAssessmentCycles = await this.userAssessmentCyclesRepository.find(
      query,
    );
    const ret = await Promise.all(
      userAssessmentCycles.map(async (_userAssessmentCycle) => {
        const {
          userBaseline,
          userTrainings,
          userFollowups,
          clientUnitId,
          businessUnitId,
          businessCycleId,
        } = _userAssessmentCycle;
        const businessCycle: any =
          await this.clientUnitsService.readBusinessCycle(
            clientUnitId,
            businessUnitId,
            businessCycleId,
          );
        return {
          ..._userAssessmentCycle,
          grade: getGrade(
            userBaseline,
            userTrainings,
            userFollowups,
            businessCycle,
          ),
        };
      }),
    );
    const _ret = ret.filter((_userAssessmentCycle) => {
      if (
        query?.options?.context === 'invoice' &&
        !_userAssessmentCycle.userBaseline.publishedAt
      )
        return false;
      if (query.options?.comment?.fromValue) {
        if (
          new Date(query.options.comment.fromValue) >
          _userAssessmentCycle.invoicedDate
        )
          return false;
      }
      if (query.options?.comment?.toValue) {
        if (
          new Date(query.options.comment.toValue) <
          _userAssessmentCycle.invoicedDate
        )
          return false;
      }
      // status
      switch (fields.status) {
        case 0: {
          break;
        }
        default: {
          break;
        }
      }
      // result
      switch (fields.result) {
        case 0: {
          break;
        }
        case 1: {
          if (
            _userAssessmentCycle.grade === 'Pass' ||
            _userAssessmentCycle.grade === 'Pass I'
          )
            break;
          else return false;
        }
        case 2: {
          if (_userAssessmentCycle.grade !== 'Pass II') return false;
          break;
        }
        case 3: {
          if (_userAssessmentCycle.grade !== 'Pass with Notice I') return false;
          break;
        }
        default: {
          break;
        }
      }
      // verified
      switch (fields.verified) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.verified !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.verified !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // invoiced
      switch (fields.invoiced) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.invoiced !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.invoiced !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // minEffort
      switch (fields.minEffort) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.minimumEffort !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.minimumEffort !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // signOff
      switch (fields.signOff) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.signedOff === false) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.signedOff === true) return false;
          break;
        }
        case 3: {
          if (_userAssessmentCycle.signedOff === true) return false;
          if (_userAssessmentCycle.signedOffDate === null) return false;
          break;
        }
        default: {
          break;
        }
      }
      // behavior
      switch (fields.behavior) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.unusualBehavior !== true) return false;
          break;
        }
        default: {
          break;
        }
      }
      return true;
    });

    const xlsRet = _ret.map((_userAssessmentCycle) => {
      const user = _userAssessmentCycle.user as User;
      const userBaseline = _userAssessmentCycle.userBaseline as UserSimulation;
      const userFollowups =
        _userAssessmentCycle.userFollowups as UserSimulation[];
      const userTrainings =
        _userAssessmentCycle.userTrainings as UserTraining[];

      const email = user.email;
      const lastName = user.profile.lastName;
      const firstName = user.profile.firstName;
      const vendor = '';
      const accountStatus = user.isActivated;
      const simulationStatus = '';
      const simulationProcessCompleted = userFollowups
        .filter(
          (_userFollowup: any) =>
            _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
        )
        .reduce((acc: Date | undefined, cur: any) => {
          if (acc === undefined) return cur.publishedAt;
          if (cur.publishedAt > acc) return cur.publishedAt;
          return acc;
        }, undefined);
      const result = _userAssessmentCycle.grade;
      const signedOff = _userAssessmentCycle.signedOffDate;
      const verified = _userAssessmentCycle.verified;
      const baselineScored = userBaseline.publishedAt;
      const invoiced = '';
      const invoicedDate = _userAssessmentCycle.invoicedDate;
      const minimumEffort =
        userBaseline.minimumEffort ||
        userFollowups.find((_userFollowup: any) => _userFollowup.minimumEffort);
      const unusualBehavior =
        userBaseline.unusualBehavior ||
        userFollowups.find(
          (_userFollowup: any) => _userFollowup.unusualBehavior,
        );
      const emailAlias = user.aliasEmails.join(',');

      return {
        email,
        lastName,
        firstName,
        vendor,
        accountStatus,
        simulationStatus,
        simulationProcessCompleted: simulationProcessCompleted
          ? moment(simulationProcessCompleted).format('DD-MMM-YYYY')
          : '-',
        result,
        signedOff,
        verified,
        baselineScored: baselineScored
          ? moment(baselineScored).format('DD-MMM-YYYY')
          : '-',
        invoiced,
        invoicedDate: invoicedDate
          ? moment(invoicedDate).format('MMM YYYY')
          : '-',
        minimumEffort: minimumEffort ? 'TRUE' : 'FALSE',
        unusualBehavior: unusualBehavior ? 'TRUE' : 'FALSE',
        emailAlias,
      };
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(xlsRet);
    xlsx.utils.book_append_sheet(wb, ws, 'userStatus');
    const data = xlsx.writeXLSX(wb, { type: 'binary' });

    return data;
  }

  public async getNumberOfElement(
    query: FindQuery<UserAssessmentCycle>,
  ): Promise<number> {
    const fields: {
      status: number;
      result: number;
      verified: number;
      invoiced: number;
      minEffort: number;
      signOff: number;
      behavior: number;
    } = query.options?.fields || {
      status: 0,
      result: 0,
      verified: 0,
      invoiced: 0,
      minEffort: 0,
      signOff: 0,
      behavior: 0,
    };
    const userAssessmentCycles = await this.userAssessmentCyclesRepository.find(
      query,
    );
    const ret = await Promise.all(
      userAssessmentCycles.map(async (_userAssessmentCycle) => {
        const {
          userBaseline,
          userTrainings,
          userFollowups,
          clientUnitId,
          businessUnitId,
          businessCycleId,
        } = _userAssessmentCycle;
        const businessCycle: any =
          await this.clientUnitsService.readBusinessCycle(
            clientUnitId,
            businessUnitId,
            businessCycleId,
          );
        return {
          ..._userAssessmentCycle,
          grade: getGrade(
            userBaseline,
            userTrainings,
            userFollowups,
            businessCycle,
          ),
        };
      }),
    );
    const _ret = ret.filter((_userAssessmentCycle) => {
      if (
        query?.options?.context === 'invoice' &&
        !_userAssessmentCycle.userBaseline.publishedAt
      )
        return false;
      if (query.options?.comment?.fromValue) {
        if (
          new Date(query.options.comment.fromValue) >
          _userAssessmentCycle.invoicedDate
        )
          return false;
      }
      if (query.options?.comment?.toValue) {
        if (
          new Date(query.options.comment.toValue) <
          _userAssessmentCycle.invoicedDate
        )
          return false;
      }
      // status
      switch (fields.status) {
        case 0: {
          break;
        }
        default: {
          break;
        }
      }
      // result
      switch (fields.result) {
        case 0: {
          break;
        }
        case 1: {
          if (
            _userAssessmentCycle.grade === 'Pass' ||
            _userAssessmentCycle.grade === 'Pass I'
          )
            break;
          else return false;
        }
        case 2: {
          if (_userAssessmentCycle.grade !== 'Pass II') return false;
          break;
        }
        case 3: {
          if (_userAssessmentCycle.grade !== 'Pass with Notice I') return false;
          break;
        }
        default: {
          break;
        }
      }
      // verified
      switch (fields.verified) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.verified !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.verified !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // invoiced
      switch (fields.invoiced) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.invoiced !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.invoiced !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // minEffort
      switch (fields.minEffort) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.minimumEffort !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.minimumEffort !== false) return false;
          break;
        }
        default: {
          break;
        }
      }
      // signOff
      switch (fields.signOff) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.signedOff !== true) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.signedOff !== false) return false;
          break;
        }
        case 2: {
          if (_userAssessmentCycle.signedOff !== 'ready to be sign off')
            return false;
          break;
        }
        default: {
          break;
        }
      }
      // behavior
      switch (fields.behavior) {
        case 0: {
          break;
        }
        case 1: {
          if (_userAssessmentCycle.unusualBehavior !== true) return false;
          break;
        }
        default: {
          break;
        }
      }
      return true;
    });
    return typeof query?.options?.skip === 'number' &&
      typeof query?.options?.limit === 'number'
      ? _ret.slice(query.options.skip, query.options.skip + query.options.limit)
          .length
      : _ret.length;
  }

  findOne(query: FindQuery<UserAssessmentCycleDocument>) {
    return this.userAssessmentCyclesRepository.findOne(query);
  }

  getSimulationCnt(query: FindQuery<UserAssessmentCycleDocument>) {
    return this.userAssessmentCyclesRepository.count(query);
  }

  async getGroupedSimulation(query: FindQuery<UserAssessmentCycleDocument>) {
    const _ = require('lodash');
    const data = await this.userAssessmentCyclesRepository.findWithJoin(query);
    const grouped = _.groupBy(data, (uac) => uac.user.businessUnit.client.name);

    // by businessUnit
    _.map(grouped, (uacs, key) => {
      grouped[key] = _.groupBy(uacs, (uac) => uac.user.businessUnit.name);
      _.map(grouped[key], (uacs, key2) => {
        grouped[key][key2] = _.groupBy(uacs, (uac) => uac.user.country.name);
        _.map(grouped[key][key2], (uacs, key3) => {
          grouped[key][key2][key3] = _.groupBy(
            uacs,
            (uac) => uac.userSimulation.status,
          );
        });
      });
    });

    // // by country
    // _.map(grouped, (bus, key) => {
    //   grouped[key] = _.groupBy(bus, (bu) => bu.user.businessUnit.name);
    // });
    // let grouped2 = _.groupBy(data, (uac) => uac.user.businessUnit.name);
    // return this.userAssessmentCyclesRepository.findWithJoin(query);
    return grouped;
  }

  // async assignToUserAC(assessmentCycleId: string, userId: string, saleId) {
  //   try {
  //     const user = await this.usersRepository.findById(userId);
  //     const assessmentCycle: AssessmentCycle =
  //       await this.assessmentCycleRepository.findById(assessmentCycleId);
  //     // const assessmentCycle: AssessmentCycle =
  //     //   await this.assessmentCycleRepository.findOne({
  //     //     filter: { _id: assessmentCycleId },
  //     //   });
  //     const assessmentType = await this.assessmentTypesRepository.findById(
  //       assessmentCycle.assessmentTypeIds[0],
  //     );
  //     const userSimulation: Partial<UserSimulation> = {
  //       assessmentTypeId: assessmentType._id,
  //       instructions: [],
  //       protocols: [],
  //       studyLogs: [],
  //       usageTime: 0,
  //       attemptCount: assessmentType.baseline.attemptCount,
  //       status: UserSimulationStatus.HasNotStarted,
  //       userId: user._id.toString(),
  //     };

  //     const newUserSimulation = await this.userSimulationsService.create(
  //       userSimulation,
  //     );

  //     return this.userAssessmentCyclesRepository.create({
  //       userSimulationId: newUserSimulation._id?.toString(),
  //       userTrainingIds: [],
  //       userSimulationIds: [],
  //       assessmentCycleId,
  //       assessmentTypeId: assessmentType._id,
  //       userId: user._id,
  //       saleId: null,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async update(body: PatchBody<UserAssessmentCycleDocument>) {
    // create userAssessmentCycleSummary
    await this.userAssessmentCycleSummariesRepository.updateMany(body);
    return this.userAssessmentCyclesRepository.updateMany(body);
  }

  async renewSummary(query: FindQuery<UserAssessmentCycle>) {
    try {
      const data = await this.userAssessmentCyclesRepository.renewFind(query);
      const userAssessmentCycle = data?.length > 0 ? data[0] : null;
      const lastDistributedAt = new Date(0, 0, 1);
      if (userAssessmentCycle) {
        const userBaseline = userAssessmentCycle?.userBaseline || null;
        const userFollowups = userAssessmentCycle?.userFollowups || [];
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
        if (userBaseline) {
          if (
            (userBaseline.status === UserSimulationStatus.Distributed ||
              userBaseline.status === UserSimulationStatus.Exported ||
              userBaseline.status === UserSimulationStatus.Reviewed) &&
            userBaseline.distributedAt > lastDistributedAt
          ) {
            lastDistributedAt === userBaseline.distributedAt;
          }
        }
        userFollowups.forEach((_userFollowup) => {
          if (
            (_userFollowup.status === UserSimulationStatus.Distributed ||
              _userFollowup.status === UserSimulationStatus.Exported ||
              _userFollowup.status === UserSimulationStatus.Reviewed) &&
            _userFollowup.distributedAt > lastDistributedAt
          ) {
            lastDistributedAt === _userFollowup.distributedAt;
          }
        });
        await this.userAssessmentCycleSummariesRepository.updateOne({
          filter: {
            userAssessmentCycleId: userAssessmentCycle?._id?.toString(),
          },
          update: {
            ...userAssessmentCycle,
            _id: undefined,
            status,
            completedAt: status === 'Completed' ? lastDistributedAt : undefined,
          },
        });
      }
      return true;
    } catch (e) {
      console.error({ e });
      return false;
    }
  }

  async cascadeDelete(userAssessmentCycleId: string) {
    try {
      const userAssessmentCycle =
        await this.userAssessmentCyclesRepository.findOne({
          filter: { _id: userAssessmentCycleId },
        });
      if (!userAssessmentCycle) {
        return false;
      }
      const userSimulationIds = [
        userAssessmentCycle.userBaselineId,
        ...userAssessmentCycle.userFollowupIds,
      ];
      // delete userBaseline & userFollowups
      await this.userSimulationsService.delete({
        filter: {
          _id: [
            ...userAssessmentCycle.userFollowupIds,
            userAssessmentCycle.userBaselineId,
          ],
        },
      });
      // delete userTrainings
      await this.userTrainingsService.delete({
        filter: {
          _id: [...userAssessmentCycle.userTrainingIds],
        },
      });
      // delete userAssessmentCycle
      await this.userAssessmentCyclesRepository.deleteOne({
        filter: {
          _id: userAssessmentCycleId,
        },
      });
      // delete userAssessmentCycleSummary
      await this.userAssessmentCycleSummariesRepository.deleteOne({
        filter: {
          userAssessmentCycleId,
        },
      });
      // delete assessment
      // await this.assessmentsService.delete({
      //   filter: {
      //     userSimulationId: { $in: userSimulationIds },
      //   },
      // });
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async delete(query: DeleteQuery<UserAssessmentCycleDocument>) {
    await this.userAssessmentCycleSummariesRepository.deleteOne(query);
    return this.userAssessmentCyclesRepository.deleteOne(query);
  }

  findById(userAssessmentCycleId: string) {
    return this.userAssessmentCyclesRepository.findOne({
      filter: {
        _id: userAssessmentCycleId,
      },
    });
  }
}
