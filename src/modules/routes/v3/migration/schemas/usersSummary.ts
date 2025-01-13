import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary' })
export class Demo_UserSummary {
  readonly _id: any;
}

export type Demo_UserSummaryDocument = Demo_UserSummary & Document;

export const Demo_UserSummarySchema = SchemaFactory.createForClass(
  Demo_UserSummary,
).set('versionKey', false);
