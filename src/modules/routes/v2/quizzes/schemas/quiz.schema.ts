import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'quizzes' })
export class Quiz {
  readonly _id!: any;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: [] })
  questions: {
    id: string;
    content: string;
    answer: { id: string; content: string; correct: boolean; order: number }[];
    point: number;
    isActivated: boolean;
    order: number;
  }[];

  @Prop({ default: 0 })
  duration?: number;

  @Prop({ default: true })
  isActivated?: boolean;

  // one at a time
  // all at once
  @Prop({ default: true })
  showAllQuizAtOnce: boolean;

  // fixed, random
  @Prop({ default: true })
  isQuestionOrderFixed: boolean;

  // fixed, random
  @Prop({ default: true })
  isAnswerOrderFixed: boolean;

  @Prop({ default: 0 })
  point: number;

  @Prop({ default: 1 })
  possibleAttemptCount: number;

  @Prop({ default: 100 })
  reducePointRateByAttempt: number;

  @Prop({ default: 60 })
  questionDuration: number;

  @Prop({ default: true })
  showTimer: boolean;

  @Prop({ default: 0 })
  showWarningMessageTime: number;

  @Prop({ default: 'remind time check' })
  warningMessage: string;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export type QuizDocument = Quiz & Document;

export const QuizSchema = SchemaFactory.createForClass(Quiz);
