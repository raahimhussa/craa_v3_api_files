import { ApiProperty } from '@nestjs/swagger';

export default class CreateUserAssessmentCycleDto {
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
  readonly userBaselineId?: string;
  @ApiProperty()
  readonly userTrainingIds?: string[];
  @ApiProperty()
  readonly userFollowupIds?: string[];
  @ApiProperty()
  readonly userId: string;
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
