import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'domain_tips' })
export class Demo_DomainTips {
  readonly _id: any;
}

export type Demo_DomainTipsDocument = Demo_DomainTips & Document;

export const Demo_DomainTipsSchema = SchemaFactory.createForClass(
  Demo_DomainTips,
).set('versionKey', false);
