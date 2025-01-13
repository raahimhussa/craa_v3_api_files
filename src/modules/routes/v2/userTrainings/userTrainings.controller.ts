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
import { UserTraining } from './schemas/userTraining.schema';
import UserTrainingDto from './dto/userTraining.dto';
import UserTrainingsService from './userTrainings.service';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@ApiTags('UserTrainings')
@Controller()
export class UserTrainingsController {
  constructor(private readonly userTrainingsService: UserTrainingsService) {}

  @ApiBody({})
  @Post()
  async create(
    @Body() userTraining: UserTrainingDto,
  ): Promise<UserTraining | null> {
    return this.userTrainingsService._create(userTraining);
  }

  @ApiQuery({})
  @Get('/originalFind')
  async findWithOriginal(
    @Query(new parseQueryPipe()) query: MongoQuery<UserTraining>,
  ) {
    return this.userTrainingsService.findWithOriginal(query);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<UserTraining>) {
    return this.userTrainingsService.find(query);
  }

  @ApiQuery({})
  @Get(':userTrainingId')
  async findOne(
    @Param('userTrainingId') userTrainingId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<UserTraining>,
  ) {
    if (userTrainingId === 'custom')
      return this.userTrainingsService.findOne(query);

    return this.userTrainingsService.findById(userTrainingId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<UserTraining>) {
    return this.userTrainingsService.update(body);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: MongoDelete<UserTraining>) {
    return this.userTrainingsService.delete(query);
  }

  @Delete(':userTrainingId')
  async deleteOne(
    @Param('userTrainingId') userTrainingId: string,
  ): Promise<UserTraining[] | null> {
    return this.userTrainingsService.deleteOne(userTrainingId);
  }

  @Patch(':userTrainingId/summarize')
  async summarize(@Param('userTrainingId') userTrainingId: string) {
    return this.userTrainingsService.summarize(userTrainingId);
  }
}
