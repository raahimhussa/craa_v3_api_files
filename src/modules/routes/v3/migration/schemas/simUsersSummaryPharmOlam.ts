import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary_pharm_olam' })
export class Demo_SimUsersSummaryPharmOlam {
  readonly _id: any;
}

export type Demo_SimUsersSummaryPharmOlamDocument =
  Demo_SimUsersSummaryPharmOlam & Document;

export const Demo_SimUsersSummaryPharmOlamSchema = SchemaFactory.createForClass(
  Demo_SimUsersSummaryPharmOlam,
).set('versionKey', false);
