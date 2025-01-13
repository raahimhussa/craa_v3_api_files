import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status' })
export class Demo_UserStatus {
  readonly _id: any;
}

export type Demo_UserStatusDocument = Demo_UserStatus & Document;

export const Demo_UserStatusSchema = SchemaFactory.createForClass(
  Demo_UserStatus,
).set('versionKey', false);
