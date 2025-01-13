import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LogScreen {
  Simulation = 'baseline',
  Simulations = 'followups',
  Trainings = 'trainings',
  AssessmentCycles = 'AssessmentCycles',
  AssessmentCycle = 'AssessmentCycle',
  SignIn = 'SignIn',
  SignUp = 'SignUp',
}

export enum SimEvent {
  trainingStart = 'trainingStart',
  trainingExit = 'trainingExit',
  quizStart = 'quizStart',
  quizSubmit = 'quizSubmit',
  viewportStart = 'viewportStart',
  viewportSubmit = 'viewportSubmit',
  signIn = 'signin',
  logout = 'logout',
  jumpPage = 'jumpNext',
  nextPage = 'pageNext',
  prevPage = 'pagePrev',
  deleteNote = 'deleteNote',
  addNote = 'addNote',
  editNote = 'editNote',
  pageDone = 'pageDone',
  trainingDone = 'trainingDone',
  followupOpen = 'followupOpen',
}

export enum Severity {
  Success = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
}

class Note {
  DocNum: string;
  docId: string;
  currentPage: number;
  note: string;
  type: string;
}

/**
 * 유저포탈에서 유저활동 로그
 */
@Schema({ collection: 'trainingLogs' })
export class TrainingLog {
  readonly _id!: any;

  /**
   * @description 활동스크린
   */
  @Prop({ required: true })
  userId: string;
  /**
   * @description 활동스크린
   */
  @Prop({ required: true })
  trainingId: string;

  /**
   * @description 활동스크린
   */
  @Prop({ required: false })
  pageId: string;

  /**
   * @description 작성한 노트
   */
  @Prop({ required: false, default: null })
  note: Note;

  // @Prop({ required: false, default: null })
  // bookmark: Bookmark;

  /**
   * @description 유저 행위
   */
  @Prop({ required: true })
  event: SimEvent;

  /**
   * @description 로그 중요도F
   */
  @Prop({ required: true })
  severity: Severity;

  /**
   * @description 로깅 시간
   */
  @Prop({ required: false, default: 0 })
  duration: number;

  /**
   * @description 로그 메세지
   */
  @Prop({ required: false, default: '' })
  message: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type TrainingLogDocument = TrainingLog & Document;

export const TrainingLogSchema = SchemaFactory.createForClass(TrainingLog);
