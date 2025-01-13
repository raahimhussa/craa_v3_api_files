import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
/**
 * @description 아직 사용하지 않습니다.
 */
@Schema({ collection: 'groups' })
export class Group {
  readonly _id!: any;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  age!: number;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type GroupDocument = Group & Document;

export const GroupSchema = SchemaFactory.createForClass(Group);
