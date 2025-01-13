import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
/**
 * @description 예전 연주님이 작업한 내용인데 지금은 사용하지 않는 것으로 생각됩니다. @eziong 필요하지 않으면 제거해주세요.
 */
@Schema({ collection: 'subjects' })
export class Subject {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  trainingId!: string;

  @Prop({ required: true })
  videoTextField!: string;

  @Prop({ required: true })
  duration!: number;

  @Prop({ required: true })
  instructions!: string;

  @Prop({ required: true })
  transcript!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type SubjectDocument = Subject & Document;

export const SubjectSchema = SchemaFactory.createForClass(Subject);
