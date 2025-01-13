import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_score_summary' })
export class Demo_UsersScoreSummary {
  readonly _id: any;
}

export type Demo_UsersScoreSummaryDocument = Demo_UsersScoreSummary & Document;

export const Demo_UsersScoreSummarySchema = SchemaFactory.createForClass(
  Demo_UsersScoreSummary,
).set('versionKey', false);
