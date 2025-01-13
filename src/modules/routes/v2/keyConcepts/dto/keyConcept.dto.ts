import { ApiProperty } from '@nestjs/swagger';
export default class KeyConceptDto {
  @ApiProperty()
  readonly _id!: any;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
