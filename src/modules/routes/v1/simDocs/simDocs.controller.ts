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
import { MongoQuery, MongoUpdate } from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import SimDocDto from './dto/simDoc.dto';
import { SimDoc } from './schemas/simDoc.schema';
import SimDocsService from './simDocs.service';
import { Response } from 'express';

@ApiTags('SimDocs')
@Controller()
export class SimDocsController {
  constructor(private readonly simDocsService: SimDocsService) {}

  @Post()
  async create(@Body() simDoc: SimDocDto): Promise<SimDoc | null> {
    return this.simDocsService.create(simDoc);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<SimDoc>) {
    return this.simDocsService.find(query);
  }

  @Get('excel')
  async excel(@Res() res: Response) {
    const result = (await this.simDocsService.excelExport()) as string;
    return res.download(result);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<SimDoc>) {
    return this.simDocsService.update(body);
  }

  @Delete(':simDocId')
  async delete(@Param('simDocId') simDocId: string) {
    const query = {
      filter: {
        _id: simDocId,
      },
    };
    return this.simDocsService.delete(query);
  }
}
