import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenRecordersController } from './screenRecorders.controller';
import ScreenRecordersRepository from './screenRecorders.repository';
import ScreenRecordersService from './screenRecorders.service';
import {
  ScreenRecorder,
  ScreenRecorderSchema,
} from './schemas/screenRecorder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScreenRecorder.name, schema: ScreenRecorderSchema },
    ]),
  ],
  controllers: [ScreenRecordersController],
  providers: [ScreenRecordersService, ScreenRecordersRepository],
  exports: [ScreenRecordersService, ScreenRecordersRepository],
})
export default class ScreenRecordersModule {}
