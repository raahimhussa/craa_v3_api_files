import { Document, Schema as _Schema } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';

import { AssessmentStatus } from 'src/utils/status';

export class Result {
  scoreByDomain?: Array<any>;
  scoreByMainDomain?: Array<any>;
  identifiedScoreBySeverity?: Array<any>;
  identifiedScoreByDomain?: Array<any>;
  identifiedScoreByMainDomain?: Array<any>;
  identifiedAnswers?: Array<any>;
  notIdentifiedAnswers?: Array<any>;
}

/**
 * @description Simulation은 끝내고 제출하면 생성되는 '평가'
 */
@Schema({ collection: 'assessments' })
export class Assessment {
  @Prop({ type: _Schema.Types.ObjectId })
  _id: _Schema.Types.ObjectId;

  // userBaselineId or userFollowupId
  @Prop({ required: false, default: null })
  userSimulationId: string;

  // 상태
  @Prop({
    required: false,
    default: AssessmentStatus.Pending,
  })
  status: string;

  // 1채점자
  @Prop({
    required: false,
    type: raw({
      _id: _Schema.Types.String,
      status: _Schema.Types.String,
      scoringTime: _Schema.Types.Number,
    }),
  })
  firstScorer: {
    _id: string;
    status: string;
    scoringTime: number;
  };

  // 2채점자
  @Prop({
    required: false,
    type: raw({
      _id: _Schema.Types.String,
      status: _Schema.Types.String,
      scoringTime: _Schema.Types.Number,
    }),
  })
  secondScorer: {
    _id: string;
    status: string;
    scoringTime: number;
  };

  // 중재자
  @Prop({
    required: false,
    type: raw({
      _id: _Schema.Types.String,
      status: _Schema.Types.String,
    }),
  })
  adjudicator: {
    _id: string;
    status: string;
  };

  // 급행(최우선 채점)
  @Prop({ required: false, default: false })
  isExpedited: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  // 급행(퍼블리쉬시간 채점 점수를 user가 확인가능)
  @Prop({ required: false, default: null })
  publishedAt: Date;

  // 급행(퍼블리쉬시간 채점 점수를 user가 확인가능, Tranning할당 이부분은 데이비드에게 자세히 물어보는 것을 권장)
  @Prop({ required: false, default: null })
  distributedAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;
}

export type AssessmentDocument = Assessment & Document;

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
