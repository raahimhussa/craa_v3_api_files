import { Connection, Document } from 'mongoose';
import {
  InjectConnection,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import { File } from '../../files/schemas/files.schema';
import { Injectable } from '@nestjs/common';

/**
 * @description SimDocs represents the documents that CRAs view when taking a Simulation.
 */
@Schema({ collection: 'simDocs' })
export class SimDoc {
  readonly _id!: any;

  @Prop({ required: true, default: -1 })
  visibleId: number;

  /**
   * @description
   */
  @Prop({ required: false, default: 'Document' })
  kind: string;
  /**
   * @description
   */
  @Prop({ required: false, default: null })
  documentId: string | null;

  /**
   * @description Title of the SimDoc
   */
  @Prop({ required: false, default: '' })
  title: string;

  /**
   * @description Sequence of the SimDoc
   */
  @Prop({ required: true, default: 0 })
  seq: number;

  /**
   * @description FolderId that contains this document
   */
  @Prop({ required: true })
  folderId: string;

  /**
   * @description Total number of pages in a document
   */
  @Prop({ required: true, default: 0 })
  totalPage: number;

  /**
   * @description Current page of the document
   */
  @Prop({ required: true, default: 0 })
  currentPage: number;

  /**
   * @description Scale of the document
   */
  @Prop({ required: false, default: 1 })
  scale: number;

  /**
   * @description File collection schema for the document, same as the File Collection Schema
   */
  @Prop({ required: false, default: [] })
  files!: File[];

  @Prop({ required: false, default: 0 })
  numberOfPillsToShow!: number;

  @Prop({ required: false, default: 0 })
  numberOfPillsTakenBySubject!: number;

  @Prop({ required: false, default: 0 })
  numberOfPillsPrescribed!: number;

  /**
   * @deprecated Replaced by Folder Collection
   */
  @Prop({ required: true, default: [] })
  children!: Array<any>;

  /**
   * @deprecated
   */
  @Prop({ required: true, default: false })
  expanded!: boolean;

  @Prop({ required: false, default: true })
  isActivated!: boolean;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;

  /**
   * @description Label of the SimDoc
   */
  @Prop({ required: false, default: '' })
  label: string;
}

export type SimDocDocument = SimDoc & Document;

export const SimDocSchema = SchemaFactory.createForClass(SimDoc);
