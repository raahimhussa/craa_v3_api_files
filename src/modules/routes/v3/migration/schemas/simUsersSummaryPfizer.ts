import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary_pfizer' })
export class Demo_SimUsersSummaryPfizer {
  readonly _id: any;
}

export type Demo_SimUsersSummaryPfizerDocument = Demo_SimUsersSummaryPfizer &
  Document;

export const Demo_SimUsersSummaryPfizerSchema = SchemaFactory.createForClass(
  Demo_SimUsersSummaryPfizer,
).set('versionKey', false);
