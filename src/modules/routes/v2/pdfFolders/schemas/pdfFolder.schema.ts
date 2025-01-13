import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'pdfFolders' })
export class PdfFolder {
  readonly _id!: any;
  /**
   * @description 이름
   */
  @Prop({ required: false, default: '' })
  name: string;

  /**
   * @description pdf folder
   */
  @Prop({ required: false, default: '' })
  path: string;

  @Prop({ required: false, default: false })
  isRoot: boolean;

  @Prop({ required: false, default: true })
  isActivated!: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type PdfFolderDocument = PdfFolder & Document;

export const PdfFolderSchema = SchemaFactory.createForClass(PdfFolder);
