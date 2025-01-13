import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorialsController } from './tutorials.controller';
import TutorialsRepository from './tutorials.repository';
import TutorialsService from './tutorials.service';
import { Tutorial, TutorialSchema } from './schemas/tutorial.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Tutorial.name,
        useFactory: () => {
          const schema = TutorialSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [TutorialsController],
  providers: [TutorialsService, TutorialsRepository],
  exports: [TutorialsService, TutorialsRepository],
})
export default class TutorialsModule {}
