import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Domain, DomainDocument } from './schemas/domain.schema';
import DomainDto from './dto/domain.dto';

@Injectable()
export default class DomainsRepository {
  constructor(
    @InjectModel(Domain.name) private domainModel: Model<DomainDocument>,
  ) {}

  public async create(domain: DomainDto): Promise<Domain | null> {
    const newDomain = await this.domainModel.create(domain);
    return newDomain.toObject();
  }

  public async find(query: MongoQuery<Domain>): Promise<Domain[] | null> {
    return this.domainModel
      .find(query.filter, query.projection, query.options)
      .sort('seq')
      .lean();
  }

  public async findOne(query: MongoQuery<Domain>): Promise<Domain | null> {
    return this.domainModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Domain | null> {
    return this.domainModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Domain>): Promise<Domain | null> {
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

  public async findMaxNumber() {
    const result = await this.domainModel.aggregate([
      { $group: { _id: null, maxCounter: { $max: '$visibleId' } } },
      { $project: { _id: 0, maxCounter: 1 } },
    ]);

    return result[0]?.maxCounter || 0;
  }

  public async deleteMany(
    query: MongoDelete<Domain>,
  ): Promise<Domain[] | null> {
    const { filter, options } = query;
    return this.domainModel.deleteMany(filter, options).lean();
  }
}
