import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { Setting } from './schemas/setting.schema';
import SettingDto from './dto/setting.dto';
import SettingsService from './settings.service';

@ApiTags('Settings')
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiBody({ type: SettingDto })
  @Post()
  async create(@Body() setting: SettingDto): Promise<Setting | null> {
    return this.settingsService.create(setting);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Setting>) {
    return this.settingsService.find(query);
  }

  @ApiQuery({})
  @Get(':settingId')
  async findOne(
    @Param('settingId') settingId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Setting>,
  ) {
    if (settingId === 'custom') return this.settingsService.findOne(query);

    return this.settingsService.findById(settingId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Setting>): Promise<Setting | null> {
    return this.settingsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Setting>,
  ): Promise<Setting[] | null> {
    return this.settingsService.delete(query);
  }
}
