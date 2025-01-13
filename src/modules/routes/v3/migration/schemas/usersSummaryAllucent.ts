import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary_allucent' })
export class Demo_UserSummaryAllucent {
  readonly _id: any;
}

export type Demo_UserSummaryAllucentDocument = Demo_UserSummaryAllucent &
  Document;

export const Demo_UserSummaryAllucentSchema = SchemaFactory.createForClass(
  Demo_UserSummaryAllucent,
).set('versionKey', false);
