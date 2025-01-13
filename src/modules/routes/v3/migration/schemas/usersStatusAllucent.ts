import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status_allucent' })
export class Demo_UserStatusAllucent {
  readonly _id: any;
}

export type Demo_UserStatusAllucentDocument = Demo_UserStatusAllucent &
  Document;

export const Demo_UserStatusAllucentSchema = SchemaFactory.createForClass(
  Demo_UserStatusAllucent,
).set('versionKey', false);
