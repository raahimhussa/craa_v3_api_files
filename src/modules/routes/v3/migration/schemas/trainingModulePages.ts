import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'training_module_pages' })
export class Demo_TrainingModulePage {
  readonly _id: any;
}

export type Demo_TrainingModulePageDocument = Demo_TrainingModulePage &
  Document;

export const Demo_TrainingModulePageSchema = SchemaFactory.createForClass(
  Demo_TrainingModulePage,
).set('versionKey', false);
