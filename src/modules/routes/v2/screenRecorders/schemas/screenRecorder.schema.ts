import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { SimulationType } from 'src/utils/status';

/**
 * @description 베이스라인에서 저장한 스크린 영상 경로를 저장합니다.
 */
@Schema({ collection: 'screenRecorders' })
export class ScreenRecorder {
  readonly _id!: any;

  // S3 영상경로가 담겨있습니다.
  @Prop({ required: true })
  recorders: object[];

  // userBaseline or userFollowup id
  @Prop({ required: false, type: String, default: null })
  userSimulationId;

  // type: userBaseline or userFollowup
  @Prop({ required: false, default: null })
  simulationType: SimulationType;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type ScreenRecorderDocument = ScreenRecorder & Document;

export const ScreenRecorderSchema =
  SchemaFactory.createForClass(ScreenRecorder);
