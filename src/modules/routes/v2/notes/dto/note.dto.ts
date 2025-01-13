import { ApiProperty } from '@nestjs/swagger';
import { Viewport } from '../../viewports/schemas/viewport.schema';

export default class NoteDto {
  @ApiProperty()
  viewport!: Viewport;
  @ApiProperty()
  logId!: string;
  @ApiProperty()
  text!: string;
  @ApiProperty()
  complianceNote!: {
    taken: number;
    shouldTaken: number;
    percent: number;
  };
  @ApiProperty()
  userId!: string;
  @ApiProperty()
  currentPage!: number;
  @ApiProperty()
  duration!: number;
  @ApiProperty()
  isDeleted!: boolean;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
}
