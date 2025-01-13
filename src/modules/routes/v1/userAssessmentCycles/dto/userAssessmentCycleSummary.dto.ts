import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/users.schema';
import { UserSimulation } from 'src/modules/routes/v2/userSimulations/schemas/userSimulation.schema';
import { UserTraining } from 'src/modules/routes/v2/userTrainings/schemas/userTraining.schema';

export default class CreateUserAssessmentCycleSummaryDto {
  @ApiProperty()
  readonly userAssessmentCycleId: string;
  @ApiProperty()
  readonly assessmentCycleId: string;
  @ApiProperty()
  readonly assessmentTypeId: string;
  @ApiProperty()
  readonly clientUnitId: string;
  @ApiProperty()
  readonly businessUnitId: string;
  @ApiProperty()
  readonly countryId: string;
  @ApiProperty()
  readonly businessCycleId: string;
  @ApiProperty()
  readonly userBaseline?: UserSimulation;
  @ApiProperty()
  readonly userTrainings?: UserTraining[];
  @ApiProperty()
  readonly userFollowups?: UserSimulation[];
  @ApiProperty()
  readonly user?: any;
  @ApiProperty()
  readonly isSimTutorialViewed: boolean;
  @ApiProperty()
  readonly isTrainingTutorialViewed: boolean;
  @ApiProperty()
  readonly simTutorialDuration: number;
  @ApiProperty()
  readonly trainingTutorialDuration: number;
  @ApiProperty()
  readonly bypass: boolean;
  @ApiProperty()
  readonly isDeleted?: boolean;
  @ApiProperty()
  readonly createdAt?: Date;
  @ApiProperty()
  readonly updatedAt?: Date;
}
