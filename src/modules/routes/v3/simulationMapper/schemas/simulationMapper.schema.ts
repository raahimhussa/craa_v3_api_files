import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'simulationMappers' })
export class SimulationMapper {
  @Prop({ required: false, default: 0 })
  simulationId: number;

  // @Prop({ required: false, default: '' })
  // simDocId: string;

  @Prop({ required: false, default: 0 })
  findingId: number;

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

  // @Prop({
  //   required: false,
  //   default: false,
  // })
  // isDeleted: boolean;
}

export type SimulationMapperDocument = SimulationMapper & Document;

export const SimulationMapperSchema =
  SchemaFactory.createForClass(SimulationMapper);
