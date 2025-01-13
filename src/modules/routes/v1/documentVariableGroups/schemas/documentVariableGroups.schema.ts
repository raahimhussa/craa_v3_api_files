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
@Schema({ collection: 'documentVariableGroups' })
export class DocumentVariableGroup {
  readonly _id!: any;

  /**
   * @description SimDoc의 타이틀
   */
  @Prop({ required: true, default: '' })
  name: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type DocumentVariableGroupDocument = Document & Doc;

export const DocumentVariableGroupSchema = SchemaFactory.createForClass(
  DocumentVariableGroup,
);
