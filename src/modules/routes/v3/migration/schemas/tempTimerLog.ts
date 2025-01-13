import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'temp_timer_log' })
export class Demo_TempTimerLog {
  readonly _id: any;
}

export type Demo_TempTimerLogDocument = Demo_TempTimerLog & Document;

export const Demo_TempTimerLogSchema = SchemaFactory.createForClass(
  Demo_TempTimerLog,
).set('versionKey', false);
