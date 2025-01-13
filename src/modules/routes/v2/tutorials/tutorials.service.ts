import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import TutorialDto from './dto/tutorial.dto';
import TutorialsRepository from './tutorials.repository';
import { Tutorial, TutorialDocument } from './schemas/tutorial.schema';

@Injectable()
export default class TutorialsService {
  constructor(private readonly tutorialsRepository: TutorialsRepository) {}

  create(tutorial: TutorialDto): Promise<Tutorial | null> {
    return this.tutorialsRepository.create(tutorial);
  }

  find(
    query: MongoQuery<Tutorial>,
  ): Promise<Tutorial | null> | Promise<Tutorial[] | null> {
    const multi: boolean | undefined = query.options?.multi;

    if (!multi) {
      return this.tutorialsRepository.findOne(query);
    }
    return this.tutorialsRepository.find(query);
  }

  update(body: MongoUpdate<TutorialDocument>) {
    console.log(body);
    if (body.options?.multi) {
      return this.tutorialsRepository.updateOne(body);
    }
    return this.tutorialsRepository.updateMany(body);
  }

  delete(query: MongoDelete<TutorialDocument>) {
    return this.tutorialsRepository.deleteOne(query);
  }
}
