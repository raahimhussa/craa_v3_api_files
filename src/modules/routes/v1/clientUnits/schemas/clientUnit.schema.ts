import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { GradeType } from 'src/utils/status';

@Schema()
export class BusinessUnit {
  _id: string;
  name: string;
  countryIds: string[];
  adminCountryIds: string[];
  businessCycles: BusinessCycle[];
  demoId: string;
}

export class BusinessCycle {
  _id: string;
  assessmentCycleId: string;
  settingsByDomainIds: SettingsByDomainId[];
  isScreenRecordingOn: boolean;
  gradeType: GradeType;
  startDate: Date;
  endDate: Date;
}

export class SettingsByDomainId {
  domainId: string;
  minScore: number;
}

/**
 * @description Client는 CRAA가 파는 AssessmentCycle을 파는 대상이 됩니다.제약사라고 보시면 됩니다.
 */
@Schema()
export class ClientUnit {
  readonly _id!: any;

  /**
   * @description 클라이언트 이름
   */
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false, default: '' })
  vendor: string;

  /**
   * @description 클라이언트 인증코드(AuthCode Collection에서 관리됩니다.)
   */
  @Prop({ required: false, default: '' })
  authCode!: string;

  /**
   * @description 이메일 화이트 리스트입니다. @gmail.com을 등록하면 해당 도메인이 아니면 막는 기능인데 구체적인 디자인이나 방안이 이야기 된 것이 없습니다. (구현시 활용)
   */
  @Prop({ required: false })
  whitelist!: Array<string>;

  /**
   * @description title
   */
  @Prop({ required: true })
  titles!: Array<string>;

  @Prop({ required: true, default: [], type: BusinessUnit })
  businessUnits: BusinessUnit[];

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type ClientUnitDocument = ClientUnit & Document;

export const ClientUnitSchema = SchemaFactory.createForClass(ClientUnit).set(
  'versionKey',
  false,
);
