import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary_abbvie' })
export class Demo_SimUsersSummaryAbbvie {
  readonly _id: any;
}

export type Demo_SimUsersSummaryAbbvieDocument = Demo_SimUsersSummaryAbbvie &
  Document;

export const Demo_SimUsersSummaryAbbvieSchema = SchemaFactory.createForClass(
  Demo_SimUsersSummaryAbbvie,
).set('versionKey', false);
