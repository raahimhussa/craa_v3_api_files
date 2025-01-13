import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

/**
 * @description User와 AssessmentCycle을 연결하는 Collection입니다.
 */
@Schema({ collection: 'userAssessmentCycles' })
export class UserAssessmentCycle {
  /**
   * @description User에게 할당된 ACId
   */
  @Prop({ required: false, default: '' })
  assessmentCycleId: string;

  /**
   * @description User에게 할당된 ACTypeId, AC에 있는 ACTypeIds중 하나가 할당됩니다.
   */
  @Prop({
    required: false,
    default: '',
  })
  assessmentTypeId: string;

  /**
   * @description Sale(판매)는 클라이언트 할당 정보를 담고 있습니다.
   */
  @Prop({
    required: false,
    default: '',
  })
  clientUnitId: string;

  @Prop({
    required: false,
    default: '',
  })
  businessUnitId: string;

  @Prop({
    required: false,
    default: '',
  })
  businessCycleId: string;
  @Prop({
    required: false,
    default: '',
  })
  countryId: string;
  /**
   * @description userBaselineId입니다.
   **/
  @Prop({ required: false, default: '' })
  userBaselineId: string;

  /**
   * @description userTrainingIds입니다.
   **/
  @Prop({
    required: false,
    default: [],
  })
  userTrainingIds: string[];

  /**
   * @description userFollowupIds입니다.
   *  */
  @Prop({
    required: false,
    default: [],
  })
  userFollowupIds: string[];

  /**
   * @description 유저
   *  */
  @Prop({ required: false, default: '' })
  userId: string;

  @Prop({ required: false, default: false })
  isSimTutorialViewed: boolean;
  @Prop({ required: false, default: false })
  isTrainingTutorialViewed: boolean;
  @Prop({ required: false, default: false })
  isBaselineTour: boolean;
  @Prop({ required: false, default: false })
  isTrainingTour: boolean;
  @Prop({ required: false, default: false })
  isViewportTour: boolean;
  @Prop({ required: false, default: false })
  isTrainingViewTour: boolean;
  @Prop({ required: false, default: false })
  isTrainingMainTour: boolean;

  @Prop({ required: false, default: 0 })
  simTutorialDuration: number;

  @Prop({ required: false, default: 0 })
  trainingTutorialDuration: number;

  @Prop({ required: false, default: false })
  verified: boolean;

  @Prop({ required: false, default: false })
  signedOff: boolean;
  @Prop({ required: false, default: null, type: Date })
  signedOffDate: Date | null;

  @Prop({ required: false, default: false })
  invoiced: boolean;

  @Prop({ required: false, default: null, type: Date })
  invoicedDate: Date | null;

  @Prop({ required: false, default: false })
  bypass: boolean;

  @Prop({ required: false, default: '' })
  grade: string;

  @Prop({ required: false, default: false })
  minimumEffort?: boolean;

  @Prop({ required: false, default: false })
  collaborated?: boolean;

  @Prop({
    required: false,
    default: false,
  })
  isDeleted: boolean;

  @Prop({ required: false, default: '' })
  status?: string;

  @Prop({
    required: false,
    default: null,
  })
  completeAt: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    required: false,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({
    required: false,
    default: false,
  })
  isDemo: boolean;
}

export type UserAssessmentCycleDocument = UserAssessmentCycle & Document;

export const UserAssessmentCycleSchema = SchemaFactory.createForClass(
  UserAssessmentCycle,
).set('versionKey', false);
