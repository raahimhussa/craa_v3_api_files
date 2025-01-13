import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'documents' })
export class Demo_Document {
  readonly _id: any;
}

export type Demo_DocumentDocument = Demo_Document & Document;

export const Demo_DocumentSchema = SchemaFactory.createForClass(
  Demo_Document,
).set('versionKey', false);
