import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { KeyConcept, KeyConceptDocument } from './schemas/keyConcept.schema';
import KeyConceptDto from './dto/keyConcept.dto';

@Injectable()
export default class KeyConceptsRepository {
  constructor(
    @InjectModel(KeyConcept.name)
    private domainModel: Model<KeyConceptDocument>,
  ) {}

  public async create(domain: KeyConceptDto): Promise<KeyConcept | null> {
    const newKeyConcept = await this.domainModel.create(domain);
    return newKeyConcept.toObject();
  }

  public async bulkCreate(keyConcepts: KeyConceptDto[]) {
    await this.domainModel.insertMany(keyConcepts);
  }

  public async find(
    query: MongoQuery<KeyConcept>,
  ): Promise<KeyConcept[] | null> {
    return this.domainModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(
    query: MongoQuery<KeyConcept>,
  ): Promise<KeyConcept | null> {
    return this.domainModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<KeyConcept | null> {
    return this.domainModel.findById(id).lean();
  }

  public async update(
    body: MongoUpdate<KeyConcept>,
  ): Promise<KeyConcept | null> {
    const { filter, update, options } = body;

    return this.domainModel
      .updateMany(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async deleteMany(
    query: MongoDelete<KeyConcept>,
  ): Promise<KeyConcept[] | null> {
    const { filter, options } = query;
    return this.domainModel.deleteMany(filter, options).lean();
  }
}
