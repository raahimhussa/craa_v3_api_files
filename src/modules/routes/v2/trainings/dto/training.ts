import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Pages } from '../schemas/training.schema';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class TrainingDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  coverImage: string;

  @ApiProperty()
  progressOption: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty()
  pages: Pages;

  @ApiProperty()
  isActivated: boolean;
}
