import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { Viewport } from '../../viewports/schemas/viewport.schema';
import { bool } from 'aws-sdk/clients/signer';

export class ComplianceNote {
  taken: number;
  shouldTaken: number;
  percent: number;
}

class NonError {
  _id: string;
  text: string;
  status: NonErrorStatus;
}

export enum NonErrorStatus {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Pending = 'Pending',
  Final = 'Final',
}

class ScorerCheck {
  firstScorer: boolean;
  secondScorer: boolean;
}
/**
 * @description 유저가 작성한 노트
 */
@Schema({ collection: 'notes' })
export class Note {
  readonly _id: any;
  /**
   * @description 어느 뷰포트를 보고 노트를 작성했는지
   */
  @Prop({ required: true })
  viewport: Viewport;

  /**
   * @description MNID
   */
  @Prop({ required: true, default: 0 })
  MNID: number;

  @Prop({
    required: false,
    default: 0,
  })
  reopenCount: number;

  @Prop({ required: false })
  nonErrors: NonError[];

  @Prop({
    required: false,
    type: ScorerCheck,
    default: {
      firstScorer: false,
      secondScorer: false,
    },
  })
  scorerCheck: ScorerCheck;

  /**
   * @description 노트순서
   */
  @Prop({ required: true, default: 0 })
  seq: number;

  /**
   * @description 비디오 아이디
   */
  @Prop({ required: false, default: '' })
  recordId: string;

  /**
   * @description 유저가 작성한 모니터링 노트 내용
   */
  @Prop({ required: false, default: '' })
  text: string;

  @Prop({ required: false, default: '' })
  page: string;

  /**
   * @description 노트타입 monitoring || compliance
   */
  @Prop({ required: true, default: '' })
  type: string;

  /**
   * @description 유저가 작성한 compliance 노트 내용
   */
  @Prop({ required: false, default: {} })
  complianceNote: ComplianceNote;

  /**
   * @description 노트 작성 유저
   */
  @Prop({ required: true })
  userId: string;

  /**
   * @description 채점자가 노트를 봤는지
   */
  @Prop({ required: true, default: false })
  isViewed: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: false, default: false })
  isDemo: boolean;

  @Prop({ required: false, default: '' })
  demoId: string;
}

export type NoteDocument = Note & Document;

export const NoteSchema = SchemaFactory.createForClass(Note);
