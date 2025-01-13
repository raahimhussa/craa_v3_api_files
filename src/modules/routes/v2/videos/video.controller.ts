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
import { Video } from './schemas/video.schema';
import VideoDto from './dto/video';
import VideosService from './video.service';

@ApiTags('Videos')
@Controller()
export class VideosController {
  constructor(private readonly VideosService: VideosService) {}

  @ApiBody({ type: VideoDto })
  @Post()
  async create(@Body() video: VideoDto): Promise<Video | null> {
    return this.VideosService.create(video);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Video>) {
    return this.VideosService.find(query);
  }

  @ApiQuery({})
  @Get(':videoId')
  async findOne(
    @Param('videoId') videoId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Video>,
  ) {
    if (videoId === 'custom') return this.VideosService.findOne(query);

    return this.VideosService.findById(videoId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() video: Video): Promise<Video | null> {
    return this.VideosService.update(video);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Video>,
  ): Promise<Video[] | null> {
    return this.VideosService.delete(query);
  }

  @Delete(':videoId')
  async deleteOne(@Param('videoId') videoId: string): Promise<Video[] | null> {
    return this.VideosService.deleteOne(videoId);
  }
}
