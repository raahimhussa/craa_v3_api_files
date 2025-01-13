import { IsString } from 'class-validator';

export default class CreateAssessmentDto {
  userSimulationId: string;

  status: string;

  firstScorer: {
    _id: string;
    status: string;
    scoringTime: number;
  };

  secondScorer: {
    _id: string;
    status: string;
    scoringTime: number;
  };

  adjudicator: {
    _id: string;
    status: string;
  };

  isExpedited: boolean;

  isDeleted: boolean;

  createdAt?: Date;

  publishedAt?: Date;

  distributedAt?: Date;

  updatedAt?: Date;

  isDemo?: boolean;

  demoId?: string;
}
