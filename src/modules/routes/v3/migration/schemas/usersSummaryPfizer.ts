import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary_pfizer' })
export class Demo_UserSummaryPfizer {
  readonly _id: any;
}

export type Demo_UserSummaryPfizerDocument = Demo_UserSummaryPfizer & Document;

export const Demo_UserSummaryPfizerSchema = SchemaFactory.createForClass(
  Demo_UserSummaryPfizer,
).set('versionKey', false);
