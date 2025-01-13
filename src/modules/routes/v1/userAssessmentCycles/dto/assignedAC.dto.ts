import { ApiProperty } from '@nestjs/swagger';

export default class AssignedAC {
  @ApiProperty()
  readonly assessmentCycleId: string;

  @ApiProperty()
  readonly userId: string;
}
