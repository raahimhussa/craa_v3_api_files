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
import { Policy } from './schemas/policy.schema';
import PolicyDto from './dto/policy.dto';
import PoliciesService from './policies.service';

@ApiTags('Policies')
@Controller()
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @ApiBody({ type: PolicyDto })
  @Post()
  async create(@Body() policy: PolicyDto): Promise<Policy | null> {
    return this.policiesService.create(policy);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Policy>) {
    return this.policiesService.find(query);
  }

  @ApiQuery({})
  @Get(':policyId')
  async findOne(
    @Param('policyId') policyId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Policy>,
  ) {
    if (policyId === 'custom') return this.policiesService.findOne(query);

    return this.policiesService.findById(policyId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Policy>): Promise<Policy | null> {
    return this.policiesService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Policy>,
  ): Promise<Policy[] | null> {
    return this.policiesService.delete(query);
  }
}
