import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary_pharm_olam' })
export class Demo_UserSummaryPharmOlam {
  readonly _id: any;
}

export type Demo_UserSummaryPharmOlamDocument = Demo_UserSummaryPharmOlam &
  Document;

export const Demo_UserSummaryPharmOlamSchema = SchemaFactory.createForClass(
  Demo_UserSummaryPharmOlam,
).set('versionKey', false);
