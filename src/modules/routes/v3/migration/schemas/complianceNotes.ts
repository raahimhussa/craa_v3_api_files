import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'compliance_notes' })
export class Demo_ComplianceNotes {
  readonly _id: any;
}

export type Demo_ComplianceNoteDocument = Demo_ComplianceNotes & Document;

export const Demo_ComplianceNoteSchema = SchemaFactory.createForClass(
  Demo_ComplianceNotes,
).set('versionKey', false);
