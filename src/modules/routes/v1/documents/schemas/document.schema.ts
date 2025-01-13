import { Connection, Document as Doc } from 'mongoose';
import {
  InjectConnection,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import { Injectable } from '@nestjs/common';

/**
 * @description SimDocs은 임상보조연구원이 Simulation(Simulation)을 볼때 보는 문서를 나타냅니다.
 */
@Schema({ collection: 'documents' })
export class Document {
  readonly _id!: any;

  /**
   * @description SimDoc의 타이틀
   */
  @Prop({ required: false, default: '' })
  title: string;
  @Prop({ required: false, default: '' })
  groupId: string;

  @Prop({ required: false, default: [] })
  versions: {}[];

  @Prop({ required: false, default: [] })
  draft: string[];

  @Prop({ required: true, default: false })
  isSaved!: boolean;

  @Prop({ required: true, default: false })
  isActivated!: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type DocumentDocument = Document & Doc;

export const DocumentSchema = SchemaFactory.createForClass(Document);
