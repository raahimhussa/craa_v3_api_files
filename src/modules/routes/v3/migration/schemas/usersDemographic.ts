import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users_demographic' })
export class Demo_UsersDemographic {
  readonly _id: any;
}

export type Demo_UsersDemographicDocument = Demo_UsersDemographic & Document;

export const Demo_UsersDemographicSchema = SchemaFactory.createForClass(
  Demo_UsersDemographic,
).set('versionKey', false);
