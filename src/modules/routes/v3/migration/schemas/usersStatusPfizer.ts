import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status_pfizer' })
export class Demo_UserStatusPfizer {
  readonly _id: any;
}

export type Demo_UserStatusPfizerDocument = Demo_UserStatusPfizer & Document;

export const Demo_UserStatusPfizerSchema = SchemaFactory.createForClass(
  Demo_UserStatusPfizer,
).set('versionKey', false);
