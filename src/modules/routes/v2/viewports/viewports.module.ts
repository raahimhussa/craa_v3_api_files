import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewportsController } from './viewports.controller';
import ViewportsRepository from './viewports.repository';
import ViewportsService from './viewports.service';
import { Viewport, ViewportSchema } from './schemas/viewport.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Viewport.name, schema: ViewportSchema },
    ]),
  ],
  controllers: [ViewportsController],
  providers: [ViewportsService, ViewportsRepository],
  exports: [ViewportsService, ViewportsRepository],
})
export default class ViewportsModule {}
