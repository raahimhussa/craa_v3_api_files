import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary_allucent' })
export class Demo_SimUsersSummaryAllucent {
  readonly _id: any;
}

export type Demo_SimUsersSummaryAllucentDocument =
  Demo_SimUsersSummaryAllucent & Document;

export const Demo_SimUsersSummaryAllucentSchema = SchemaFactory.createForClass(
  Demo_SimUsersSummaryAllucent,
).set('versionKey', false);
