import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Injectable } from '@nestjs/common';
import { KeyConcept } from './schemas/keyConcept.schema';
import KeyConceptDto from './dto/keyConcept.dto';
import KeyConceptsRepository from './keyConcepts.repository';

@Injectable()
export default class KeyConceptsService {
  constructor(private readonly domainsRepository: KeyConceptsRepository) {}

  public async create(domain: KeyConceptDto): Promise<KeyConcept | null> {
    return this.domainsRepository.create(domain);
  }

  public async bulkCreate(keyConcepts: KeyConceptDto[]) {
    await this.domainsRepository.bulkCreate(keyConcepts);
  }

  public async find(
    query: MongoQuery<KeyConcept>,
  ): Promise<KeyConcept[] | null> {
    return this.domainsRepository.find(query);
  }

  public async findOne(
    query: MongoQuery<KeyConcept>,
  ): Promise<KeyConcept | null> {
    return this.domainsRepository.findOne(query);
  }

  public async findById(id: string): Promise<KeyConcept | null> {
    return this.domainsRepository.findById(id);
  }

  public async update(
    body: MongoUpdate<KeyConcept>,
  ): Promise<KeyConcept | null> {
    return this.domainsRepository.update(body);
  }

  public async delete(
    query: MongoDelete<KeyConcept>,
  ): Promise<KeyConcept[] | null> {
    return this.domainsRepository.deleteMany(query);
  }
}
