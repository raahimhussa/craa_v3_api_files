import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export class PdfFolderDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  isRoot: boolean;

  @ApiProperty()
  isActivated: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PdfFolderCreateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  isRoot?: boolean;

  @ApiProperty()
  isActivated?: boolean;

  @ApiProperty()
  isDeleted?: boolean;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
