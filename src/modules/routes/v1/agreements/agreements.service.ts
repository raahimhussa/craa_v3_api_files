import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import AgreementDto from './dto/agreement.dto';
import AgreementsRepository from './agreements.repository';
import { Agreement, AgreementDocument } from './schemas/agreement.schema';

@Injectable()
export default class AgreementsService {
  constructor(private readonly agreementsRepository: AgreementsRepository) {}

  create(agreement: AgreementDto): Promise<Agreement | null> {
    return this.agreementsRepository.create(agreement);
  }

  find(
    query: MongoQuery<Agreement>,
  ): Promise<Agreement | null> | Promise<Agreement[] | null> {
    const multi: boolean | undefined = query.options?.multi;

    if (!multi) {
      return this.agreementsRepository.findOne(query);
    }
    return this.agreementsRepository.find(query);
  }

  update(body: MongoUpdate<AgreementDocument>) {
    if (body.options?.multi) {
      return this.agreementsRepository.updateOne(body);
    }
    return this.agreementsRepository.updateMany(body);
  }

  delete(query: MongoDelete<AgreementDocument>) {
    return this.agreementsRepository.deleteOne(query);
  }
}
