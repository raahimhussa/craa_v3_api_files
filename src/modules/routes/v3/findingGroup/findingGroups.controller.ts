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
import { FindingGroup } from './schemas/findingGroup.schema';
import FindingGroupDto from './dto/findingGroup.dto';
import FindingGroupsService from './findingGroups.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@ApiTags('FindingGroups')
@Controller()
export class FindingGroupsController {
  constructor(private readonly findingGroupsService: FindingGroupsService) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() findingGroup: FindingGroupDto,
  ): Promise<FindingGroup | null> {
    return this.findingGroupsService.create(findingGroup);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<FindingGroup>) {
    return this.findingGroupsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<FindingGroup>) {
    return this.findingGroupsService.update(body);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: MongoDelete<FindingGroup>) {
    return this.findingGroupsService.delete(query);
  }
}
