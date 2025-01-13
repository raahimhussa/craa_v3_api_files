import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class CreateFolderDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  depth: number;

  @ApiProperty()
  folderId?: string;

  @ApiProperty()
  expanded: boolean;

  @ApiProperty()
  isActivated: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isDemo: boolean;

  @ApiProperty()
  demoId: string;

  @ApiProperty()
  label: string;
}
