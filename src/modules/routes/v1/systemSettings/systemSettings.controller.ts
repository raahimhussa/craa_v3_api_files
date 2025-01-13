import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import SystemSettingsService from './systemSettings.service';

@ApiTags('SystemSettings')
@Controller()
export default class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @ApiQuery({})
  @Get()
  async findAll() {
    return this.systemSettingsService.findAll();
  }

  @ApiQuery({})
  @Get('demoVersion')
  async findDemoVersion() {
    return this.systemSettingsService.findDemoDbVersion();
  }

  @Post('demoVersion')
  async createDemoVersion() {
    return this.systemSettingsService.createDemoVersion();
  }

  @Patch('demoVersion')
  async updateDemoVersion(@Body('version') version: string) {
    console.log({ version });
    return this.systemSettingsService.updateDemoVersion(version);
  }
}
