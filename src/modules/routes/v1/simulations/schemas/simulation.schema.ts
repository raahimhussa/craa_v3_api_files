import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export class AnnouncementTemplate {
  title!: string;
  htmlContent!: string;
  published!: boolean;
}

/**
 * Simulation - Folders - SimDocs
 * 구조로 되어 있습니다. Simulation이 폴더를 가지고 폴더가 SimDocs을 가집니다. Simulation은 UserPortal Viewport에 Select Document 구조입니다.
 */
@Schema({ collection: 'simulations' })
export class Simulation {
  readonly _id!: any;

  @Prop({ required: true, default: -1 })
  visibleId: number;

  // Simulation 이름 ex) Simulation or Simulation
  @Prop({
    required: true,
    default: 'unknown name',
  })
  name: string;

  // Simulation 이름 ex) Simulation-AP or Simulation-OP 등 라벨링(당장은 쓰지 않음.)
  @Prop({
    required: true,
    default: 'unknown label',
  })
  label: string;

  /**
   * @description 해당 Simulation이 가지고 있는 Folder들 해당 Folder안에는 SimDocs가 존재합니다.
   * Folder - SimDoc
   *        - SimDoc
   *        - Folder - SimDoc
   *        - Folder - SimDoc
   *                 - SimDoc
   *
   * 형태로 Viewport SelectDocument에 뿌려질수 있습니다. SimDoc이 FolderId를 가지고 있고 Folder도 FolderId를 가지고 있어서 부모를 찾을 수 있습니다.
   */
  @Prop({
    required: false,
    default: [],
  })
  folderIds: string[];

  @Prop({
    required: false,
    default: {
      title: '',
      htmlContent: '',
      published: false,
    },
  })
  agreement: AnnouncementTemplate;

  @Prop({
    required: false,
    default: {
      title: '',
      htmlContent: '',
      published: false,
    },
  })
  onSubmission: AnnouncementTemplate;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({ required: false, default: null })
  demoId: number;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type SimulationDocument = Simulation & Document;

export const SimulationSchema = SchemaFactory.createForClass(Simulation);
