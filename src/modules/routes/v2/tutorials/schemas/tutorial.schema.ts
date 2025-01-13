import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @description 해당 tutorials collection은 email tutorial를 비롯한 기본 문서틀을 저장하는 collection입니다.
 *
 * <p>Email Verify</p>
 * <p>{{username}}</p>
 *
 * 으로 htmlContent에 저장되어있다면
 *
 * tutorial.htmlContent.replace('{{username}}', user.name)
 * 형태로 대체하여 이메일을 발송시키는 용도로 사용합니다.
 */
@Schema({ collection: 'tutorials' })
export class Tutorial {
  @Prop({ required: true, default: '' })
  type!: string;

  @Prop({ required: false, default: '' })
  url!: string;
}

export type TutorialDocument = Tutorial & Document;

export const TutorialSchema = SchemaFactory.createForClass(Tutorial);
