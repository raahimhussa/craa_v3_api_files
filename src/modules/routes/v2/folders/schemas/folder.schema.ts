import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'folders' })
export class Folder {
  readonly _id!: any;
  /**
   * @description Name
   */
  @Prop({ required: false, default: '' })
  name: string;

  /**
   * @description Color
   */
  @Prop({ required: false, default: '#ffffff' })
  color: string;

  /**
   * @description Folder sequence
   */
  @Prop({ required: true, default: 0 })
  seq: number;

  /**
   * @description Folder depth
   */
  @Prop({ required: true })
  depth: number;

  /**
   * @description Folder open status
   */
  @Prop({ required: true, default: true })
  expanded: boolean;

  /**
   * @description Parent folder ID
   */
  @Prop({ required: false, default: null })
  folderId: string;

  @Prop({ required: false, default: true })
  isActivated!: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;

  /**
   * @description Label
   */
  @Prop({ required: false, default: '' })
  label: string;
}

export type FolderDocument = Folder & Document;

export const FolderSchema = SchemaFactory.createForClass(Folder);
