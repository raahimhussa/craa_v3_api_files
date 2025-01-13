import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'findings_selected' })
export class Demo_FindingsSelected {
  readonly _id: any;
}

export type Demo_FindingsSelectedDocument = Demo_FindingsSelected & Document;

export const Demo_FindingsSelectedSchema = SchemaFactory.createForClass(
  Demo_FindingsSelected,
).set('versionKey', false);
