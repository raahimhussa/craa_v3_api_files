import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class QuizDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  questions: {
    id: string;
    content: string;
    answers: { id: string; content: string; correct: boolean; order: number }[];
    point: number;
    isActivated: boolean;
    order: number;
  }[];

  @ApiProperty()
  isActivated: boolean;

  // one at a time
  // all at once
  @ApiProperty()
  showAllQuizAtOnce: boolean;

  // fixed, random
  @ApiProperty()
  isQuestionOrderFixed: boolean;

  // fixed, random
  @ApiProperty()
  isAnswerOrderFixed: boolean;

  @ApiProperty()
  correctAnswerCount: number;

  @ApiProperty()
  point: number;

  @ApiProperty()
  possibleAttemptCount: number;

  @ApiProperty()
  reducePointRateByAttempt: number;

  @ApiProperty()
  questionDuration: number;

  @ApiProperty()
  showTimer: boolean;

  @ApiProperty()
  showWarningMessageTime: number;

  @ApiProperty()
  warningMessage: string;
}
