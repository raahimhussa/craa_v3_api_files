import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

/**
 * @description  PDF, Image, Video등 S3에 업로드된 리소스의 경로를 저장하는 파일 Collection
 */
@Schema()
export class File {
  readonly _id?: any;

  @Prop({ required: true })
  // pdf인지 혹은 image인지 video인지 판별F
  mimeType!: string;

  @Prop({ required: false, default: '' })
  path: string;

  // 파일명
  @Prop({ required: true })
  name: string;

  // S3경로 해당 경로에서 자료를 얻습니다.
  @Prop({ required: true })
  url: string;

  /**
   * @deprecated 사용안함
   */
  @Prop({ required: false, default: 0 })
  totalPage: number;

  /**
   * @deprecated 사용안함
   */
  @Prop({ required: false, default: 0 })
  currentPage: number;

  /**
   * @deprecated 사용안함
   */
  @Prop({ required: false, default: 1 })
  scale: number;

  /**
   * @description 파일 사이즈 kb단위
   */
  @Prop({ required: false })
  size: number;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type FileDocument = File & Document;

export const FileSchema = SchemaFactory.createForClass(File).set(
  'versionKey',
  false,
);
