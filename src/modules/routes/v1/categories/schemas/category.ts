import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

enum CategroyKind {
  Domain = 'domain',
}

/**
 * @description 과거 Domain 생성 용도로 사용했으나 따로 Collection이 생기면서 제거되었습니다.
 * @deprecated
 */
@Schema({ collection: 'categories' })
export class Category {
  readonly _id!: any;

  @Prop({ required: true, default: CategroyKind.Domain })
  kind!: string;

  @Prop({ require: true, default: [] })
  items!: Array<any>;

  @Prop({ require: true, default: [] })
  flattedItems!: Array<any>;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);
