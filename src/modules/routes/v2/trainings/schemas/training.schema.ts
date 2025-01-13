import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export class Pages {
  [pageId: string]: Page;
}
export class Page {
  _id: string;

  title: string;

  type: string;

  order: number;

  duration: number;

  isActivated: boolean;

  quizId?: string;

  videoId?: string;

  quizes?: [];
}

@Schema({ collection: 'trainings' })
export class Training {
  readonly _id!: any;

  @Prop({ required: true, default: 'Untitled' })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ default: true })
  progressOption: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ required: true, default: {}, type: Pages })
  pages: Pages;

  @Prop({ default: true })
  isActivated: boolean;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, default: '' })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type TrainingDocument = Training & Document;

export const TrainingSchema = SchemaFactory.createForClass(Training);
