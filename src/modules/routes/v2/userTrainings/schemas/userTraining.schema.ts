import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { UserTrainingStatus } from 'src/utils/status';

export class PageProgresses {
  [pageId: string]: PageProgress;
}

export class PageProgress {
  pageId: string;
  status: UserTrainingStatus;
  quizAnswers: QuizAnswers;
  videoTime: number;
  videoWatchingTime: number;
  quizScore: number;
  screenTime: number;
  totalScore: number;
}

export class UserTrainingSummary {
  allPages: string[];
  completePages: string[];
  videoTime: number;
  videoWatchingTime: number;
  quizScore: number;
  screenTime: number;
}

class QuizAnswers {
  [quizId: string]: QuizAnswer;
}

class QuizAnswer {
  quizId: string;
  answers: string[];
}

@Schema({ collection: 'userTrainings' })
export class UserTraining {
  readonly _id: any;

  @Prop({ required: true })
  userId: string;

  /**
   * @description find your baseline simulation for consistant
   */
  @Prop({ required: false, default: '' })
  assessmentCycleId: string;

  @Prop({ required: false, default: '' })
  assessmentTypeId: string;

  @Prop({ required: true })
  trainingId: string;

  // unique key
  @Prop({ required: false, default: '' })
  domainId: string;
  /**
   * @description assessmentType.baseline.testTime(source) - usageTime = remaingTime
   */
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  usageTime: number;

  @Prop({
    required: true,
    default: UserTrainingStatus.HasNotAssigned,
  })
  status: UserTrainingStatus;

  @Prop({ required: true, default: {} })
  progresses: PageProgresses;

  @Prop({ required: true, default: {} })
  summary: UserTrainingSummary;

  @Prop({
    required: true,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    required: false,
    type: Date,
  })
  startedAt: Date | null;

  @Prop({
    required: false,
    type: Date,
  })
  completedAt: Date | null;

  @Prop({
    required: false,
    type: Date,
  })
  assignedAt: Date;

  @Prop({
    required: true,
    default: Date.now,
    type: Date,
  })
  createdAt: Date;

  @Prop({
    required: true,
    default: Date.now,
    type: Date,
  })
  updatedAt: Date;

  @Prop({ required: false, default: '' })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type UserTrainingDocument = UserTraining & Document;

export const UserTrainingSchema = SchemaFactory.createForClass(UserTraining);
