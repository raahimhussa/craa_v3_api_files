import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import CreateRoleDto from './dto/createRole.dto';
import { RolesService } from './roles.service';
import { RoleDocument } from './schemas/roles.schema';

@ApiTags('Roles')
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<RoleDocument>) {
    return this.rolesService.find(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<RoleDocument>) {
    return this.rolesService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(@Query(new parseQueryPipe()) query: DeleteQuery<RoleDocument>) {
    return this.rolesService.delete(query);
  }
}
