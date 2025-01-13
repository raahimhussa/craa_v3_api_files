import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'training_module_score_summary' })
export class Demo_TrainingModuleScoreSummary {
  readonly _id: any;
}

export type Demo_TrainingModuleScoreSummaryDocument =
  Demo_TrainingModuleScoreSummary & Document;

export const Demo_TrainingModuleScoreSummarySchema =
  SchemaFactory.createForClass(Demo_TrainingModuleScoreSummary).set(
    'versionKey',
    false,
  );
