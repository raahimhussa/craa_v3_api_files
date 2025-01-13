import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { bool } from 'aws-sdk/clients/signer';

import { Document } from 'mongoose';

@Schema({ collection: 'domains' })
export class Domain {
  readonly _id: any;
  /**
   * @description 도메인명
   */
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: -1 })
  visibleId: number;

  /**
   * @description 도메인순서
   */
  @Prop({ required: false })
  seq: number;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  /**
   * @description 부모도메인아이디
   */
  @Prop({ required: false })
  parentId: string;

  @Prop({ required: false, default: null })
  followupNumber: number;

  /**
   * @description 깊이
   */
  @Prop({ required: false, default: 0 })
  depth: number;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  // propery to distinguish trainable domains from non-trainalbe domains, 
  // mostly the five top-level domains
  @Prop({ required: false} )
  remediable: boolean;
}

export type DomainDocument = Domain & Document;

export const DomainSchema = SchemaFactory.createForClass(Domain);
