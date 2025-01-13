import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import ScoringManagementService from './scoringManagement.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { MongoQuery } from 'src/common/interfaces/mongoose.entity';

@ApiTags('ScoringManagement')
@Controller()
export class ScoringManagementController {
  constructor(private readonly userDataService: ScoringManagementService) {}

  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.userDataService.find(query);
  }

  @Get('count')
  async count(@Query(new parseQueryPipe()) query: MongoQuery<any>) {
    return this.userDataService.count(query);
  }

  @Patch('assessments/:assessmentId/firstScorer/scoring')
  async submitFirstScorerScoring(
    @Param('assessmentId') assessmentId: string,
  ): Promise<any> {
    return this.userDataService.scoring(assessmentId, 'firstScorer');
  }

  @Patch('assessments/:assessmentId/secondScorer/scoring')
  async submitSecondScorerScoring(
    @Param('assessmentId') assessmentId: string,
  ): Promise<any> {
    return this.userDataService.scoring(assessmentId, 'secondScorer');
  }

  @Patch('assessments/:assessmentId/adjudicator/scoring')
  async submitAdjudicatorScoring(
    @Param('assessmentId') assessmentId: string,
  ): Promise<any> {
    return this.userDataService.scoring(assessmentId, 'adjudicator');
  }

  @Patch('userSimulations/:userSimulationId/publish')
  async publish(
    @Param('userSimulationId') userSimulationId: string,
  ): Promise<any> {
    return this.userDataService.publish(userSimulationId);
  }

  @ApiQuery({})
  @Post('userSimulations/:userSimulationId/retract')
  async retract(@Param('userSimulationId') userSimulationId: string) {
    return this.userDataService.retract(userSimulationId);
  }

  @Patch('userSimulations/:userSimulationId/baselinePreview')
  async baselinePreview(
    @Param('userSimulationId') userSimulationId: string,
  ): Promise<any> {
    return this.userDataService.baselinePreview(userSimulationId);
  }

  @Patch('userSimulations/:userSimulationId/followupPreview')
  async followupPreview(
    @Param('userSimulationId') userSimulationId: string,
  ): Promise<any> {
    return this.userDataService.followupPreview(userSimulationId);
  }
}
