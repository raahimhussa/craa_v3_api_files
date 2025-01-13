import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'simulation_settings' })
export class Demo_SimulationSetting {
  readonly _id: any;
}

export type Demo_SimulationSettingDocument = Demo_SimulationSetting & Document;

export const Demo_SimulationSettingSchema = SchemaFactory.createForClass(
  Demo_SimulationSetting,
).set('versionKey', false);
