import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
/**
 * @description Client 묶음
 */
@Schema({ collection: 'vendors' })
export class Vendor {
  readonly _id: any;

  // 클라이언트 밴더 수장
  @Prop({ required: true })
  clientId: string;

  // 밴더에 속한 클라이언트
  @Prop({ required: true })
  clientIds: string[];

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type VendorDocument = Vendor & Document;

export const VendorSchema = SchemaFactory.createForClass(Vendor);
