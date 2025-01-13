import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
/**
 * @description 정책권한 스키마랑 라우팅은 존재하나 시간이 많아 걸려서 구현이 되지 않음. 뒤에 구현한다면 새롭게 짜도 무방
 */
@Schema({ collection: 'policies' })
export class Policy {
  readonly _id: any;

  @Prop({ required: true })
  label: string;

  // 허용페이지
  @Prop({ required: false, default: [] })
  allowedPages: Array<any>;

  // 허용액션
  @Prop({ required: false, default: [] })
  allowedActions: Array<any>;

  // 볼수있는 데이터 정보
  @Prop({ required: false, default: [] })
  allowedField: Array<any>;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type PolicyDocument = Policy & Document;

export const PolicySchema = SchemaFactory.createForClass(Policy);

// Action, Page(Modul), UI

// RoleStore.can(userId, ['?????'])
