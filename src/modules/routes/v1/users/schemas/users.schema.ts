import {
  Authority,
  OTP,
  Profile,
  UserStatus,
} from '../interfaces/user.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Role } from '../../roles/schemas/roles.schema';

@Schema()
export class User {
  readonly _id?: any;
  // 이메일
  @Prop({ required: true })
  email!: string;

  @Prop({ required: false, default: null })
  emailVerificationLink!: string;

  @Prop({ required: false, default: null })
  passwordResetToken!: string;

  @Prop({ required: false, default: [] })
  aliasEmails!: string[];

  //  username
  @Prop({ required: true, type: String })
  name!: string;

  //  hashedPassword
  @Prop({ required: true })
  password!: string;

  //  롤
  @Prop({ required: true })
  roleId!: string;

  @Prop({ required: false })
  role?: Role;

  //  프로필
  @Prop({ required: true, type: Profile })
  profile!: Profile;

  // otp 정보
  @Prop({ required: false, type: OTP })
  otpData!: OTP;

  //  상태
  @Prop({
    required: true,
    default: {
      //  식별자
      socketId: '',
      //  온라인여부
      online: false,
      //  로그아웃시간
      logoutAt: new Date(),
      //  로그인시간
      signinAt: new Date(),
    },
  })
  status: UserStatus;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: false })
  isActivated!: boolean;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop()
  emailVerification!: Date;

  @Prop({
    required: false,
    default: {
      authorizedAll: false,
      pfizerAdmin: false,
      whitelist: [],
    },
  })
  authority: Authority;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type UserDocument = User;

export const UserSchema = SchemaFactory.createForClass(User).set(
  'versionKey',
  false,
);
