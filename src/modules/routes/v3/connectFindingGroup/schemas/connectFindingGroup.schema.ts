import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'connectFindingGroups' })
export class ConnectFindingGroup {
  @Prop({ required: false, default: '' })
  findingGroupId: string;

  @Prop({ required: false, default: '' })
  clientUnitId: string;

  @Prop({ required: false, default: '' })
  businessUnitId: string;

  @Prop({ required: false, default: '' })
  businessCycleId: string;

  @Prop({ required: false, default: '' })
  assessmentCycleId: string;

  @Prop({ required: false, default: '' })
  assessmentTypeId: string;

  @Prop({ required: false, default: '' })
  simulationId: string;

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

export type ConnectFindingGroupDocument = ConnectFindingGroup & Document;

export const ConnectFindingGroupSchema =
  SchemaFactory.createForClass(ConnectFindingGroup);
