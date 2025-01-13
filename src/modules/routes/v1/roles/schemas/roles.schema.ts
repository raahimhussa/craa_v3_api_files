import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Role {
  readonly _id?: any;

  /**
   * @description 타이틀
   */
  @Prop({ required: true, type: String })
  title: string;

  /**
   * @description 우선순위
   */
  @Prop({ required: true, type: Number, default: 0 })
  priority: number;

  @Prop({ required: true, type: Boolean })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role).set(
  'versionKey',
  false,
);
