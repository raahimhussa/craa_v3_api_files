import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsController } from './subjects.controller';
import SubjectsRepository from './subjects.repository';
import SubjectsService from './subjects.service';
import { Subject, SubjectSchema } from './schemas/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Subject.name,
        useFactory: () => {
          const schema = SubjectSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService, SubjectsRepository],
  exports: [SubjectsService, SubjectsRepository],
})
export default class SubjectsModule {}
