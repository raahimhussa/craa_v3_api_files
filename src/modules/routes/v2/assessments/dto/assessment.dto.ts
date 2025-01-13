import { ApiProperty } from '@nestjs/swagger';
import { AssessmentStatus } from 'src/utils/status';

export default class AssessmentDto {
  @ApiProperty()
  _id: any;

  @ApiProperty()
  userSimulationId: string;

  @ApiProperty()
  status: AssessmentStatus;

  @ApiProperty()
  firstScorer: {
    _id: string;
    status: string;
  };

  @ApiProperty()
  secondScorer: {
    _id: string;
    status: string;
  };

  @ApiProperty()
  adjudicator: {
    _id: string;
    status: string;
  };

  @ApiProperty()
  isExpedited: false;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty()
  createdAt!: Date;

  updatedAt!: Date;
}
