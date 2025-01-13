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
import { Domain } from './schemas/domain.schema';
import DomainDto from './dto/domain.dto';
import DomainsService from './domains.service';
import { Response } from 'express';

@ApiTags('Domains')
@Controller()
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @ApiBody({ type: DomainDto })
  @Post()
  async create(@Body() domain: DomainDto): Promise<Domain | null> {
    return this.domainsService.create(domain);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Domain>) {
    return this.domainsService.find(query);
  }

  @Get('excel')
  async excel(@Res() res: Response) {
    const result = (await this.domainsService.excelExport()) as string;
    return res.download(result);
  }

  @ApiQuery({})
  @Get(':domainId')
  async findOne(
    @Param('domainId') domainId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Domain>,
  ) {
    if (domainId === 'custom') return this.domainsService.findOne(query);

    return this.domainsService.findById(domainId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Domain>): Promise<Domain | null> {
    return this.domainsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Domain>,
  ): Promise<Domain[] | null> {
    return this.domainsService.delete(query);
  }
}
