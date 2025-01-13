import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Bookmark } from '../../bookmarks/schemas/bookmark.schema';
import { Document } from 'mongoose';
import { Note } from '../../notes/schemas/note.schema';
import { Viewport } from '../../viewports/schemas/viewport.schema';

export enum LogScreen {
  Simulation = 'baseline',
  Simulations = 'followups',
  Trainings = 'trainings',
  AssessmentCycles = 'AssessmentCycles',
  AssessmentCycle = 'AssessmentCycle',
  SignIn = 'SignIn',
  SignUp = 'SignUp',
}

export enum AuthLogType {
  CreateAccount = 'createAccount',
  DeleteAccount = 'deleteAccount',
  SignIn = 'signIn',
  SignOut = 'signOut',
}

export enum Severity {
  Success = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
}
/**
 * 유저포탈에서 유저활동 로그
 */
@Schema({ collection: 'authLogs' })
export class AuthLog {
  readonly _id!: any;

  @Prop({ required: true, default: false })
  type!: AuthLogType;

  @Prop({ required: true, default: false })
  userId!: string;

  @Prop({ required: true, default: false })
  role!: string;

  @Prop({ required: true, default: false })
  userName!: string;

  @Prop({ required: false, default: '' })
  os: string;

  @Prop({ required: false, default: '' })
  browser: string;

  @Prop({ required: false, default: '' })
  ip: string;

  @Prop({ required: false, default: '' })
  country: string;

  @Prop({ required: false, default: '' })
  city: string;

  @Prop({ required: false, default: '' })
  isp: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export type AuthLogDocument = AuthLog & Document;

export const AuthLogSchema = SchemaFactory.createForClass(AuthLog);
