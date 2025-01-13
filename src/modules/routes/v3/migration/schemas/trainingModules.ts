import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'training_modules' })
export class Demo_TrainingModule {
  readonly _id: any;
}

export type Demo_TrainingModuleDocument = Demo_TrainingModule & Document;

export const Demo_TrainingModuleSchema = SchemaFactory.createForClass(
  Demo_TrainingModule,
).set('versionKey', false);
