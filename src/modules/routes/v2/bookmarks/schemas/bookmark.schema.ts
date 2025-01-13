import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'bookmarks' })
export class Bookmark {
  readonly _id!: any;
  /**
   * @description 시험 로그를 보고 감독관이 작성한 내용
   */
  @Prop({ required: true, default: '' })
  text!: string;

  /**
   * @description 로그의 대상
   */
  @Prop({ required: true })
  userId!: string;

  /**
   * @description 작성 시간
   */
  @Prop({ required: false, default: 0 })
  duration!: string;
  /**
   * @description 작성 시간
   */
  @Prop({ required: false, default: '' })
  recordId!: string;

  /**
   * @description 로그 베이스라인F
   */
  @Prop({ required: true })
  userSimulationId: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: false })
  isPrivate!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type BookmarkDocument = Bookmark & Document;

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
