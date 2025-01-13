import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Dog, DogDocument } from './schemas/dog.schema';
import DogDto from './dto/dog.dto';

@Injectable()
export default class DogsRepository {
  constructor(@InjectModel(Dog.name) private dogModel: Model<DogDocument>) {}

  public async create(dog: DogDto): Promise<Dog | null> {
    const newDog = await this.dogModel.create(dog);
    return newDog.toObject();
  }

  public async find(query: MongoQuery<Dog>): Promise<Dog[] | null> {
    return this.dogModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Dog>): Promise<Dog | null> {
    return this.dogModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Dog | null> {
    return this.dogModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Dog>): Promise<Dog | null> {
    const { filter, update, options } = body;

    return this.dogModel
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

  public async deleteMany(query: MongoDelete<Dog>): Promise<Dog[] | null> {
    const { filter, options } = query;
    return this.dogModel.deleteMany(filter, options).lean();
  }
}
