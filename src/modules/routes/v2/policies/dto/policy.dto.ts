import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class PolicyDto {
  @ApiProperty()
  readonly _id: any;

  @ApiProperty()
  label: string;

  @ApiProperty()
  allowedPages: Array<any>;

  @ApiProperty()
  allowedActions: Array<any>;

  @ApiProperty()
  allowedField: Array<any>;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
