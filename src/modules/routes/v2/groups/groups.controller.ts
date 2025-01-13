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
import { Group } from './schemas/group.schema';
import GroupDto from './dto/group.dto';
import GroupsService from './groups.service';

@ApiTags('Groups')
@Controller()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiBody({ type: GroupDto })
  @Post()
  async create(@Body() group: GroupDto): Promise<Group | null> {
    return this.groupsService.create(group);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Group>) {
    return this.groupsService.find(query);
  }

  @ApiQuery({})
  @Get(':groupId')
  async findOne(
    @Param('groupId') groupId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Group>,
  ) {
    if (groupId === 'custom') return this.groupsService.findOne(query);

    return this.groupsService.findById(groupId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Group>): Promise<Group | null> {
    return this.groupsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Group>,
  ): Promise<Group[] | null> {
    return this.groupsService.delete(query);
  }
}
