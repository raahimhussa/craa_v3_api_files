import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ClientUnit } from '../../clientUnits/schemas/clientUnit.schema';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/users.schema';
import { UserSimulation } from 'src/modules/routes/v2/userSimulations/schemas/userSimulation.schema';
import { UserTraining } from 'src/modules/routes/v2/userTrainings/schemas/userTraining.schema';

/**
 * @description User와 AssessmentCycle을 연결하는 Collection입니다.
 */
@Schema({ collection: 'userAssessmentCycleSummaries', autoIndex: true })
export class UserAssessmentCycleSummary {
  @Prop({ required: false, default: '' })
  userAssessmentCycleId: string;
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
  })
  clientUnit: ClientUnit;

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
  @Prop({ required: false, default: null })
  userBaseline: UserSimulation;

  /**
   * @description userTrainingIds입니다.
   **/
  @Prop({
    required: false,
    default: [],
  })
  userTrainings: UserTraining[];

  /**
   * @description userFollowupIds입니다.
   *  */
  @Prop({
    required: false,
    default: [],
  })
  userFollowups: UserSimulation[];

  @Prop({ required: false, default: '' })
  status?: string;

  /**
   * @description 유저
   *  */
  @Prop({ required: false, default: null })
  user: User;

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

  // @Prop({
  //   required: false,
  //   default: null,
  //   index: 1,
  // })
  // submittedAt: Date;
}

export type UserAssessmentCycleSummaryDocument = UserAssessmentCycleSummary &
  Document;

export const UserAssessmentCycleSummarySchema = SchemaFactory.createForClass(
  UserAssessmentCycleSummary,
)
  .set('versionKey', false)
  .index({ 'userBaseline.submittedAt': -1 });
