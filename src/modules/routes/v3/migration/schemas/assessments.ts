import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'assessments' })
export class Demo_Assessment {
  readonly _id: any;
}

export type Demo_AssessmentDocument = Demo_Assessment & Document;

export const Demo_AssessmentSchema = SchemaFactory.createForClass(
  Demo_Assessment,
).set('versionKey', false);
