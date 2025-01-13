import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users' })
export class Demo_User {
  readonly _id: any;
}

export type Demo_UserDocument = Demo_User & Document;

export const Demo_UserSchema = SchemaFactory.createForClass(Demo_User).set(
  'versionKey',
  false,
);
