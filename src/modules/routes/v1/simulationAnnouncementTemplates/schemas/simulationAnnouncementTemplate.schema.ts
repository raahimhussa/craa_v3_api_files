import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { SimulationAnnouncementTemplateType } from 'src/utils/status';

@Schema({ collection: 'simulationAnnouncementTemplates' })
export class SimulationAnnouncementTemplate {
  readonly _id!: any;

  @Prop({
    require: true,
    default: SimulationAnnouncementTemplateType.Agreement,
  })
  kind!: SimulationAnnouncementTemplateType;

  /**
   * @description 문서 라벨
   */
  @Prop({ require: true, default: '' })
  name!: string;

  /**
   * @description 문서 내용 + html이 붙어있으면 richtexteditor에서 입력하는 내용입니다.
   */
  @Prop({ required: true, default: '' })
  htmlContent!: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type SimulationAnnouncementTemplateDocument =
  SimulationAnnouncementTemplate & Document;

export const SimulationAnnouncementTemplateSchema =
  SchemaFactory.createForClass(SimulationAnnouncementTemplate);
