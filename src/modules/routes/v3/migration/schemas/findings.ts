import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'findings' })
export class Demo_Finding {
  readonly _id: any;
}

export type Demo_FindingDocument = Demo_Finding & Document;

export const Demo_FindingSchema = SchemaFactory.createForClass(
  Demo_Finding,
).set('versionKey', false);
