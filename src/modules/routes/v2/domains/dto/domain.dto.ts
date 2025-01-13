import { ApiProperty } from '@nestjs/swagger';
export default class DomainDto {
  readonly _id?: any;

  @ApiProperty()
  name: string;

  @ApiProperty()
  visibleId: number;

  @ApiProperty()
  parentId: string;

  @ApiProperty()
  depth: number;

  @ApiProperty()
  seq: number;

  @ApiProperty()
  followupNumber: number;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
