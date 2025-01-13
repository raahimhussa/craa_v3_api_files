import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'training_status_summary' })
export class Demo_TrainingStatusSummary {
  readonly _id: any;
}

export type Demo_TrainingStatusSummaryDocument = Demo_TrainingStatusSummary &
  Document;

export const Demo_TrainingStatusSummarySchema = SchemaFactory.createForClass(
  Demo_TrainingStatusSummary,
).set('versionKey', false);
