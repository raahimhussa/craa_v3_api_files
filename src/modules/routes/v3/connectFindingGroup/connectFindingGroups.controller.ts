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
import { ConnectFindingGroup } from './schemas/connectFindingGroup.schema';
import ConnectFindingGroupDto from './dto/connectFindingGroup.dto';
import ConnectFindingGroupsService from './connectFindingGroups.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@ApiTags('ConnectFindingGroups')
@Controller()
export class ConnectFindingGroupsController {
  constructor(
    private readonly connectFindingGroupsService: ConnectFindingGroupsService,
  ) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() connectFindingGroup: ConnectFindingGroupDto,
  ): Promise<ConnectFindingGroup | null> {
    return this.connectFindingGroupsService.create(connectFindingGroup);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: MongoQuery<ConnectFindingGroup>,
  ) {
    return this.connectFindingGroupsService.find(query);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<ConnectFindingGroup>) {
    return this.connectFindingGroupsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<ConnectFindingGroup>,
  ) {
    return this.connectFindingGroupsService.delete(query);
  }
}
