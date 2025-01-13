import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'findings' })
export class Finding {
  readonly _id!: any;

  @Prop({ required: false, default: -1 })
  visibleId: number;

  // 답지내용
  @Prop({ required: false, default: '' })
  text: string;

  // 답지 중요도
  @Prop({ required: false, default: 0 })
  severity: number;

  // 답지 순서
  @Prop({ required: false, default: 0 })
  seq: number;

  // cfr 일단은 입력하나 용도 모름
  @Prop({ required: false, default: '' })
  cfr: string;

  // ich_gcp 일단은 입력하나 용도 모름
  @Prop({ required: false, default: '' })
  ich_gcp: string;

  // 해당 SimDoc의 답지가 됩니다.
  @Prop({ required: false, default: null })
  simDocId: string;

  // 답지의 도메인
  @Prop({ required: false, default: '' })
  domainId: string;

  // 답지 힌트
  @Prop({ required: false, default: '' })
  keyConceptId: string;

  // 답지의 비교 대상 문서들
  @Prop({ required: false, default: [] })
  simDocIds: string[];

  // 답지의 상태
  @Prop({ required: false, enum: [] })
  status: string;

  @Prop({ required: false, default: false })
  isDeleted!: boolean;

  @Prop({ required: false, default: Date.now })
  createdAt!: Date;

  @Prop({ required: false, default: Date.now })
  updatedAt!: Date;

  @Prop({ required: false, default: '' })
  demoId?: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: false })
  isActivated: boolean;
}

export type FindingDocument = Finding & Document;

export const FindingSchema = SchemaFactory.createForClass(Finding);
