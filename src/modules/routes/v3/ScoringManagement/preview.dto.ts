export type PreviewInfoDto = {
  user: {
    _id: string;
    name: string;
    country: string;
  };
  simulationType: string;
  usageTime: number;
};

export type ResultSummaryDto = {
  domain: {
    _id: string;
    label: string;
  };
  baseline: {
    _id: string;
    score: number;
    pass: boolean;
  };
  followup: {
    _id: string;
    score: number;
  } | null;
  keyConcepts: {
    _id: string;
    label: string;
  }[];
}[];

export type ScoreBySeverityDto = {
  severity: number;
  percentIdentifiedFindings: number;
  identifiedFindingsCount: number;
  notIdentifiedFindingsCount: number;
  allFindingsCount: number;
}[];

export type ScoreByDomainDto = {
  domain: {
    _id: string;
    label: string;
  };
  percentIdentifiedFindings: number;
  identifiedFindingsCount: number;
  notIdentifiedFindingsCount: number;
  allFindingsCount: number;
}[];

//TODO - Compliance Calculation Score DTO

export type ProcessIssuesDto = {
  process: string;
  result: number;
  documents: {
    _id: string;
    label: string;
  }[];
}[];

export type UnidentifiedFindingsDto = {
  finding: {
    _id: string;
    label: string;
  };
  severity: number;
  domain: {
    _id: string;
    label: string;
  };
  documents: {
    _id: string;
    label: string;
  }[];
  evaluation: string;
  relevantICHGCP: string;
}[];

export type MonitoringNotesDto = {
  _id: string;
  order: number;
  document: {
    _id: string;
    label: string;
  };
  text: string;
  nonErrorComment: string;
}[];
