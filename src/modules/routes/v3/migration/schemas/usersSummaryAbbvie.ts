import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary_abbvie' })
export class Demo_UserSummaryAbbvie {
  readonly _id: any;
}

export type Demo_UserSummaryAbbvieDocument = Demo_UserSummaryAbbvie & Document;

export const Demo_UserSummaryAbbvieSchema = SchemaFactory.createForClass(
  Demo_UserSummaryAbbvie,
).set('versionKey', false);
