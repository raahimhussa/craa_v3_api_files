import { ApiProperty } from '@nestjs/swagger';
import { Scoring } from '../schemas/answer.schema';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */

export default class AnswerDto {
  userSimulationId: string;
  findingId: string;
  scoring: Scoring;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDemo?: boolean;
  demoId?: string;
}
