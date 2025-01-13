import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AgreementKind {
  PrivacyPolicy = 'privacyPolicy',
  TermsOfService = 'termsOfService',
}

@Schema({ collection: 'agreements' })
export class Agreement {
  readonly _id!: any;
  /**
   * @description 협약의 종류 추가 가능 현재는 TermsOfService(이용약관), (PrivacyPolicy)개인정보이용 만 존재합니다. 필요에 따라서 추가
   * 협약의 종류 추가 가능 현재는 TermsOfService(이용약관), (PrivacyPolicy)개인정보이용 만 존재합니다. 필요에 따라서 추가
   */
  @Prop({ require: true, default: AgreementKind.PrivacyPolicy })
  kind!: AgreementKind;

  /**
   * @description 문서 라벨
   */
  @Prop({ require: true, default: 'type your key' })
  key!: string;
  /**
   * @description 문서 라벨
   */
  @Prop({ require: true, default: 'type your label' })
  label!: string;

  /**
   * @description 문서 내용 + html이 붙어있으면 richtexteditor에서 입력하는 내용입니다.
   */
  @Prop({ required: true, default: '' })
  htmlContent!: string;

  /**
   * @description 이용약관을 동의를 해야 넘어갈지 아니면 그냥 갈지 필수 여부 체크
   */
  @Prop({ required: true, default: false })
  isRequired!: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type AgreementDocument = Agreement & Document;

export const AgreementSchema = SchemaFactory.createForClass(Agreement);
