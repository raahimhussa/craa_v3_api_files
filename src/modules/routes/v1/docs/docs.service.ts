import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import CreateDocDto from './dto/createDoc.dto';
import DocsRepository from './docs.repository';
import { DocDocument } from './schemas/doc.schema';

@Injectable()
export class DocsService {
  constructor(private readonly docsRepository: DocsRepository) {}

  create(createDocDto: CreateDocDto) {
    return this.docsRepository.create(createDocDto);
  }

  find(query: FindQuery<DocDocument>) {
    if (query.options?.multi) {
      return this.docsRepository.find(query);
    }
    return this.docsRepository.findOne(query);
  }

  update(body: PatchBody<DocDocument>) {
    if (body.options?.multi) {
      return this.docsRepository.updateOne(body);
    }
    return this.docsRepository.updateMany(body);
  }

  delete(query: DeleteQuery<DocDocument>) {
    return this.docsRepository.deleteOne(query);
  }
}
