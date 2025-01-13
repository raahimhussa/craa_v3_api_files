import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SimulationType, UserSimulationStatus } from 'src/utils/status';

import { Answer } from '../../answers/schemas/answer.schema';
import { Document } from 'mongoose';
import { Finding } from '../../findings/schemas/finding.schema';
import { Simulation } from 'src/modules/routes/v1/simulations/schemas/simulation.schema';

export class Result {
  scoreByDomain: Array<ScoreByDomain>;
  scoreByMainDomain: Array<ScoreByDomain>;
  identifiedScoreBySeverity: Array<IdentifiedScoreBySeverity>;
  identifiedScoreByDomain: Array<IdentifiedScoreByDomain>;
  identifiedScoreByMainDomain: Array<IdentifiedScoreByDomain>;
  identifiedAnswers: Answer[];
  notIdentifiedAnswers: Answer[];
  identifiedFindings: Finding[];
  notIdentifiedFindings: Finding[];
  studyMedication: StudyMedication[];
  rescueMedication: RescueMedication[];
}

export type StudyMedication = {
  documentId: number;
  documentName: string;
  numberOfPillsTakenBySubject: {
    input: string;
    correctAnswer: string;
  };
  numberOfPillsPrescribed: {
    input: string;
    correctAnswer: string;
  };
  percent: {
    input: string;
    correctAnswer: string;
  };
};

export type RescueMedication = {
  documentId: number;
  documentName: string;
  numberOfPillsTakenBySubject: {
    input: string;
    correctAnswer: string;
  };
};

type ScoreByDomain = {
  domainId: string;
  name: string;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  allAnswersCount: number;
  pass: boolean;
  minScore: number;
  score: number;
};

type IdentifiedScoreBySeverity = {
  severity: number;
  identifiedFindings: Finding[];
  notIdentifiedFindings: Finding[];
  allFindings: Finding[];
};

type IdentifiedScoreByDomain = {
  domainId: string;
  identifiedFindings: Finding[];
  notIdentifiedFindings: Finding[];
  allFindings: Finding[];
};

export class Instruction {
  assessmentTypeId: string;

  isViewed: boolean;
}

export class Protocol {
  assessmentTypeId: string;
  isViewed: boolean;
}

export class StudyLog {
  assessmentTypeId: string;
  isViewed: boolean;
}

@Schema({ collection: 'userSimulations' })
export class UserSimulation {
  readonly _id: string;
  /**
   * @description 유저 아이디
   */
  @Prop({ required: true })
  userId: string;

  // type: userBaseline or userFollowup
  @Prop({ required: false, default: null })
  simulationType: SimulationType;

  @Prop({ required: true })
  simulationId: string;

  @Prop({ required: false })
  simulation?: Simulation;

  @Prop({ required: false })
  domainId: string;

  // 최소한의 노력만 함 (true가 안좋은 것)
  @Prop({ required: false, default: false })
  minimumEffort: boolean;

  // 치팅 의심
  @Prop({ required: false, default: false })
  unusualBehavior: boolean;

  @Prop({
    required: false,
    default: {},
  })
  results: Result;
  /**
   * @description assessmentType.baseline.testTime(source) - usageTime = remaingTime
   */
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  usageTime: number;

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  testTime: number;

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  minimumHour: number;

  @Prop({
    required: true,
    type: Boolean,
    default: false,
  })
  isAgreed: number;

  // dead line day
  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  deadline: number;

  /**
   * @description 베이스라인의 상태
   */
  @Prop({
    required: true,
    default: UserSimulationStatus.Assigned,
  })
  status: UserSimulationStatus;

  /**
   * @description 베이스라인의 문서 상태
   */
  @Prop({
    required: true,
    default: [],
  })
  instructions: Instruction[];

  /**
   * @description 베이스라인의 문서 상태
   */
  @Prop({
    required: true,
    default: [],
  })
  protocols: Protocol[];

  /**
   * @description 시도횟수
   */
  @Prop({
    required: true,
    default: 0,
  })
  attemptCount: number;

  /**
   * @description 베이스라인 문서 상태(봤는지)
   */
  @Prop({
    required: true,
    default: [],
  })
  studyLogs: StudyLog[];

  @Prop({
    required: false,
    default: 0,
  })
  reopenCount: number;

  @Prop({
    required: true,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    required: false,
    default: true,
  })
  isActivated: boolean;

  @Prop({
    required: false,
    default: null,
  })
  startedAt: Date;

  @Prop({
    required: false,
    default: null,
  })
  assignedAt: Date;

  @Prop({
    required: false,
    default: null,
  })
  submittedAt: Date;

  @Prop({
    required: false,
    default: null,
  })
  publishedAt: Date;

  @Prop({
    required: false,
    default: null,
  })
  distributedAt: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({
    required: false,
    default: '',
  })
  demoId: string;

  @Prop({ required: false, default: false })
  isDemo: boolean;
}

export type UserSimulationDocument = UserSimulation & Document;

export const UserSimulationSchema =
  SchemaFactory.createForClass(UserSimulation);
