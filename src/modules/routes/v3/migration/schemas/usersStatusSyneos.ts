import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status_syneos' })
export class Demo_UserStatusSyneos {
  readonly _id: any;
}

export type Demo_UserStatusSyneosDocument = Demo_UserStatusSyneos & Document;

export const Demo_UserStatusSyneosSchema = SchemaFactory.createForClass(
  Demo_UserStatusSyneos,
).set('versionKey', false);
