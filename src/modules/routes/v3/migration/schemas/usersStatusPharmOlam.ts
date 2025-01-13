import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'user_status_pharm_olam' })
export class Demo_UserStatusPharmOlam {
  readonly _id: any;
}

export type Demo_UserStatusPharmOlamDocument = Demo_UserStatusPharmOlam &
  Document;

export const Demo_UserStatusPharmOlamSchema = SchemaFactory.createForClass(
  Demo_UserStatusPharmOlam,
).set('versionKey', false);
