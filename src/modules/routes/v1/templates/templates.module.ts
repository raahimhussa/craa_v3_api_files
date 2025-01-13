import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesController } from './templates.controller';
import TemplatesRepository from './templates.repository';
import TemplatesService from './templates.service';
import { Template, TemplateSchema } from './schemas/template.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Template.name,
        useFactory: () => {
          const schema = TemplateSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesRepository],
  exports: [TemplatesService, TemplatesRepository],
})
export default class TemplatesModule {}
