import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'monitoring_notes' })
export class Demo_MonitoringNotes {
  readonly _id: any;
}

export type Demo_MonitoringNoteDocument = Demo_MonitoringNotes & Document;

export const Demo_MonitoringNoteSchema = SchemaFactory.createForClass(
  Demo_MonitoringNotes,
).set('versionKey', false);
