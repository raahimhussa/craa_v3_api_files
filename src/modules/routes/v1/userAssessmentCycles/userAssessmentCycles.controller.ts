import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Res,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import { UserAssessmentCyclesService } from './userAssessmentCycles.service';
import {
  UserAssessmentCycle,
  UserAssessmentCycleDocument,
} from './schemas/userAssessmentCycle.schema';
import CreateUserAssessmentCycleDto from './dto/userAssessmentCycle.dto';
import AssignedAC from './dto/assignedAC.dto';

@ApiTags('UserAssessmentCycle')
@Controller()
export class UserAssessmentCyclesController {
  constructor(
    private readonly userAssessmentCyclesService: UserAssessmentCyclesService,
  ) {}

  @ApiBody({ type: CreateUserAssessmentCycleDto })
  @Post()
  async create(
    @Body() createUserAssessmentCycleDto: CreateUserAssessmentCycleDto,
  ) {
    return this.userAssessmentCyclesService.create(
      createUserAssessmentCycleDto,
    );
  }

  // @Post('assigned')
  // async assign(
  //   @Body('assessmentCycleId') assessmentCycleId,
  //   @Body('userId') userId,
  // ) {
  //   return this.userAssessmentCyclesService.assignToUserAC(
  //     assessmentCycleId,
  //     userId,
  //   );
  // }

  @ApiQuery({})
  @Patch('renewSummary')
  async renewSummary(@Body() body: PatchBody<UserAssessmentCycleDocument>) {
    return this.userAssessmentCyclesService.renewSummary(body);
  }

  @ApiQuery({})
  @Get('baselines')
  async getSimulations(
    @Query(new parseQueryPipe()) query: FindQuery<UserAssessmentCycleDocument>,
  ) {
    return this.userAssessmentCyclesService.getGroupedSimulation(query);
  }

  @ApiQuery({})
  @Post('baselineCnts')
  async baselineCnts(
    @Query(new parseQueryPipe()) query: FindQuery<UserAssessmentCycleDocument>,
  ) {
    return this.userAssessmentCyclesService.getSimulationCnt(query);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: FindQuery<UserAssessmentCycleDocument>,
  ) {
    return this.userAssessmentCyclesService.find(query);
  }

  @ApiQuery({})
  @Get('userStatusManagement/excel')
  async userStatusManagementExcel(
    @Query(new parseQueryPipe()) query: FindQuery<UserAssessmentCycleDocument>,
  ) {
    const data =
      await this.userAssessmentCyclesService.userStatusManagementExcel(query);
    return data;
  }

  @ApiQuery({})
  @Get('/count')
  async getNumberOfElement(
    @Query(new parseQueryPipe()) query: FindQuery<UserAssessmentCycle>,
  ) {
    return this.userAssessmentCyclesService.getNumberOfElement(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<UserAssessmentCycleDocument>) {
    return this.userAssessmentCyclesService.update(body);
  }

  @ApiQuery({})
  @Delete('/:userAssessmentCycleId/cascade')
  async cascadeDelete(
    @Param('userAssessmentCycleId') userAssessmentCycleId: string,
  ) {
    return this.userAssessmentCyclesService.cascadeDelete(
      userAssessmentCycleId,
    );
  }

  @ApiQuery({})
  @Delete()
  async delete(
    @Query(new parseQueryPipe())
    query: DeleteQuery<UserAssessmentCycleDocument>,
  ) {
    return this.userAssessmentCyclesService.delete(query);
  }
}
