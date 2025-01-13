import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'document_folders' })
export class Demo_DocumentFolder {
  readonly _id: any;
}

export type Demo_DocumentFolderDocument = Demo_DocumentFolder & Document;

export const Demo_DocumentFolderSchema = SchemaFactory.createForClass(
  Demo_DocumentFolder,
).set('versionKey', false);
