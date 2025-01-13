import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'systemSettings' })
export class SystemSetting {
  readonly _id!: any;

  @Prop({ require: true })
  id!: string;

  @Prop({ require: false, default: '' })
  enck: string;

  @Prop({ require: false, default: '' })
  cAtRaw: string;

  @Prop({ require: false, default: '' })
  thfxm: string;

  @Prop({ require: false, default: '' })
  desc: string;

  @Prop({ require: false, default: '' })
  q: string;

  @Prop({ require: false, default: '' })
  version: string;
}

export type SystemSettingDocument = SystemSetting & Document;

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);
