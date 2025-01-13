import { ApiProperty } from '@nestjs/swagger';
export default class ViewportDto {
  @ApiProperty()
  index: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  simulationId: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
