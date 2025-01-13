import {
  BusinessUnit,
  ClientUnit,
} from '../clientUnits/schemas/clientUnit.schema';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { SimulationType, UserSimulationStatus } from 'src/utils/status';

import { AssessmentCyclesService } from '../assessmentCycles/assessmentCycles.service';
import { AssessmentType } from '../assessmentTypes/schemas/assessmentType.schema';
import AssessmentTypesService from '../assessmentTypes/assessmentTypes.service';
import { ClientUnitsService } from '../clientUnits/clientUnits.service';
import { UserAssessmentCyclesService } from '../userAssessmentCycles/userAssessmentCycles.service';
import { UserSimulation } from '../../v2/userSimulations/schemas/userSimulation.schema';
import UserSimulationsService from '../../v2/userSimulations/userSimulations.service';
import UserTrainingsService from '../../v2/userTrainings/userTrainings.service';
import { generateRandom } from 'src/utils/utils';

@Injectable()
export default class UsersBusinessService {
  constructor(
    private readonly userAssessmentCyclesService: UserAssessmentCyclesService,
    private readonly assessmentCyclesService: AssessmentCyclesService,
    private readonly assessmentTypesService: AssessmentTypesService,
    private readonly userSimulationsService: UserSimulationsService,
    private readonly userTrainingsService: UserTrainingsService,
    private readonly clientUnitsService: ClientUnitsService,
  ) {}

  public async createUserAssessmentCycle({
    clientUnitId,
    businessUnit,
    userId,
    assessmentTypeIndex,
    countryId,
  }: {
    clientUnitId: string;
    businessUnit?: BusinessUnit;
    userId: string;
    assessmentTypeIndex?: number;
    countryId: string;
  }) {
    if (!businessUnit) return false;

    //NOTE - businessUnit은 보통 1개만 할당됨
    await Promise.all(
      businessUnit.businessCycles.map(async (_businessCycles) => {
        const assessmentCycleId = _businessCycles.assessmentCycleId;

        const assessmentCycle = await this.assessmentCyclesService.findById(
          assessmentCycleId,
        );

        const maxLimit = assessmentCycle?.assessmentTypeIds?.length;

        const randomIndex =
          typeof assessmentTypeIndex === 'number'
            ? assessmentTypeIndex > maxLimit! - 1
              ? 0
              : assessmentTypeIndex < 0
              ? 0
              : assessmentTypeIndex
            : generateRandom(maxLimit);

        const assessmentTypeId =
          assessmentCycle?.assessmentTypeIds[randomIndex]!;

        const assessmentType = (await this.assessmentTypesService.findById(
          assessmentTypeId,
        )) as AssessmentType;

        const userBaseline = await this.createUserBaseline({
          userId: userId.toString(),
          assessmentType,
        });

        const userFollowupIds = await this.createUserFollowups({
          userId: userId.toString(),
          assessmentType,
        });

        const userTrainingIds = await this.createUserTrainings({
          userId: userId.toString(),
          assessmentCycleId,
          assessmentType,
        });

        await this.userAssessmentCyclesService.create({
          userBaselineId: userBaseline?._id,
          userTrainingIds: userTrainingIds,
          userFollowupIds,
          clientUnitId,
          businessUnitId: businessUnit._id.toString(),
          businessCycleId: _businessCycles._id.toString(),
          assessmentCycleId,
          assessmentTypeId,
          isSimTutorialViewed: false,
          isTrainingTutorialViewed: false,
          simTutorialDuration: 0,
          trainingTutorialDuration: 0,
          userId: userId.toString(),
          countryId,
          bypass: assessmentCycle?.bypass ? true : false,
        });
      }),
    );

    return true;
  }

  public async createUserAssessmentCycleManually({
    clientUnitId,
    businessUnitId,
    businessCycleId,
    assessmentTypeId,
    userId,
    countryId,
    bypass,
  }: {
    clientUnitId: string;
    businessUnitId: string;
    businessCycleId: string;
    assessmentTypeId: string;
    userId: string;
    countryId: string;
    bypass: boolean;
  }) {
    const previousUserAssessmentCycle =
      await this.userAssessmentCyclesService.find({
        filter: {
          userId,
          countryId,
          clientUnitId,
          businessUnitId,
          businessCycleId,
          isDeleted: false,
        },
      });
    // 기존에 같은 assessmentCycle로 생성된것이 있으면 종료
    if (previousUserAssessmentCycle.length > 0) {
      throw new ForbiddenException(
        'An Assessment Type already has been assigned from same assessment Cycle.',
      );
    }
    const businessCycle = await this.clientUnitsService.readBusinessCycle(
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
    // businessCycle 없으면 종료
    if (!businessCycle) return;

    const assessmentCycleId = businessCycle.assessmentCycleId;

    const assessmentType = (await this.assessmentTypesService.findById(
      assessmentTypeId,
    )) as AssessmentType;

    const userBaseline = await this.createUserBaseline({
      userId: userId.toString(),
      assessmentType,
      // defaultStatus: UserSimulationStatus.HasNotAssigned,
      defaultStatus: UserSimulationStatus.Assigned,
    });

    const userFollowupIds = await this.createUserFollowups({
      userId: userId.toString(),
      assessmentType,
    });

    const userTrainingIds = await this.createUserTrainings({
      userId: userId.toString(),
      assessmentCycleId,
      assessmentType,
    });

    await this.userAssessmentCyclesService.create({
      userBaselineId: userBaseline?._id,
      userTrainingIds: userTrainingIds,
      userFollowupIds,
      clientUnitId,
      businessUnitId: businessUnitId,
      businessCycleId: businessCycleId,
      assessmentCycleId,
      assessmentTypeId,
      isSimTutorialViewed: false,
      isTrainingTutorialViewed: false,
      simTutorialDuration: 0,
      trainingTutorialDuration: 0,
      userId: userId.toString(),
      countryId,
      bypass,
    });

    return true;
  }

  public async createUserBaseline({
    userId,
    assessmentType,
    defaultStatus = UserSimulationStatus.Assigned,
  }: {
    userId: string;
    assessmentType: AssessmentType;
    defaultStatus?: UserSimulationStatus;
  }) {
    const userSimulation: Partial<UserSimulation> = {
      simulationType: SimulationType.Baseline,
      simulationId: assessmentType.baseline.simulationId,
      domainId: '',
      instructions: [],
      protocols: [],
      studyLogs: [],
      usageTime: 0,
      assignedAt: new Date(),
      attemptCount: assessmentType.baseline.attemptCount,
      testTime: assessmentType.baseline.testTime,
      minimumHour: assessmentType.baseline.minimumHour,
      deadline: assessmentType.baseline.deadline,
      status: defaultStatus,
      userId: userId,
    };

    return await this.userSimulationsService.create(userSimulation);
  }

  public async createUserFollowups({
    userId,
    assessmentType,
  }: {
    userId: string;
    assessmentType: AssessmentType;
  }) {
    const userFollowups = await Promise.all(
      assessmentType.followups.map((followup) => {
        const userSimulation: Partial<UserSimulation> = {
          simulationType: SimulationType.Followup,
          simulationId: followup.simulationId,
          domainId: followup.domain._id,
          instructions: [],
          protocols: [],
          studyLogs: [],
          usageTime: 0,
          attemptCount: followup.attemptCount,
          testTime: followup.testTime,
          minimumHour: followup.minimumHour,
          deadline: followup.deadline,
          status: UserSimulationStatus.HasNotAssigned,
          userId: userId,
        };
        return this.userSimulationsService.create(userSimulation);
      }),
    );
    return userFollowups.map(
      (_userSimulation) => _userSimulation?._id.toString() || '',
    );
  }

  public async createUserTrainings({
    userId,
    assessmentCycleId,
    assessmentType,
  }: {
    userId: string;
    assessmentCycleId: string;
    assessmentType: AssessmentType;
  }) {
    return await Promise.all(
      assessmentType.trainings.map((training) => {
        return this.userTrainingsService.create(
          assessmentCycleId,
          assessmentType._id,
          training._id,
          userId,
          training.domain._id,
        );
      }),
    );
  }
}
