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
import DashboardRepository from './dashboard.repository';
import { Simulation } from '../../v1/simulations/schemas/simulation.schema';
import { User } from '../../v1/users/schemas/users.schema';
import { UserAssessmentCyclesService } from '../../v1/userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import { getFormattedTime } from 'src/utils/utils';

@Injectable()
export default class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,

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
      const dashboards = await this.getDatas(query);
      return dashboards;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  getISOWeek(date) {
    const weekStart: any = new Date(date.getFullYear(), 0, 4);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7) + 3);
    const weekNumber =
      Math.floor((date - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return weekNumber;
  }

  async getDatas(query: MongoQuery<any>) {
    try {
      const _ = require('lodash');
      const datas = await this.dashboardRepository.find(query);
      const groupedData = _.groupBy(datas, 'user._id');
      const currentDate = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

      //total accounts
      const userTotalCnt = Object.keys(groupedData)?.length;
      const userYTDCnt = Object.values(groupedData)?.filter((arr) => {
        const year = new Date(arr[0]?.user?.createdAt).getFullYear();
        return currentDate.getFullYear() === year;
      }).length;
      const userLastweekCnt = Object.values(groupedData)?.filter((arr) => {
        const createdAt = new Date(arr[0].user.createdAt);
        return createdAt >= sevenDaysAgo && createdAt <= currentDate;
      }).length;

      //completed sim process
      const simCompletedUsers = Object.values(groupedData)?.filter(
        (arr: any) => {
          return arr.every((asc: any) => asc.status === 'Completed');
        },
      );
      const simCompletedTotalCnt = simCompletedUsers.length;
      const simCompletedYTDCnt = Object.values(groupedData)?.filter(
        (arr: any) => {
          const year = new Date(arr[0].user.createdAt).getFullYear();
          return (
            arr.every((asc: any) => asc.status === 'Completed') &&
            currentDate.getFullYear() === year
          );
        },
      ).length;
      const simCompletedLastweekCnt = Object.values(groupedData)?.filter(
        (arr: any) => {
          const createdAt = new Date(arr[0].user.createdAt);
          return (
            arr.every((asc: any) => asc.status === 'Completed') &&
            createdAt >= sevenDaysAgo &&
            createdAt <= currentDate
          );
        },
      ).length;

      //ongoing

      const ongoingTotalCnt = Object.values(groupedData)?.filter((arr: any) => {
        return arr.some((asc: any) => asc.status !== 'Completed');
      }).length;
      const ongoingMonthCnt = Object.values(groupedData)?.filter((arr: any) => {
        const createdAt = new Date(arr[0]?.user?.createdAt);

        // Compare year and month of createdAt with threeMonthsAgo
        if (
          arr?.some((asc: any) => asc.status !== 'Completed') &&
          createdAt.getFullYear() < threeMonthsAgo.getFullYear()
        ) {
          return true;
        } else if (
          arr?.some((asc: any) => asc.status !== 'Completed') &&
          createdAt.getFullYear() === threeMonthsAgo.getFullYear() &&
          createdAt.getMonth() <= threeMonthsAgo.getMonth()
        ) {
          return true;
        }

        return false;
      }).length;

      //pending verification
      const pendingUserTotalCnt = simCompletedUsers.filter((arr: any) => {
        return arr.some((asc: any) => !asc.verified);
      }).length;
      const pendingUserWeekCnt = simCompletedUsers.filter((arr: any) => {
        return arr.some((asc: any) => {
          const simulationProcessCompleted = new Date(
            asc.userFollowups
              .filter(
                (_userFollowup: any) =>
                  _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
              )
              .reduce((acc: Date | undefined, cur: any) => {
                if (acc === undefined) return cur.publishedAt;
                if (cur.publishedAt > acc) return cur.publishedAt;
                return acc;
              }, undefined),
          );
          const aWeekAgo = new Date();
          aWeekAgo.setDate(currentDate.getDate() - 7);
          // Compare year and month of createdAt with threeMonthsAgo
          if (
            simulationProcessCompleted.getFullYear() < aWeekAgo.getFullYear() &&
            !asc.verified
          ) {
            return true;
          } else if (
            simulationProcessCompleted.getFullYear() ===
              aWeekAgo.getFullYear() &&
            this.getISOWeek(simulationProcessCompleted) <
              this.getISOWeek(aWeekAgo) &&
            !asc.verified
          ) {
            return true;
          }
          return false;
        });
      }).length;
      // const pendingUserMonthCnt = 0;

      //pass rate
      const usersWithResults = Object.values(groupedData)?.filter(
        (arr: any) => {
          return arr.some(
            (asc: any) => asc.grade !== undefined && asc.grade !== '',
          );
        },
      );
      const passRateAllDomains =
        (usersWithResults?.filter((arr: any) => {
          return arr.some((asc: any) => asc.grade === 'Pass I');
        }).length /
          usersWithResults.length) *
        100;

      const usersRecentThreeMonths = usersWithResults?.filter((arr: any) => {
        return arr.some((asc: any) => {
          const simulationProcessCompleted = new Date(
            asc.userFollowups
              .filter(
                (_userFollowup: any) =>
                  _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
              )
              .reduce((acc: Date | undefined, cur: any) => {
                if (acc === undefined) return cur.publishedAt;
                if (cur.publishedAt > acc) return cur.publishedAt;
                return acc;
              }, undefined),
          );
          return (
            simulationProcessCompleted >= threeMonthsAgo &&
            simulationProcessCompleted <= currentDate
          );
        });
      });

      const passRateAllDomainsThreeMonths =
        usersRecentThreeMonths.length !== 0
          ? (usersRecentThreeMonths?.filter((arr: any) => {
              return arr.some((asc: any) => {
                const simulationProcessCompleted = new Date(
                  asc.userFollowups
                    .filter(
                      (_userFollowup: any) =>
                        _userFollowup.status !==
                        UserSimulationStatus.HasNotAssigned,
                    )
                    .reduce((acc: Date | undefined, cur: any) => {
                      if (acc === undefined) return cur.publishedAt;
                      if (cur.publishedAt > acc) return cur.publishedAt;
                      return acc;
                    }, undefined),
                );
                return (
                  simulationProcessCompleted >= threeMonthsAgo &&
                  simulationProcessCompleted <= currentDate &&
                  asc.grade === 'Pass I'
                );
              });
            }).length /
              usersRecentThreeMonths.length) *
            100
          : 0;

      const usersRecentPrevThreeMonths = usersWithResults?.filter(
        (arr: any) => {
          return arr.some((asc: any) => {
            const simulationProcessCompleted = new Date(
              asc.userFollowups
                .filter(
                  (_userFollowup: any) =>
                    _userFollowup.status !==
                    UserSimulationStatus.HasNotAssigned,
                )
                .reduce((acc: Date | undefined, cur: any) => {
                  if (acc === undefined) return cur.publishedAt;
                  if (cur.publishedAt > acc) return cur.publishedAt;
                  return acc;
                }, undefined),
            );
            const startDate = new Date();
            const endDate = new Date();
            startDate.setMonth(currentDate.getMonth() - 6);
            endDate.setMonth(currentDate.getMonth() - 3);

            return (
              simulationProcessCompleted >= startDate &&
              simulationProcessCompleted <= endDate
            );
          });
        },
      );

      const passRateAllDomainsPrevThreeMonths =
        usersRecentPrevThreeMonths.length !== 0
          ? (usersRecentPrevThreeMonths?.filter((arr: any) => {
              return arr.some((asc: any) => {
                const simulationProcessCompleted = new Date(
                  asc.userFollowups
                    .filter(
                      (_userFollowup: any) =>
                        _userFollowup.status !==
                        UserSimulationStatus.HasNotAssigned,
                    )
                    .reduce((acc: Date | undefined, cur: any) => {
                      if (acc === undefined) return cur.publishedAt;
                      if (cur.publishedAt > acc) return cur.publishedAt;
                      return acc;
                    }, undefined),
                );
                const startDate = new Date();
                const endDate = new Date();
                startDate.setMonth(currentDate.getMonth() - 6);
                endDate.setMonth(currentDate.getMonth() - 3);

                return (
                  simulationProcessCompleted >= startDate &&
                  simulationProcessCompleted <= endDate &&
                  asc.grade === 'Pass I'
                );
              });
            }).length /
              usersRecentPrevThreeMonths.length) *
            100
          : 0;

      // const passRateProtocolRequirements =
      //   (usersWithResults?.filter((arr: any) => {
      //     return arr.some((asc: any) => {});
      //   }).length /
      //     usersWithResults.length) *
      //   100;

      let domains = await this.domainsService.find({
        filter: {
          isDelted: false,
          depth: 0,
        },
      });

      let passCntPerDomains: any = {};
      let passCntPerDomainsPrevThreeMonths: any = {};
      domains.map((domain: any) => (passCntPerDomains[domain._id] = 0));
      domains.map(
        (domain: any) => (passCntPerDomainsPrevThreeMonths[domain._id] = 0),
      );
      let passRatePerDomains: any = {};
      let passRatePerDomainsPrevThreeMonths: any = {};

      usersRecentThreeMonths?.map((arr: any) => {
        // return arr.some((asc: any) => asc.grade === 'Pass I');
        Object.keys(passCntPerDomains).map((domainId: string) => {
          const isTrue = arr?.some((asc: any) => {
            const baseline =
              asc?.userBaseline?.results?.scoreByMainDomain?.find(
                (el: any) => el.domainId === domainId,
              );
            if (baseline?.score >= baseline?.minScore) {
              return true;
            } else {
              const followup = asc?.userFollowups?.find(
                (follow: any) => follow.domainId === domainId,
              );
              const followupResult = followup?.results?.scoreByMainDomain?.find(
                (el: any) => el.domainId === domainId,
              );
              if (followupResult?.score >= followupResult?.minScore) {
                return true;
              }
              return false;
            }
          });
          if (isTrue) {
            passCntPerDomains[domainId] += 1;
          }
        });
      });
      Object.keys(passCntPerDomains).map((domainId) => {
        passRatePerDomains[domainId] =
          (passCntPerDomains[domainId] / usersRecentThreeMonths.length) * 100;
      });
      usersRecentPrevThreeMonths?.map((arr: any) => {
        // return arr.some((asc: any) => asc.grade === 'Pass I');
        Object.keys(passCntPerDomainsPrevThreeMonths).map(
          (domainId: string) => {
            const isTrue = arr?.some((asc: any) => {
              const baseline =
                asc?.userBaseline?.results?.scoreByMainDomain?.find(
                  (el: any) => el.domainId === domainId,
                );
              if (baseline?.score >= baseline?.minScore) {
                return true;
              } else {
                const followup = asc?.userFollowups?.find(
                  (follow: any) => follow.domainId === domainId,
                );
                const followupResult =
                  followup?.results?.scoreByMainDomain?.find(
                    (el: any) => el.domainId === domainId,
                  );
                if (followupResult?.score >= followupResult?.minScore) {
                  return true;
                }
                return false;
              }
            });
            if (isTrue) {
              passCntPerDomainsPrevThreeMonths[domainId] += 1;
            }
          },
        );
      });
      Object.keys(passCntPerDomainsPrevThreeMonths).map((domainId) => {
        passRatePerDomainsPrevThreeMonths[domainId] =
          (passCntPerDomainsPrevThreeMonths[domainId] /
            usersRecentPrevThreeMonths.length) *
          100;
      });

      // pass rate by vendor
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
      const usersPassedYear = [];
      const usersWithResultYear = [];
      usersWithResults?.map((arr: any) => {
        arr.map((asc: any) => {
          const simulationProcessCompleted = new Date(
            asc.userFollowups
              .filter(
                (_userFollowup: any) =>
                  _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
              )
              .reduce((acc: Date | undefined, cur: any) => {
                if (acc === undefined) return cur.publishedAt;
                if (cur.publishedAt > acc) return cur.publishedAt;
                return acc;
              }, undefined),
          );

          if (
            simulationProcessCompleted >= twelveMonthsAgo &&
            simulationProcessCompleted <= currentDate &&
            asc.grade !== undefined &&
            asc.grade !== ''
          ) {
            usersWithResultYear.push(asc);
          }
          if (
            simulationProcessCompleted >= twelveMonthsAgo &&
            simulationProcessCompleted <= currentDate &&
            asc.grade === 'Pass I'
          ) {
            usersPassedYear.push(asc);
          }
        });
      });
      const groupedByVendorPass: any = query.options?.isPfizer
        ? _.groupBy(usersPassedYear, (value) => value.clientUnit.name)
        : _.groupBy(usersPassedYear, (value) => value.businessUnitId);
      const groupedByVendor: any = query.options?.isPfizer
        ? _.groupBy(usersWithResultYear, (value) => value.clientUnit.name)
        : _.groupBy(usersWithResultYear, (value) => value.businessUnitId);

      const groupedByVendorMonth = {};
      const groupedByVendorMonthPass = {};

      for (const monthKey in groupedByVendor) {
        groupedByVendorMonth[monthKey] = _.groupBy(
          groupedByVendor[monthKey],
          (value) => {
            const simulationProcessCompleted = new Date(
              value.userFollowups
                .filter(
                  (_userFollowup: any) =>
                    _userFollowup.status !==
                    UserSimulationStatus.HasNotAssigned,
                )
                .reduce((acc: Date | undefined, cur: any) => {
                  if (acc === undefined) return cur.publishedAt;
                  if (cur.publishedAt > acc) return cur.publishedAt;
                  return acc;
                }, undefined),
            );
            return `${simulationProcessCompleted.getFullYear()}-${
              simulationProcessCompleted.getMonth() + 1
            }`;
          },
        );
      }
      for (const monthKey in groupedByVendorPass) {
        groupedByVendorMonthPass[monthKey] = _.groupBy(
          groupedByVendorPass[monthKey],
          (value) => {
            const simulationProcessCompleted = new Date(
              value.userFollowups
                .filter(
                  (_userFollowup: any) =>
                    _userFollowup.status !==
                    UserSimulationStatus.HasNotAssigned,
                )
                .reduce((acc: Date | undefined, cur: any) => {
                  if (acc === undefined) return cur.publishedAt;
                  if (cur.publishedAt > acc) return cur.publishedAt;
                  return acc;
                }, undefined),
            );
            return `${simulationProcessCompleted.getFullYear()}-${
              simulationProcessCompleted.getMonth() + 1
            }`;
          },
        );
      }
      // { name: 'ICON', data: [25, 41, 54, 51, 44, 62, 54, 91, 150] },
      let passRateByVendor = [];
      let total = {};
      let totalPass = {};
      let passRateByVendorMonths: any = [];
      const nowDate = new Date();
      for (let i = 0; i < 12; i++) {
        nowDate.setMonth(nowDate.getMonth() - 1);
        passRateByVendorMonths.push(
          `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}`,
        );
      }

      Object.keys(groupedByVendorMonth).map((vendor: any) => {
        let obj = {};
        obj['name'] = vendor;
        obj['data'] = [];
        passRateByVendorMonths.sort().map((month: any) => {
          if (
            groupedByVendorMonthPass[vendor] !== undefined &&
            groupedByVendorMonthPass[vendor][month] !== undefined &&
            groupedByVendorMonth[vendor][month] !== undefined
          ) {
            obj['data'].push(
              (
                (groupedByVendorMonthPass[vendor][month].length /
                  groupedByVendorMonth[vendor][month].length) *
                100
              ).toFixed(0),
            );
            if (totalPass[month] === undefined) {
              totalPass[month] = 0;
            }
            totalPass[month] += groupedByVendorMonthPass[vendor][month].length;
            if (total[month] === undefined) {
              total[month] = 0;
            }
            total[month] += groupedByVendorMonth[vendor][month]?.length;
          } else {
            obj['data'].push(0);
          }
        });
        passRateByVendor.push(obj);
      });
      let avgData = [];
      passRateByVendorMonths.sort().map((month: any) => {
        if (totalPass[month] !== undefined && total[month] !== undefined) {
          avgData.push(((totalPass[month] / total[month]) * 100).toFixed(0));
        } else {
          avgData.push(0);
        }
      });
      passRateByVendor.push({ name: 'Average All', data: avgData });

      //breakdown by vendor
      const usersPastThreeMonths = Object.values(groupedData)?.filter((arr) => {
        const createdAt = new Date(arr[0].user.createdAt);
        return createdAt >= threeMonthsAgo && createdAt <= currentDate;
      });
      const breakdownByVendor: any = query.options?.isPfizer
        ? _.groupBy(
            Object.values(usersPastThreeMonths),
            (value) => value[0].clientUnit.name,
          )
        : _.groupBy(
            Object.values(usersPastThreeMonths),
            (value) => value[0].businessUnitId,
          );
      // Object.values(groupedData)?.filter((arr: any) => {
      //   return arr.every((asc: any) => asc.status === 'Completed');
      // });

      //title by vendor
      //SCRA, CRA2, IHCRa/CRA1, total
      let breakdownByTitle: any = [];
      let icon: any = [0, 0, 0, 0];
      let parexel: any = [0, 0, 0, 0];
      let syneos: any = [0, 0, 0, 0];
      let ppd: any = [0, 0, 0, 0];
      let others: any = [0, 0, 0, 0];
      Object.keys(breakdownByVendor).map((vendor) => {
        if (vendor.includes('ICON')) {
          const iconUsers = breakdownByVendor[vendor].filter(
            (user) =>
              user[0].user?.profile?.title !== '' &&
              (user[0].user?.profile?.title === 'SCRA' ||
                user[0].user?.profile?.title === 'CRA 2' ||
                user[0].user?.profile?.title === 'IHCRA' ||
                user[0].user?.profile?.title === 'CRA II' ||
                user[0].user?.profile?.title === 'CRA I' ||
                user[0].user?.profile?.title == 'CRA 1'),
          );
          iconUsers.map((user) => {
            icon[3] += 1;
            if (user[0].user?.profile?.title === 'SCRA') {
              icon[0] += 1;
            } else if (
              user[0].user?.profile?.title === 'CRA 2' ||
              user[0].user?.profile?.title === 'CRA II'
            ) {
              icon[1] += 1;
            } else {
              icon[2] += 1;
            }
          });
        } else if (vendor.includes('Parexel')) {
          const paraxelUsers = breakdownByVendor[vendor].filter(
            (user) =>
              (user[0].user?.profile?.title !== '' &&
                (user[0].user?.profile?.title === 'SCRA' ||
                  user[0].user?.profile?.title === 'CRA 2' ||
                  user[0].user?.profile?.title === 'CRA II' ||
                  user[0].user?.profile?.title === 'CRA I')) ||
              user[0].user?.profile?.title === 'IHCRA',
          );
          paraxelUsers.map((user) => {
            parexel[3] += 1;
            if (user[0].user?.profile?.title === 'SCRA') {
              parexel[0] += 1;
            } else if (
              user[0].user?.profile?.title === 'CRA 2' ||
              user[0].user?.profile?.title === 'CRA II'
            ) {
              parexel[1] += 1;
            } else {
              parexel[2] += 1;
            }
          });
        } else if (vendor.includes('Syneos')) {
          const syneosUsers = breakdownByVendor[vendor].filter(
            (user) =>
              user[0].user?.profile?.title !== '' &&
              (user[0].user?.profile?.title === 'SCRA' ||
                user[0].user?.profile?.title === 'CRA 2' ||
                user[0].user?.profile?.title === 'IHCRA' ||
                user[0].user?.profile?.title === 'CRA II' ||
                user[0].user?.profile?.title === 'CRA I' ||
                user[0].user?.profile?.title === 'CRA 1'),
          );
          syneosUsers.map((user) => {
            syneos[3] += 1;
            if (user[0].user?.profile?.title === 'SCRA') {
              syneos[0] += 1;
            } else if (
              user[0].user?.profile?.title === 'CRA 2' ||
              user[0].user?.profile?.title === 'CRA II'
            ) {
              syneos[1] += 1;
            } else {
              syneos[2] += 1;
            }
          });
        } else if (vendor.includes('PPD')) {
          const ppdUsers = breakdownByVendor[vendor].filter(
            (user) =>
              user[0].user?.profile?.title !== '' &&
              (user[0].user?.profile?.title === 'SCRA' ||
                user[0].user?.profile?.title === 'CRA 2' ||
                user[0].user?.profile?.title === 'IHCRA' ||
                user[0].user?.profile?.title === 'CRA II' ||
                user[0].user?.profile?.title === 'CRA I' ||
                user[0].user?.profile?.title === 'CRA 1'),
          );
          ppdUsers.map((user) => {
            ppd[3] += 1;
            if (user[0].user?.profile?.title === 'SCRA') {
              ppd[0] += 1;
            } else if (
              user[0].user?.profile?.title === 'CRA 2' ||
              user[0].user?.profile?.title === 'CRA II'
            ) {
              ppd[1] += 1;
            } else {
              ppd[2] += 1;
            }
          });
        } else {
          const othersUsers = breakdownByVendor[vendor].filter(
            (user) =>
              user[0].user?.profile?.title !== '' &&
              (user[0].user?.profile?.title === 'SCRA' ||
                user[0].user?.profile?.title === 'CRA 2' ||
                user[0].user?.profile?.title === 'IHCRA' ||
                user[0].user?.profile?.title === 'CRA II' ||
                user[0].user?.profile?.title === 'CRA I' ||
                user[0].user?.profile?.title === 'CRA 1'),
          );
          othersUsers.map((user) => {
            others[3] += 1;
            if (user[0].user?.profile?.title === 'SCRA') {
              others[0] += 1;
            } else if (
              user[0].user?.profile?.title === 'CRA 2' ||
              user[0].user?.profile?.title === 'CRA II'
            ) {
              others[1] += 1;
            } else {
              others[2] += 1;
            }
          });
        }
      });
      const totalTitle = icon[3] + parexel[3] + syneos[3] + ppd[3] + others[3];
      breakdownByTitle.push({
        name: 'SCRA',
        data: [
          Math.ceil((icon[0] / icon[3]) * 100),
          Math.ceil((parexel[0] / parexel[3]) * 100),
          Math.ceil((syneos[0] / syneos[3]) * 100),
          Math.ceil((ppd[0] / ppd[3]) * 100),
          Math.ceil(
            ((icon[0] + parexel[0] + syneos[0] + ppd[0] + others[0]) /
              totalTitle) *
              100,
          ),
        ],
      });
      breakdownByTitle.push({
        name: 'CRA 2',
        data: [
          Math.ceil((icon[1] / icon[3]) * 100),
          Math.ceil((parexel[1] / parexel[3]) * 100),
          Math.ceil((syneos[1] / syneos[3]) * 100),
          Math.ceil((ppd[1] / ppd[3]) * 100),
          Math.ceil(
            ((icon[1] + parexel[1] + syneos[1] + ppd[1] + others[1]) /
              totalTitle) *
              100,
          ),
        ],
      });
      breakdownByTitle.push({
        name: 'IHCRA/CRA 1',
        data: [
          Math.ceil((icon[2] / icon[3]) * 100),
          Math.ceil((parexel[2] / parexel[3]) * 100),
          Math.ceil((syneos[2] / syneos[3]) * 100),
          Math.ceil((ppd[2] / ppd[3]) * 100),
          Math.ceil(
            ((icon[2] + parexel[2] + syneos[2] + ppd[2] + others[2]) /
              totalTitle) *
              100,
          ),
        ],
      });

      //top 10 countries
      const usersWhoPassed = usersRecentThreeMonths?.filter((arr: any) => {
        return arr.some((asc: any) => {
          const simulationProcessCompleted = new Date(
            asc.userFollowups
              .filter(
                (_userFollowup: any) =>
                  _userFollowup.status !== UserSimulationStatus.HasNotAssigned,
              )
              .reduce((acc: Date | undefined, cur: any) => {
                if (acc === undefined) return cur.publishedAt;
                if (cur.publishedAt > acc) return cur.publishedAt;
                return acc;
              }, undefined),
          );
          return (
            simulationProcessCompleted >= threeMonthsAgo &&
            simulationProcessCompleted <= currentDate &&
            asc.grade === 'Pass I'
          );
        });
      });
      const groupedByCountry: any = _.groupBy(
        Object.values(usersWhoPassed),
        (value) => value[0].user.profile.countryId,
      );

      let countryDatas = {};
      Object.keys(groupedByCountry).map((countryId: string) => {
        if (groupedByCountry[countryId].length > 5) {
          countryDatas[countryId] = groupedByCountry[countryId].length;
        }
      });

      return {
        userTotalCnt,
        userYTDCnt,
        userLastweekCnt,
        simCompletedTotalCnt,
        simCompletedYTDCnt,
        simCompletedLastweekCnt,
        ongoingTotalCnt,
        ongoingMonthCnt,
        pendingUserTotalCnt,
        pendingUserWeekCnt,
        passRateAllDomains,
        passRateAllDomainsThreeMonths,
        passRateAllDomainsPrevThreeMonths,
        passRatePerDomains,
        passRatePerDomainsPrevThreeMonths,
        breakdownByVendor,
        countryDatas,
        domains,
        countryTotal: usersWhoPassed.length,
        passRateByVendorMonths,
        passRateByVendor,
        breakdownByTitle,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getExcel(query: MongoQuery<any>) {
    const dashboards = await this.dashboardRepository.find(query);
    const excelData = [] as any[];
    const data = dashboards.map((dashboard) => {
      const clientUnit = dashboard.clientUnit as ClientUnit;
      const user = dashboard.user as User;
      const userBaseline = dashboard.userBaseline as UserSimulation;
      const userBaselineSimulation = dashboard.userBaseline
        .simulation as Simulation;
      const userFollowups = dashboard.userFollowups as UserSimulation[];
      const assessmentType = dashboard.assessmentType as AssessmentType;
      const assessmentCycle = dashboard.assessmentCycle as AssessmentCycle;

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
    try {
      await this.userSimulationsService.update({
        filter: { _id: userSimulationId, isDeleted: false },
        update: {
          $set: {
            testTime: additionalTestTime * 60 * 60,
            attemptCount: additionalAttemptCount,
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
