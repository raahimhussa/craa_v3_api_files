import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'sim_users_summary_syneos' })
export class Demo_SimUsersSummarySyneos {
  readonly _id: any;
}

export type Demo_SimUsersSummarySyneosDocument = Demo_SimUsersSummarySyneos &
  Document;

export const Demo_SimUsersSummarySyneosSchema = SchemaFactory.createForClass(
  Demo_SimUsersSummarySyneos,
).set('versionKey', false);
