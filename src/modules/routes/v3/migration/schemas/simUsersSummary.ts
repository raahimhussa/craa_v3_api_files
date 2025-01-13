import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary' })
export class Demo_SimUsersSummary {
  readonly _id: any;
}

export type Demo_SimUsersSummaryDocument = Demo_SimUsersSummary & Document;

export const Demo_SimUsersSummarySchema = SchemaFactory.createForClass(
  Demo_SimUsersSummary,
).set('versionKey', false);
