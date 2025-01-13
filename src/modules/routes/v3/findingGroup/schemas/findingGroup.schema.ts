import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'findingGroups' })
export class FindingGroup {
  readonly _id: any;

  @Prop({ required: false, default: '' })
  simulationId: string;

  @Prop({ required: false, default: [] })
  findingIds: string[];

  @Prop({
    required: true,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({ required: false, default: true })
  isActivated: boolean;

  @Prop({ required: false, default: false })
  isDeleted: boolean;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;

  // @Prop({
  //   required: false,
  //   default: false,
  // })
  // isDeleted: boolean;
}

export type FindingGroupDocument = FindingGroup & Document;

export const FindingGroupSchema = SchemaFactory.createForClass(FindingGroup);
