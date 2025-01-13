import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import TemplateDto from './dto/template.dto';
import TemplatesRepository from './templates.repository';
import { Template, TemplateDocument } from './schemas/template.schema';

@Injectable()
export default class TemplatesService {
  constructor(private readonly templatesRepository: TemplatesRepository) {}

  create(template: TemplateDto): Promise<Template | null> {
    return this.templatesRepository.create(template);
  }

  find(
    query: MongoQuery<Template>,
  ): Promise<Template | null> | Promise<Template[] | null> {
    const multi: boolean | undefined = query.options?.multi;

    if (!multi) {
      return this.templatesRepository.findOne(query);
    }
    return this.templatesRepository.find(query);
  }

  update(body: MongoUpdate<TemplateDocument>) {
    if (body.options?.multi) {
      return this.templatesRepository.updateOne(body);
    }
    return this.templatesRepository.updateMany(body);
  }

  delete(query: MongoDelete<TemplateDocument>) {
    return this.templatesRepository.deleteOne(query);
  }
}
