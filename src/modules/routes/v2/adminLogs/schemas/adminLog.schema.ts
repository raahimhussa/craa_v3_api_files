import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export enum AdminLogScreen {
  // undefined
  Undefined = 'undefined',
  // Security
  SignInSecurity = 'signInSecurity',
  // Data
  DataDump = 'dataDump',
  BUTRStatus = 'BUTRStatus',
  // Users
  Roles = 'roles',
  Clients = 'clients',
  UserManagement = 'userManagement',
  SimManagement = 'simManagement',
  UserStatusManagement = 'userStatusManagement',
  InvoiceManagement = 'invoiceManagement',
  Permissions = 'permissions',
  LogExports = 'logExports',
  // Scoring
  ScoringManagement = 'scoringManagement',
  Scores = 'scores',
  Scoring = 'scoring',
  Adjudications = 'adjudications',
  Adjudicating = 'adjudicating',
  Review = 'review',
  Performance = 'performance',
  SimDistribution = 'simDistribution',
  // Assessment Cycles
  AssessmentCycles = 'assessmentCycles',
  AssessmentTypes = 'assessmentTypes',
  PDFFiles = 'pdfFiles',
  Resources = 'resources',
  Simulations = 'simulations',
  // Resource
  DocumentFindings = 'documentFindings',
  Instructions = 'instructions',
  Protocols = 'protocols',
  // Findings
  Findings = 'findings',
  KeyConcepts = 'keyConcepts',
  Domains = 'domains',
  // Systems
  PrivacyPolicy = 'privacyPolicy',
  EmailTemplates = 'emailTemplates',
  Settings = 'settings',
  Migration = 'migration',
  // Training Portal
  Training = 'training',
}

export enum AdminLogEvent {
  // Common
  Export = 'export',
  // Add
  Add = 'add',
  // Edit
  Edit = 'edit',
  // Delete
  Delete = 'delete',
  // // Security
  // SignInSecurity,
  // // Data
  // DataDump,
  // BUTRStatus,
  // // Users
  // Roles,
  // Clients,
  // UserManagement,
  AssignSimulation = 'assignSimulation',
  RemoveSimulation = 'removeSimulation',
  // SimManagement,
  ReopenSimulation = 'reopenSimulation',
  ReAllocateSimulation = 'reallocateSimulation',
  // UserStatusManagement,
  Verify = 'verify',
  SignOff = 'signOff',
  // InvoiceManagement,
  Invoice = 'invoice',
  // Permissions,
  Permission = 'permission',
  // LogExports,
  // // Scoring
  // ScoringManagement,
  ScoringSetting = 'scoringSetting',
  PublishSimulation = 'publishSimulation',
  ExpediteSimulation = 'expediteSimulation',
  Scorer = 'scorer',
  ScorerStatus = 'scorerStatus',
  RetractSimulation = 'retractSimulation',
  // Scores, = start, pause, submit, continue
  Scoring = 'scoring',
  // Scoring,
  // etc..
  // Adjudications, = start, pause, submit, continue
  Adjudicating = 'adjudicating',
  // Adjudicating,
  // Review,
  // Performance,
  // SimDistribution,
  DistributeSimulation = 'distributeSimulation',
  // // Assessment Cycles
  // AssessmentCycles,
  // AssessmentTypes,
  // PDFFiles,
  // Resources,
  Resource = 'resource',
  // AddFolderToSimulation = 'addFolderToSimulation',
  // DeleteFolderFromSimulation = 'deleteFolderFromSimulation',
  // AddDocumentToSimulation = 'addDocumentToSimulation',
  // DeleteDocumentFromSimulation = 'deleteDocumentFromSimulation',
  // AddFindingToDocument = 'addFindingToDocument',
  // DeleteFindingsFromDocument = 'deleteFindingsFromDocument',
  // SelectPDFFileToDocument = 'selectPDFFileToDocument',
  // SelectHTMLFileToDocument = 'selectHTMLFileToDocument',
  // ChangeDocumentType = 'changeDocumentType',
  // SaveDocumentPillData = 'saveDocumentPillData',
  // Simulations,
  // // Findings
  // Findings,
  ImportFindings = 'importFindings',
  // KeyConcepts,
  // Domains,
  // // Systems
  // PrivacyPolicy,
  // EmailTemplates,
  // Settings,
  // Migration,
  MigrationDemoVersion = 'changeMigrationDemoVersion',
  Migration = 'migration',
}

class Resource {
  [key: string]: any;
}

class TargetObject {
  type: string;
  [key: string]: any;
  path: string;
  origin: string;
  new: string;
}

@Schema({ collection: 'adminLogs' })
export class AdminLog {
  readonly _id!: any;

  /**
   * @description 활동스크린
   */
  @Prop({ required: true })
  screen: AdminLogScreen;

  /**
   * @description 유저 행위
   */
  @Prop({ required: true })
  event: AdminLogEvent;

  /**
   * @description 유저 행위
   */
  @Prop({ required: false, default: null })
  userId: string | null;

  @Prop({ required: false, default: null })
  userName: string | null;

  /**
   * @description 유저 행위
   */
  @Prop({ required: false, default: null })
  role: string | null;

  /**
   * @description 타겟 오브젝트 정보
   */
  @Prop({ required: false, type: TargetObject })
  target: TargetObject;

  /**
   * @description 변경 데이터 (전)
   */
  @Prop({ required: false, type: Resource })
  resource: Resource;

  /**
   * @description 로그 메세지
   */
  @Prop({ required: false, default: '' })
  message: string;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: false, default: [] })
  reviewers!: Array<string>;
}

export type AdminLogDocument = AdminLog & Document;

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);
