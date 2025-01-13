import { Video, VideoSchema } from './schemas/video.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideosController } from './video.controller';
import VideosRepository from './video.repository';
import VideosService from './video.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideosController],
  providers: [VideosService, VideosRepository],
  exports: [VideosService, VideosRepository],
})
export default class VideoModule {}
