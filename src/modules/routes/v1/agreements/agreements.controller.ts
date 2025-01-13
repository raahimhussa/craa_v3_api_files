import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Agreement, AgreementDocument } from './schemas/agreement.schema';
import AgreementDto from './dto/agreement.dto';
import AgreementsService from './agreements.service';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';

@ApiTags('Agreements')
@Controller()
export default class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  async create(@Body() agreement: AgreementDto): Promise<Agreement | null> {
    return this.agreementsService.create(agreement);
  }

  @ApiQuery({})
  @Get()
  async find(
    @Query(new parseQueryPipe()) query: MongoQuery<AgreementDocument>,
  ) {
    return this.agreementsService.find(query);
  }

  // @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<AgreementDocument>) {
    return this.agreementsService.update(body);
  }

  @Delete(':agreementId')
  async delete(
    @Param('agreementId') agreementId: MongoDelete<AgreementDocument>,
  ) {
    const query = {
      filter: {
        _id: agreementId,
      },
    };
    return this.agreementsService.delete(query);
  }
}
