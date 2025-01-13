import { ApiProperty } from '@nestjs/swagger';
import { Tutorials } from '../assessmentCycle.schema';

export default class CreateAssessmentCycleDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  tutorials!: Tutorials;

  @ApiProperty()
  assessmentTypeIds!: string[];

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
