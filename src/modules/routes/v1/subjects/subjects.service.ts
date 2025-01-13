import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import SubjectDto from './dto/subject.dto';
import SubjectsRepository from './subjects.repository';
import { Subject, SubjectDocument } from './schemas/subject.schema';

@Injectable()
export default class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  create(subject: SubjectDto): Promise<Subject | null> {
    return this.subjectsRepository.create(subject);
  }

  find(
    query: MongoQuery<Subject>,
  ): Promise<Subject | null> | Promise<Subject[] | null> {
    const multi: boolean = query.options?.multi || true;

    if (!multi) {
      return this.subjectsRepository.findOne(query);
    }
    return this.subjectsRepository.find(query);
  }

  update(body: MongoUpdate<SubjectDocument>) {
    if (body.options?.multi) {
      return this.subjectsRepository.updateOne(body);
    }
    return this.subjectsRepository.updateMany(body);
  }

  delete(query: MongoDelete<SubjectDocument>) {
    return this.subjectsRepository.deleteOne(query);
  }
}
