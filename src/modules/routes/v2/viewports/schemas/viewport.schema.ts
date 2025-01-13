import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { SimDoc } from 'src/modules/routes/v1/simDocs/schemas/simDoc.schema';
import { SimulationType } from 'src/utils/status';

@Schema({ collection: 'viewports' })
export class Viewport {
  readonly _id!: any;
  // viewport 넘버
  @Prop({ required: true })
  index: number;

  // viewport 유저
  @Prop({ required: true })
  userId: string;

  // viewport 활성 여부
  @Prop({ required: true })
  active: boolean;

  // viewport가 보이는지
  @Prop({ required: true, default: false })
  isMounted: boolean;

  /**
   * @deprecated
   * @description: '지금은 필요없어 보입니다. 혹시나 필요할 경우 다시 살리세요.'
   */
  @Prop({ required: false })
  simulationId: string;

  // type: userBaseline or userFollowup
  @Prop({ required: false, default: null })
  simulationType: SimulationType;

  // viewport의 베이스라인 아이디
  @Prop({ required: false, default: null })
  userSimulationId: string;

  // viewport에 보이는 SimDoc
  @Prop({ required: false, default: null })
  simDoc: SimDoc;

  // viewport에있는 SelectedDocument(SimDocs)중 본것들의 Ids
  @Prop({ required: false, default: [] })
  viewedSimDocIds: Array<number>;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type ViewportDocument = Viewport & Document;

export const ViewportSchema = SchemaFactory.createForClass(Viewport);
