import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { AnswerStatus } from 'src/utils/status';
import { Document } from 'mongoose';

export class Scoring {
  firstScorer: {
    scorerId: string;
    noteId: string;
    answerStatus: AnswerStatus;
    updatedAt: Date;
  };
  secondScorer: {
    scorerId: string;
    noteId: string;
    answerStatus: AnswerStatus;
    updatedAt: Date;
  };
  adjudicator: {
    scorerId: string;
    noteId: string;
    answerStatus: AnswerStatus;
    updatedAt: Date;
  };
}

/**
 * @description 시험의 정답들
 */
@Schema({ collection: 'answers' })
export class Answer {
  readonly _id?: any;

  @Prop({ required: false, default: '' })
  userSimulationId: string;
  /**
   * @description 노트Id(유저가 작성한 노트를 연결)
   */
  // @Prop({ required: false, default: '' })
  // noteId: string;

  /**
   * @description findingId는 유저가 작성한 노트와 비교하는 답지개념
   */
  @Prop({ required: false, default: '' })
  findingId: string;

  /**
   * @description 채점자가 해당 정답이 맞았는지 틀렸는지 상태변경
   */
  // @Prop({ required: true, enum: AnswerStatus, default: AnswerStatus.NotScored })
  // status: AnswerStatus;

  /**
   * @description 채점자ID
   */
  // @Prop({ required: true })
  // scorerId: string;

  @Prop({ required: true })
  scoring: Scoring;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;
}

export type AnswerDocument = Answer & Document;

export const AnswerSchema = SchemaFactory.createForClass(Answer);
