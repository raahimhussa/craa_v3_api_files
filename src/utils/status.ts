export enum UserStatus {
  Approval = 'Approval',
  Dropout = 'Dropout',
  Verified = 'Verified',
}

export enum AnswerStatus {
  InCorrect = 'Incorrect',
  Correct = 'Correct',
  NotScored = 'NotScored',
}

export enum ScorerStatus {
  HasNotStarted = 'HasNotStarted',
  InProgress = 'InProgress',
  Complete = 'Complete',
}

export enum UserSimulationStatus {
  HasNotAssigned = 'HasNotAssigned',
  Assigned = 'Assigned',
  InProgress = 'InProgress',
  Pending = 'Pending',
  Scoring = 'Scoring',
  Adjudicating = 'Adjudicating',
  Reviewed = 'Reviewed',
  Exported = 'Exported',
  Published = 'Published',
  Distributed = 'Distributed',
}

export enum FindingStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export enum AssessmentStatus {
  Complete = 'Complete',
  Pending = 'Pending',
  InProgress = 'InProgress',
}

export enum AssessmentCycleType {
  Normal = 'NORMAL',
  Prehire = 'PREHIRE',
}

export enum SimulationType {
  None = 'None',
  Baseline = 'Baseline',
  Followup = 'Followup',
}

export enum UserTrainingStatus {
  HasNotStarted = 'HasNotStarted',
  InProgress = 'InProgress',
  Stopped = 'Stopped',
  Complete = 'Complete',
  PAUSE = 'Pause',
  Scoring = 'Scoring',
  Scored = 'Scored',
  Publishing = 'Publishing',
  Published = 'Published',
  HasNotAssigned = 'HasNotAssigned',
}

export enum DocumentType {
  StudyMedication = 'StudyMedication',
  RescueMedication = 'RescueMedication',
  Document = 'Document',
}

export enum GradeType {
  Basic = 'Basic',
  Continuum = 'Continuum',
}

export enum SimulationAnnouncementTemplateType {
  Agreement = 'Agreement',
  OnSubmission = 'OnSubmission',
}

export enum AgreementVariableKey {
  UserName = 'UserName',
  UserEmail = 'UserEmail',
  UserFirstName = 'UserFirstName',
  UserLastName = 'UserLastName',
}

export enum OnSubmissionVariableKey {
  UserName = 'UserName',
  UserEmail = 'UserEmail',
  UserFirstName = 'UserFirstName',
  UserLastName = 'UserLastName',
}
