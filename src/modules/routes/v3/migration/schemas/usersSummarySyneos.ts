import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_summary_syneos' })
export class Demo_UserSummarySyneos {
  readonly _id: any;
}

export type Demo_UserSummarySyneosDocument = Demo_UserSummarySyneos & Document;

export const Demo_UserSummarySyneosSchema = SchemaFactory.createForClass(
  Demo_UserSummarySyneos,
).set('versionKey', false);
