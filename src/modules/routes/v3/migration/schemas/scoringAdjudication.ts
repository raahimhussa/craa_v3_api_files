import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'scoring_adjudication' })
export class Demo_ScoringAdjudication {
  readonly _id: any;
}

export type Demo_ScoringAdjudicationDocument = Demo_ScoringAdjudication &
  Document;

export const Demo_ScoringAdjudicationSchema = SchemaFactory.createForClass(
  Demo_ScoringAdjudication,
).set('versionKey', false);
