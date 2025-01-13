import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'scoring_behaviors' })
export class Demo_ScoringBehaviors {
  readonly _id: any;
}

export type Demo_ScoringBehaviorDocument = Demo_ScoringBehaviors & Document;

export const Demo_ScoringBehaviorSchema = SchemaFactory.createForClass(
  Demo_ScoringBehaviors,
).set('versionKey', false);
