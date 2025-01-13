import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status_abbvie' })
export class Demo_UserStatusAbbvie {
  readonly _id: any;
}

export type Demo_UserStatusAbbvieDocument = Demo_UserStatusAbbvie & Document;

export const Demo_UserStatusAbbvieSchema = SchemaFactory.createForClass(
  Demo_UserStatusAbbvie,
).set('versionKey', false);
