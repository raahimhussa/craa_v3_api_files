import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import DogDto from './dto/dog.dto';
import DogsRepository from './dogs.repository';
import { Dog } from './schemas/dog.schema';

@Injectable()
export default class DogsService {
  constructor(private readonly dogsRepository: DogsRepository) {}

  public async create(dog: DogDto): Promise<Dog | null> {
    return this.dogsRepository.create(dog);
  }

  public async find(query: MongoQuery<Dog>): Promise<Dog[] | null> {
    return this.dogsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Dog>): Promise<Dog | null> {
    return this.dogsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Dog | null> {
    return this.dogsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Dog>): Promise<Dog | null> {
    return this.dogsRepository.update(body);
  }

  public async delete(query: MongoDelete<Dog>): Promise<Dog[] | null> {
    return this.dogsRepository.deleteMany(query);
  }
}
