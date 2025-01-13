import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export class Transcript {
  text: string;

  duration: number;
}

@Schema({ collection: 'videos' })
export class Video {
  readonly _id!: any;

  @Prop({ required: true, default: 'Untitled' })
  title: string;

  @Prop({ required: true, default: '' })
  vimeoId: string;
  @Prop({ required: true, default: '' })
  hParameter: string;
  @Prop({ required: true, default: '' })
  embed: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ required: false, default: [] })
  transcript: Transcript[];

  @Prop({ default: true })
  isActivated: boolean;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export type VideoDocument = Video & Document;

export const VideoSchema = SchemaFactory.createForClass(Video);
