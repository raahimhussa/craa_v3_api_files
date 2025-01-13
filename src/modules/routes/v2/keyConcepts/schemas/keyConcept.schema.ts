import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'keyConcepts' })
export class KeyConcept {
  readonly _id: any;

  /**
   * @description 힌트 도메인 아이디
   */
  @Prop({ required: true })
  domainId: string;

  /**
   * @description 힌트 설명
   */
  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: false })
  isDeleted: boolean;

  @Prop({ required: false, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, default: Date.now })
  updatedAt: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;
}

export type KeyConceptDocument = KeyConcept & Document;

export const KeyConceptSchema = SchemaFactory.createForClass(KeyConcept);
