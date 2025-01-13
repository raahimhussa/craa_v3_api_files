import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export class Tutorials {
  @Prop()
  followupUrl?: string;

  @Prop()
  baselineUrl?: string;

  @Prop()
  trainingUrl?: string;
}

export enum AssessmentCycleType {
  Normal = 'NORMAL',
  Prehire = 'PREHIRE',
}
/**
 * @description 해당 계층 구조로 등록됩니다.
 *  Clients -BusinessUnits - Sales - AssessmentCycles - AssessmentTypes - Simulation,Simulations,Trannings
 */
@Schema({ collection: 'assessmentCycles' })
export class AssessmentCycle {
  readonly _id!: any;

  /** AC Name */
  @Prop({ required: false })
  name!: string;

  /**
   * @AssessmentCycleType -> NORMAL, PREHIRE 두가지 존재하고 PREHIRE의 경우 프론트에서 베이스라인만 보입니다.
   * */
  @Prop({ required: false })
  type!: string;

  /**
   * @튜토리얼 유튜브 링크 저장 경로
   */
  @Prop({
    required: true,
    default: {
      followupUrl: '',
      baselineUrl: '',
      trainingUrl: '',
    },
  })
  tutorials!: Tutorials;

  /**
   * @description AccessmentCycles은 ACTypes을 여러개 가지고 있을 수 있고 회원가입시 랜덤으로 ACType을 할당합니다.
   */
  @Prop({ required: false, default: [] })
  assessmentTypeIds!: string[];

  @Prop({ required: false, default: false })
  bypass: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now() })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now() })
  updatedAt!: Date;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type AssessmentCycleDocument = AssessmentCycle & Document;

export const AssessmentCycleSchema = SchemaFactory.createForClass(
  AssessmentCycle,
).set('versionKey', false);
