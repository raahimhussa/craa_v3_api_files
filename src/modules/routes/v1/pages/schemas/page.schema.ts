import { Connection, Document } from 'mongoose';
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
@Schema({ collection: 'documentPages' })
export class Page {
  readonly _id!: any;

  /**
   * @description SimDoc의 타이틀
   */
  @Prop({ required: false, default: '' })
  content: string;

  @Prop({ required: false, default: -1 })
  order: number;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type PageDocument = Page & Document;

export const PageSchema = SchemaFactory.createForClass(Page);
