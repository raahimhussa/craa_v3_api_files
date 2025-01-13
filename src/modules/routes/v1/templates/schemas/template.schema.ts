import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @description 해당 templates collection은 email template를 비롯한 기본 문서틀을 저장하는 collection입니다.
 *
 * <p>Email Verify</p>
 * <p>{{username}}</p>
 *
 * 으로 htmlContent에 저장되어있다면
 *
 * template.htmlContent.replace('{{username}}', user.name)
 * 형태로 대체하여 이메일을 발송시키는 용도로 사용합니다.
 */
@Schema({ collection: 'templates' })
export class Template {
  @Prop({ required: true, default: 'emailTemplate' })
  key!: string;

  @Prop({ required: true, default: '' })
  htmlContent!: string;

  @Prop({ required: true, default: '' })
  title!: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type TemplateDocument = Template & Document;

export const TemplateSchema = SchemaFactory.createForClass(Template);
