import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class ScorerSettingDomain {
  // 도메인 아이디
  _id: string;
  // 도메인 이름
  label: string;
  // 도메인 최소점수
  minScore: number;
}

@Schema()
export class ScorerSetting {
  _id?: any;

  kind: string;

  updatedAt: Date;

  isDeleted: boolean;

  createdAt: Date;
  // 기본 첫번째 채점자
  @Prop({ type: String, required: false })
  firstScorerId: string;

  // 기본 두번째 채점자
  @Prop({ type: String, required: false })
  secondScorerId: string;

  // 기본 중재자
  @Prop({ type: String, required: false })
  adjudicatorId: string;

  // 도메인의 점수
  @Prop({})
  domains: ScorerSettingDomain[];
}

export const ScorerSettingSchema = SchemaFactory.createForClass(ScorerSetting);

@Schema({ collection: 'settings', discriminatorKey: 'kind' })
export class Setting {
  readonly _id!: any;
  // 종류
  @Prop({
    type: String,
    required: true,
    enum: [ScorerSetting.name],
  })
  kind: string;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type SettingDocument = Setting & Document;

export const SettingSchema = SchemaFactory.createForClass(Setting);
