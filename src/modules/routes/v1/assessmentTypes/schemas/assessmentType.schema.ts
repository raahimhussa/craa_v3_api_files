import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { SimulationType } from 'src/utils/status';

export class AssessmentTypeTraining {
  _id!: string;

  label!: string;

  protocolIds!: Array<string>;

  studyLogIds!: Array<string>;
  domain: any;
}

export class AssessmentTypeSimulation {
  simulationId!: string;

  simulationType!: SimulationType;

  label!: string;

  attemptCount!: number;

  domain: {
    _id: string;
    label: string;
  };

  uuid: string;

  testTime!: number;

  minimumHour!: number;

  deadline!: number;

  protocolIds!: Array<string>;

  instructionIds!: Array<string>;

  studyLogIds!: Array<string>;

  riskManagementIds!: Array<string>;
}
/**
 * @description AssessmentType은 Simulation, Simulation, Training에 대한 정보를 담고 있습니다.
 */
@Schema({ collection: 'assessmentTypes' })
export class AssessmentType {
  readonly _id!: any;

  @Prop({ required: true })
  label!: string;

  @Prop({
    required: true,
  })
  baseline!: AssessmentTypeSimulation;

  @Prop({ required: true, default: [] })
  followups!: Array<AssessmentTypeSimulation>;

  @Prop({ required: true, default: [] })
  trainings!: Array<AssessmentTypeTraining>;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type AssessmentTypeDocument = AssessmentType & Document;

export const AssessmentTypeSchema =
  SchemaFactory.createForClass(AssessmentType);
