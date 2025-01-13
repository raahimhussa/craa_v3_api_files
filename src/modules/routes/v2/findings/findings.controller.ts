import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { Finding } from './schemas/finding.schema';
import FindingDto, { FindingsArray } from './dto/finding.dto';
import FindingsService from './findings.service';
import { Response } from 'express';

@ApiTags('Findings')
@Controller()
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @ApiBody({ type: FindingDto })
  @Post()
  async create(@Body() finding: FindingDto): Promise<Finding | null> {
    return this.findingsService.create(finding);
  }

  @ApiBody({})
  @Post('/bulkCreate')
  async createFindings(@Body() findingsArray: FindingsArray) {
    return this.findingsService.bulkCreate(findingsArray);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Finding>) {
    return this.findingsService.find(query);
  }

  // @ApiQuery({})
  // @Get('withJoin')
  // async findWithJoin(@Query(new parseQueryPipe()) query: MongoQuery<Finding>) {
  //   return this.findingsService.findWithJoin(query);
  // }

  @ApiQuery({})
  @Get('/count')
  async getNumberOfElement(
    @Query(new parseQueryPipe()) query: MongoQuery<Finding>,
  ) {
    return this.findingsService.getNumberOfElement(query);
  }

  @ApiQuery({})
  @Get(':findingId')
  async findOne(
    @Param('findingId') findingId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Finding>,
  ) {
    if (findingId === 'custom') return this.findingsService.findOne(query);

    return this.findingsService.findById(findingId);
  }

  @ApiQuery({})
  @Get('/simulations/:simulationId/simDocs')
  async getRelatedFindings(@Param('simulationId') simulationId: string) {
    return this.findingsService.getRelatedSimDocs(simulationId);
  }

  @ApiQuery({})
  @Get('/excel/sample')
  async sampleExcel(@Res() res: Response) {
    const result = (await this.findingsService.sampleExcelExport()) as string;
    return res.download(result);
  }

  @ApiQuery({})
  @Get('/excel/filter')
  async excel(
    @Query(new parseQueryPipe()) query: MongoQuery<Finding>,
    @Res() res: Response,
  ) {
    const result = (await this.findingsService.excelExport(query)) as string;
    return res.download(result);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Finding>): Promise<Finding | null> {
    return this.findingsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Finding>,
  ): Promise<Finding[] | null> {
    return this.findingsService.delete(query);
  }
}
