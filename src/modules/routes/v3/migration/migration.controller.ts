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
  Res,
} from '@nestjs/common';

import MigrationService from './migration.service';
import { Response } from 'express';

@ApiTags('Migration')
@Controller()
export class MigrationsController {
  constructor(private readonly migrationService: MigrationService) {}

  @ApiQuery({})
  @Get('test')
  async test(@Query() { version }: { version: string }) {
    return this.migrationService.test(version);
  }

  @ApiQuery({})
  @Get('info')
  async info() {
    return this.migrationService.getMigratedCollection();
  }

  @ApiQuery({})
  @Get('users')
  async migrateUsers(@Query() { version }: { version: string }) {
    return this.migrationService.migrateUsers(version);
  }

  @ApiQuery({})
  @Delete('all')
  async deleteMigrateAll() {
    return this.migrationService.deleteAll();
  }

  @ApiQuery({})
  @Delete('users')
  async deleteMigrateUsers() {
    return this.migrationService.deleteMigrateUsers();
  }

  @ApiQuery({})
  @Delete('findings')
  async deleteMigrateFindings() {
    return this.migrationService.deleteMigrateFindings();
  }

  @ApiQuery({})
  @Delete('findingGroups')
  async deleteMigrateFindingGroups() {
    return this.migrationService.deleteMigrateFindingGroup();
  }

  @ApiQuery({})
  @Delete('trainings')
  async deleteMigrateTrainings() {
    return this.migrationService.deleteMigrateTrainings();
  }

  @ApiQuery({})
  @Delete('assessmentCycles')
  async deleteMigrateAssessmentCycles() {
    return this.migrationService.deleteMigrateAssessmentCycles();
  }

  @ApiQuery({})
  @Delete('assessmentTypes')
  async deleteMigrateAssessmentTypes() {
    return this.migrationService.deleteMigrateAssessmentTypes();
  }

  @ApiQuery({})
  @Delete('simulations')
  async deleteMigrateSimulations() {
    return this.migrationService.deleteMigrateSimulations();
  }

  @ApiQuery({})
  @Delete('clientUnits')
  async deleteMigrateClientUnits() {
    return this.migrationService.deleteMigrateClientUnits();
  }

  @ApiQuery({})
  @Delete('simulationMappers')
  async deleteMigrateSimulationMappers() {
    return this.migrationService.deleteMigrateSimulationMappers();
  }

  @ApiQuery({})
  @Delete('userSimulations')
  async deleteMigrateUserSimulations() {
    return this.migrationService.deleteMigrateUserSimulations();
  }

  @ApiQuery({})
  @Delete('userTrainings')
  async deleteMigrateUserTrainings() {
    return this.migrationService.deleteMigrateUserTrainings();
  }

  @ApiQuery({})
  @Delete('userAssessmentCycles')
  async deleteMigrateUserAssessmentCycles() {
    return this.migrationService.deleteMigrateUserAssessmentCycles();
  }

  @ApiQuery({})
  @Delete('userAssessmentCycleSummaries')
  async deleteMigrateUserAssessmentCycleSummaries() {
    return this.migrationService.deleteMigrateUserAssessmentCycleSummaries();
  }

  @ApiQuery({})
  @Delete('keyConcepts')
  async deleteKeyConcepts() {
    return this.migrationService.deleteMigrateKeyConcepts();
  }

  @ApiQuery({})
  @Delete('assessments')
  async deleteAssessments() {
    return this.migrationService.deleteMigrateAssessments();
  }

  @ApiQuery({})
  @Delete('simDocs')
  async deleteSimDocs() {
    return this.migrationService.deleteMigrateSimDocs();
  }

  @ApiQuery({})
  @Delete('folders')
  async deleteFolders() {
    return this.migrationService.deleteMigrateFolders();
  }

  @ApiQuery({})
  @Delete('notes')
  async deleteNotes() {
    return this.migrationService.deleteMigrateNotes();
  }

  @ApiQuery({})
  @Delete('answers')
  async deleteAnswers() {
    return this.migrationService.deleteMigrateAnswers();
  }

  @ApiQuery({})
  @Get('simulations')
  async migrateSimulations(@Query() { version }: { version: string }) {
    return this.migrationService.migrateSimulations(version);
  }

  @ApiQuery({})
  @Get('assessmentCycles')
  async migrateAssessmentCycles(@Query() { version }: { version: string }) {
    return this.migrationService.migrateAssessmentCycles(version);
  }

  @ApiQuery({})
  @Get('clientUnits')
  async migrateClientUnits(@Query() { version }: { version: string }) {
    return this.migrationService.migrateClients(version);
  }

  @ApiQuery({})
  @Get('userSimulations')
  async migrateUserSimulationsPfizer(
    @Query() { version }: { version: string },
  ) {
    return this.migrationService.migrateUserSimulations(version);
  }

  @ApiQuery({})
  @Get('userAssessmentCycles')
  async migrateUserAssessmentCycles(@Query() { version }: { version: string }) {
    return this.migrationService.migrateUserAssessmentCycles(version);
  }

  @ApiQuery({})
  @Get('userAssessmentCycleSummaries')
  async migrateUserAssessmentCycleSummaries(
    @Query() { version }: { version: string },
  ) {
    return this.migrationService.migrateUserAssessmentCycleSummary(version);
  }

  @ApiQuery({})
  @Get('matchingCount')
  async getMatchingCount(@Query() { version }: { version: string }) {
    return this.migrationService.getMatchingCounts(version);
  }

  @ApiQuery({})
  @Get('findings')
  async migrateFindings(@Query() { version }: { version: string }) {
    return this.migrationService.migrateFindings(version);
  }

  @ApiQuery({})
  @Get('findingGroups')
  async migrateFindingGroups(@Query() { version }: { version: string }) {
    return this.migrationService.migrateFindingGroups(version);
  }

  @ApiQuery({})
  @Get('simulationMappers')
  async migrateSimulationMappers(@Query() { version }: { version: string }) {
    return this.migrationService.migrateSimulationMappers(version);
  }

  @ApiQuery({})
  @Get('trainings')
  async migrateTrainings(@Query() { version }: { version: string }) {
    return this.migrationService.migrateTrainings(version);
  }

  @ApiQuery({})
  @Get('userTrainings')
  async migrateUserTrainings(@Query() { version }: { version: string }) {
    return this.migrationService.migrateUserTrainings(version);
  }

  @ApiQuery({})
  @Get('keyConcepts')
  async migrateKeyConcepts(@Query() { version }: { version: string }) {
    return this.migrationService.migrateKeyConcepts(version);
  }

  @ApiQuery({})
  @Get('assessments')
  async migrateAssessments(@Query() { version }: { version: string }) {
    return this.migrationService.migrateAssessments(version);
  }

  @ApiQuery({})
  @Get('simDocs')
  async migrateSimDocs(@Query() { version }: { version: string }) {
    return this.migrationService.migrateSimDocs(version);
  }

  @ApiQuery({})
  @Get('folders')
  async migrateFolders(@Query() { version }: { version: string }) {
    return this.migrationService.migrateFolders(version);
  }

  @ApiQuery({})
  @Get('notes')
  async migrateMonitoringNotes(@Query() { version }: { version: string }) {
    await this.migrationService.migrateMonitoringNotes(version);
    return await this.migrationService.migrateComplianceNotes(version);
  }

  @ApiQuery({})
  @Get('answers')
  async migrateMonitoringAnswers(@Query() { version }: { version: string }) {
    return await this.migrationService.migrateAnswers(version);
  }
}
