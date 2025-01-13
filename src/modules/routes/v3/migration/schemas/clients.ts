import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'clients' })
export class Demo_Client {
  readonly _id: any;
}

export type Demo_ClientDocument = Demo_Client & Document;

export const Demo_ClientSchema = SchemaFactory.createForClass(Demo_Client).set(
  'versionKey',
  false,
);
